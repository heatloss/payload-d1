/**
 * Custom image size generation for Cloudflare Workers using WebAssembly
 *
 * This implementation uses:
 * - @jsquash/jpeg and @jsquash/png for decoding/encoding image formats
 * - @silvia-odwyer/photon-node for fast image resizing via WASM
 *
 * This is the alternative to the Sharp-based implementation for production environments.
 */
import {
  decode as jpegDecode,
  encode as jpegEncode,
} from '@jsquash/jpeg'
import {
  decode as pngDecode,
  encode as pngEncode,
} from '@jsquash/png'
import { PhotonImage, resize } from '@silvia-odwyer/photon'
import type { GeneratedImageSize, ImageSizeConfig } from './generateImageSizes'
import { IMAGE_SIZE_CONFIGS } from './generateImageSizes'

/**
 * Decodes an image buffer into raw pixel data using the appropriate jSquash decoder.
 */
async function decodeImage(buffer: ArrayBuffer, mimeType: string) {
  if (mimeType === 'image/png') {
    return pngDecode(buffer)
  }
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return jpegDecode(buffer)
  }
  throw new Error(`Unsupported mimeType for decoding: ${mimeType}`)
}

/**
 * Encodes raw pixel data back into an image format using jSquash.
 */
async function encodeImage(
  data: Uint8Array,
  width: number,
  height: number,
  mimeType: string,
) {
  // jSquash encoders expect an object that conforms to the standard ImageData interface.
  const imageData = {
    data: new Uint8ClampedArray(data),
    width,
    height,
    colorSpace: 'srgb' as const,
  }

  if (mimeType === 'image/png') {
    return pngEncode(imageData)
  }
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    // Default quality is 75
    return jpegEncode(imageData, { quality: 75 })
  }
  throw new Error(`Unsupported mimeType for encoding: ${mimeType}`)
}

/**
 * Generate all image size variants from a buffer using Photon (WASM)
 */
export async function generateImageSizesWasm(
  imageBuffer: ArrayBuffer,
  originalFilename: string,
  r2Bucket: any, // R2Bucket type
  mimeType: string = 'image/jpeg',
): Promise<Record<string, GeneratedImageSize>> {
  console.log(`🎨 (WASM) Generating image sizes for ${originalFilename}...`)
  const sizes: Record<string, GeneratedImageSize> = {}

  try {
    // 1. Decode the image to raw RGBA pixels
    const decodedImage = await decodeImage(imageBuffer, mimeType)

    // 2. Create a PhotonImage instance from the raw data
    const photonImage = new PhotonImage(
      // Photon expects a Uint8Array, but jSquash decodes to a Uint8ClampedArray.
      // We must convert it before passing it to the constructor.
      new Uint8Array(decodedImage.data),
      decodedImage.width,
      decodedImage.height,
    )

    const baseFilename = originalFilename.replace(/\.[^.]+$/, '') // Remove extension
    const ext = mimeType.includes('png') ? 'png' : 'jpg'

    for (const config of IMAGE_SIZE_CONFIGS) {
      try {
        console.log(`  ⏳ (WASM) Generating ${config.name}...`)

        // 3. Resize the image using Photon
        const resizedPhotonImage = resize(
          photonImage,
          config.width,
          config.height || Math.round((decodedImage.height / decodedImage.width) * config.width),
          4, // 4 = Lanczos3 (good quality for reduction)
        )

        // 4. Encode the resized raw data back to an image format
        const resizedBuffer = await encodeImage(
          resizedPhotonImage.get_raw_pixels(),
          resizedPhotonImage.get_width(),
          resizedPhotonImage.get_height(),
          mimeType,
        )

        // 5. Upload to R2
        const sizeFilename = `${baseFilename}-${config.name}.${ext}`
        const r2Key = sizeFilename

        console.log(`    (WASM) Uploading to R2: ${r2Key} (${resizedBuffer.byteLength} bytes)`)
        await r2Bucket.put(r2Key, resizedBuffer, {
          httpMetadata: { contentType: mimeType },
        })

        // 6. Store metadata
        sizes[config.name] = {
          url: `/api/media/file/${sizeFilename}`,
          width: resizedPhotonImage.get_width(),
          height: resizedPhotonImage.get_height(),
          mimeType: mimeType,
          fileSize: resizedBuffer.byteLength,
          filename: sizeFilename,
        }

        console.log(`  ✅ (WASM) Generated ${config.name}: ${resizedPhotonImage.get_width()}x${resizedPhotonImage.get_height()}`)
      } catch (error: any) {
        console.error(`  ❌ (WASM) Error generating ${config.name} size:`, error)
      }
    }
  } catch (error: any) {
    console.error('❌ (WASM) Failed to process image:', error)
    // If top-level decoding fails, return empty object
    return {}
  }

  return sizes
}
