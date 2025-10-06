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

// Conditional import of Sharp (only available in Node.js, not Cloudflare Workers)
// We'll load Sharp dynamically at runtime when needed
let sharp: any = null

async function loadSharp() {
  if (sharp === null) {
    try {
      // Dynamic import to avoid build-time errors in Cloudflare Workers
      sharp = (await import('sharp')).default
    } catch (_error) {
      // Sharp not available in this environment (likely Cloudflare Workers)
      sharp = false // false means we tried and failed
    }
  }
  return sharp || null
}

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

import { generateImageSizesWasm } from './generateImageSizesWasm'

/**
 * Generate all image size variants from a buffer.
 * This function acts as a router, using Sharp in Node.js environments
 * and a WASM-based solution in Cloudflare Workers.
 */
export async function generateImageSizes(
  imageBuffer: Buffer | ArrayBuffer,
  originalFilename: string,
  r2Bucket: any, // R2Bucket type
  mimeType: string = 'image/jpeg',
  basePath: string = 'media'
): Promise<Record<string, GeneratedImageSize>> {
  // Try to load Sharp; if it fails, we're likely in a Cloudflare environment.
  const sharpInstance = await loadSharp()

  // If Sharp is not available, delegate to the WASM implementation
  if (!sharpInstance) {
    console.warn('Sharp not available, attempting to use WASM-based image resizer.')
    const buffer = imageBuffer instanceof Buffer ? imageBuffer.buffer : imageBuffer
    return generateImageSizesWasm(
      buffer,
      originalFilename,
      r2Bucket,
      mimeType
    )
  }

  // --- Sharp-based implementation (for local/Node.js environment) ---
  console.log(`🎨 (Sharp) Generating image sizes for ${originalFilename}...`)
  const sizes: Record<string, GeneratedImageSize> = {}

  const buffer = imageBuffer instanceof Buffer
    ? imageBuffer
    : Buffer.from(new Uint8Array(imageBuffer))

  const baseFilename = originalFilename.replace(/\.[^.]+$/, '') // Remove extension
  const ext = mimeType.includes('png') ? 'png' : 'jpg'

  for (const config of IMAGE_SIZE_CONFIGS) {
    try {
      let transformer = sharpInstance(buffer)

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
      const metadata = await sharpInstance(resizedBuffer).metadata()

      const sizeFilename = `${baseFilename}-${config.name}.${ext}`
      const r2Key = sizeFilename

      console.log(`    (Sharp) Uploading to R2: ${r2Key} (${resizedBuffer.length} bytes)`)
      try {
        const isNodeEnv = typeof process !== 'undefined' && process.versions?.node
        const uploadData = isNodeEnv
          ? new Blob([new Uint8Array(resizedBuffer)])
          : resizedBuffer

        await r2Bucket.put(r2Key, uploadData, {
          httpMetadata: {
            contentType: mimeType,
          },
        })
      } catch (uploadError: any) {
        console.error(`    (Sharp) Upload failed:`, uploadError.message || uploadError)
        throw uploadError
      }

      sizes[config.name] = {
        url: `/api/media/file/${sizeFilename}`,
        width: metadata.width || config.width,
        height: metadata.height || config.height || 0,
        mimeType: mimeType,
        fileSize: resizedBuffer.length,
        filename: sizeFilename,
      }

      console.log(`  ✅ (Sharp) Generated ${config.name}: ${metadata.width}×${metadata.height} (${resizedBuffer.length} bytes)`)
    } catch (error: any) {
      console.error(`  ❌ (Sharp) Error generating ${config.name} size:`, error)
    }
  }

  return sizes
}
