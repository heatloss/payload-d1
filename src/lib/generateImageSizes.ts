/**
 * Custom image size generation for D1
 *
 * D1 has a 100 parameter limit per query, so we can't use PayloadCMS's
 * built-in imageSizes (which creates 6 columns per size).
 *
 * Instead, we generate sizes manually and store metadata as JSON.
 *
 * Note: This uses Sharp which only works in Node.js.
 * For Cloudflare Workers production, you'll need to use jSquash or Cloudflare Images.
 */

import sharp from 'sharp'

export interface ImageSizeConfig {
  name: string
  width: number
  height?: number
  fit?: 'inside' | 'cover' | 'contain'
}

export interface GeneratedImageSize {
  url: string
  width: number
  height: number
  mimeType: string
  fileSize: number
  filename: string
}

export const IMAGE_SIZE_CONFIGS: ImageSizeConfig[] = [
  {
    name: 'thumbnail',
    width: 400,
    fit: 'inside',
  },
  {
    name: 'thumbnail_small',
    width: 200,
    fit: 'inside',
  },
  {
    name: 'webcomic_page',
    width: 800,
    fit: 'inside',
  },
  {
    name: 'webcomic_mobile',
    width: 400,
    fit: 'inside',
  },
  {
    name: 'cover_image',
    width: 600,
    height: 800,
    fit: 'cover',
  },
  {
    name: 'social_preview',
    width: 1200,
    height: 630,
    fit: 'cover',
  },
  {
    name: 'avatar',
    width: 200,
    height: 200,
    fit: 'cover',
  },
]

/**
 * Generate all image size variants from a buffer using Sharp
 */
export async function generateImageSizes(
  imageBuffer: Buffer | ArrayBuffer,
  originalFilename: string,
  r2Bucket: any, // R2Bucket type
  mimeType: string = 'image/jpeg',
  basePath: string = 'media'
): Promise<Record<string, GeneratedImageSize>> {
  const sizes: Record<string, GeneratedImageSize> = {}

  // Convert ArrayBuffer to Buffer if needed
  const buffer = imageBuffer instanceof Buffer
    ? imageBuffer
    : Buffer.from(new Uint8Array(imageBuffer))

  const baseFilename = originalFilename.replace(/\.[^.]+$/, '') // Remove extension
  const ext = mimeType.includes('png') ? 'png' : 'jpg'

  for (const config of IMAGE_SIZE_CONFIGS) {
    try {
      let transformer = sharp(buffer)

      // Apply resize based on config
      if (config.height) {
        transformer = transformer.resize(config.width, config.height, {
          fit: config.fit || 'cover',
          position: 'centre',
        })
      } else {
        transformer = transformer.resize(config.width, undefined, {
          fit: config.fit || 'inside',
          position: 'centre',
        })
      }

      // Convert to buffer
      const resizedBuffer = await transformer.toBuffer()
      const metadata = await sharp(resizedBuffer).metadata()

      // Generate filename for this size
      const sizeFilename = `${baseFilename}-${config.name}.${ext}`
      // Store directly in root, not in subdirectory (PayloadCMS R2 plugin expects flat structure)
      const r2Key = sizeFilename

      // Upload to R2
      console.log(`    Uploading to R2: ${r2Key} (${resizedBuffer.length} bytes)`)
      try {
        // Read more: https://github.com/cloudflare/workers-sdk/issues/6047#issuecomment-2691217843
        // When using local R2 (Wrangler), we need to wrap Node.js Buffers in Blob
        // Check if we're in a Node.js environment (not Workers)
        const isNodeEnv = typeof process !== 'undefined' && process.versions?.node
        const uploadData = isNodeEnv
          ? new Blob([new Uint8Array(resizedBuffer)])
          : resizedBuffer

        await r2Bucket.put(r2Key, uploadData, {
          httpMetadata: {
            contentType: mimeType,
          },
        })
        console.log(`    Upload successful`)
      } catch (uploadError: any) {
        console.error(`    Upload failed:`, uploadError.message || uploadError)
        throw uploadError
      }

      // Store metadata with PayloadCMS media API URL
      sizes[config.name] = {
        url: `/api/media/file/${sizeFilename}`,
        width: metadata.width || config.width,
        height: metadata.height || config.height || 0,
        mimeType: mimeType,
        fileSize: resizedBuffer.length,
        filename: sizeFilename,
      }

      console.log(`  ✅ Generated ${config.name}: ${metadata.width}×${metadata.height} (${resizedBuffer.length} bytes)`)
    } catch (error: any) {
      console.error(`  ❌ Error generating ${config.name} size:`, error)
      // Continue with other sizes even if one fails
    }
  }

  return sizes
}
