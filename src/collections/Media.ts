import type { CollectionConfig } from 'payload'
import { processImageVariants } from '../lib/processImageVariants'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Sharp not supported on Workers, but jSquash works!
    crop: false,
    focalPoint: false,

    // Define image size metadata (actual generation happens in afterChange hook)
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'thumbnail_small', width: 200 },
      { name: 'webcomic_page', width: 800 },
      { name: 'webcomic_mobile', width: 400 },
      { name: 'cover_image', width: 600, height: 800 },
      { name: 'social_preview', width: 1200, height: 630 },
      { name: 'avatar', width: 200, height: 200 },
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only process file uploads on create
        if (operation !== 'create' || !req.file) {
          return data
        }

        console.log(`[Media Hook] Processing variants for upload: ${req.file.name}`)

        try {
          // Get the file buffer directly from the upload
          const imageBuffer = req.file.data

          console.log(`[Media Hook] File buffer size: ${imageBuffer.byteLength} bytes`)

          // Process all variants using jSquash
          const variants = await processImageVariants(imageBuffer, req.file.name)

          console.log(`[Media Hook] Generated ${variants.length} variants, uploading to R2...`)

          // Build sizes object for PayloadCMS
          const sizes: Record<string, any> = {}
          const r2PublicUrl = process.env.R2_PUBLIC_URL || 'http://localhost:3000/api/media/file'

          // Upload each variant to R2 and build sizes metadata
          for (const variant of variants) {
            await req.context?.env?.R2?.put(variant.filename, variant.buffer, {
              httpMetadata: {
                contentType: req.file.mimeType || 'image/jpeg',
              },
            })

            // Add to sizes object
            sizes[variant.name] = {
              width: variant.width,
              height: variant.height,
              mimeType: req.file.mimeType,
              filesize: variant.buffer.byteLength,
              filename: variant.filename,
              url: `${r2PublicUrl}/${variant.filename}`,
            }

            console.log(`[Media Hook] Uploaded variant: ${variant.name} (${variant.width}x${variant.height})`)
          }

          console.log('[Media Hook] All variants processed and uploaded successfully')

          // Add sizes to the data that will be saved
          return {
            ...data,
            sizes,
          }
        } catch (error) {
          console.error('[Media Hook] Error processing variants:', error)
          console.error(error)
          // Don't fail the upload if variant generation fails
        }

        return data
      },
    ],
  },
}
