#!/usr/bin/env tsx
/**
 * Script to regenerate image sizes for all existing media
 *
 * This downloads original images from R2, generates all 7 size variants
 * using Sharp, and updates the imageSizes JSON field.
 *
 * Usage: pnpm regenerate:image-sizes
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { generateImageSizes } from '../src/lib/generateImageSizes'

// Get Cloudflare context using the same method as payload.config.ts
async function getCloudflareContextFromWrangler() {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
      }),
  )
}

async function regenerateImageSizes(payload: any) {
  console.log('🔄 Starting image size regeneration...\n')

  // Get Cloudflare context for R2 access
  const cloudflare = await getCloudflareContextFromWrangler()
  const r2Bucket = cloudflare.env.R2

  try {
    // Get all media items
    const mediaItems = await payload.find({
      collection: 'media',
      limit: 1000,
      pagination: false,
    })

    console.log(`Found ${mediaItems.docs.length} media items\n`)

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const media of mediaItems.docs) {
      const filename = media.filename || 'unknown'

      // Skip if already has imageSizes
      if (media.imageSizes && Object.keys(media.imageSizes).length > 0) {
        console.log(`⏭️  Skipping ${filename} (already has imageSizes)`)
        skippedCount++
        continue
      }

      // Skip if no filename
      if (!filename || filename === 'unknown') {
        console.log(`⚠️  Skipping (no filename)`)
        skippedCount++
        continue
      }

      console.log(`🎨 Processing ${filename}...`)

      try {
        // Download original image from R2 using filename
        const r2Object = await r2Bucket.get(filename)

        if (!r2Object) {
          console.log(`  ❌ File not found in R2: ${filename}`)
          errorCount++
          continue
        }

        // Get image data as ArrayBuffer
        const imageBuffer = await r2Object.arrayBuffer()
        const mimeType = media.mimeType || 'image/jpeg'

        // Generate all size variants
        const sizes = await generateImageSizes(
          imageBuffer,
          filename,
          r2Bucket,
          mimeType
        )

        // Update database with new imageSizes
        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            imageSizes: sizes,
          },
        })

        console.log(`  ✅ Generated ${Object.keys(sizes).length} sizes`)
        successCount++
      } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Regeneration Summary:')
    console.log('='.repeat(60))
    console.log(`Total items:     ${mediaItems.docs.length}`)
    console.log(`Successful:      ${successCount}`)
    console.log(`Errors:          ${errorCount}`)
    console.log(`Skipped:         ${skippedCount}`)
    console.log('='.repeat(60))

    return { total: mediaItems.docs.length, successful: successCount, errors: errorCount, skipped: skippedCount }
  } catch (error) {
    console.error('❌ Regeneration failed:', error)
    throw error
  }
}

async function run() {
  console.log('🚀 Image Size Regeneration Tool\n')

  try {
    const payload = await getPayload({ config: await config })

    const result = await regenerateImageSizes(payload)

    if (result.errors > 0) {
      console.log('\n⚠️  Some images failed to regenerate.')
      console.log('Check the output above for details.')
      process.exit(1)
    } else {
      console.log('\n✅ All images regenerated successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  }
}

run()
