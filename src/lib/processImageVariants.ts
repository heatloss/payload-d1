import { decode as decodeJpeg, encode as encodeJpeg } from '@jsquash/jpeg'
import { decode as decodePng, encode as encodePng } from '@jsquash/png'
import { decode as decodeWebp, encode as encodeWebp } from '@jsquash/webp'
import resize from '@jsquash/resize'

export interface ImageVariant {
  name: string
  width: number
  height?: number
  fit?: 'stretch' | 'contain'
  quality?: number
}

export interface ProcessedVariant {
  name: string
  buffer: ArrayBuffer
  width: number
  height: number
  filename: string
}

const IMAGE_VARIANTS: ImageVariant[] = [
  { name: 'thumbnail', width: 400, quality: 85 },
  { name: 'thumbnail_small', width: 200, quality: 85 },
  { name: 'webcomic_page', width: 800, quality: 90 },
  { name: 'webcomic_mobile', width: 400, quality: 85 },
  { name: 'cover_image', width: 600, height: 800, fit: 'contain', quality: 85 },
  { name: 'social_preview', width: 1200, height: 630, fit: 'contain', quality: 85 },
  { name: 'avatar', width: 200, height: 200, fit: 'contain', quality: 85 },
]

/**
 * Detect image format from buffer
 */
function detectImageFormat(buffer: ArrayBuffer): 'jpeg' | 'png' | 'webp' | null {
  const arr = new Uint8Array(buffer.slice(0, 12))

  // JPEG: FF D8 FF
  if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
    return 'jpeg'
  }

  // PNG: 89 50 4E 47
  if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
    return 'png'
  }

  // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
      arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) {
    return 'webp'
  }

  return null
}

/**
 * Decode image based on format
 */
async function decodeImage(buffer: ArrayBuffer, format: string): Promise<ImageData> {
  switch (format) {
    case 'jpeg':
    case 'jpg':
      return decodeJpeg(buffer)
    case 'png':
      return decodePng(buffer)
    case 'webp':
      return decodeWebp(buffer)
    default:
      throw new Error(`Unsupported image format: ${format}`)
  }
}

/**
 * Encode image based on format
 */
async function encodeImage(
  imageData: ImageData,
  format: string,
  quality: number = 85
): Promise<ArrayBuffer> {
  switch (format) {
    case 'jpeg':
    case 'jpg':
      return encodeJpeg(imageData, { quality })
    case 'png':
      return encodePng(imageData)
    case 'webp':
      return encodeWebp(imageData, { quality })
    default:
      throw new Error(`Unsupported output format: ${format}`)
  }
}

/**
 * Process image and generate all variants
 *
 * @param imageBuffer - Original image buffer
 * @param originalFilename - Original filename (to determine output format)
 * @returns Array of processed variants with buffers and metadata
 */
export async function processImageVariants(
  imageBuffer: ArrayBuffer,
  originalFilename: string
): Promise<ProcessedVariant[]> {
  const startTime = Date.now()
  console.log(`[jSquash] Processing image: ${originalFilename}`)

  // Detect format from buffer
  const detectedFormat = detectImageFormat(imageBuffer)
  if (!detectedFormat) {
    throw new Error('Unable to detect image format')
  }

  console.log(`[jSquash] Detected format: ${detectedFormat}`)

  // Decode original image
  const decodeStart = Date.now()
  const originalImageData = await decodeImage(imageBuffer, detectedFormat)
  console.log(`[jSquash] Decoded in ${Date.now() - decodeStart}ms (${originalImageData.width}x${originalImageData.height})`)

  // Generate all variants
  const processedVariants: ProcessedVariant[] = []

  for (const variant of IMAGE_VARIANTS) {
    const variantStart = Date.now()

    // Calculate dimensions
    let targetWidth = variant.width
    let targetHeight = variant.height

    if (!targetHeight) {
      // Maintain aspect ratio
      const aspectRatio = originalImageData.height / originalImageData.width
      targetHeight = Math.round(targetWidth * aspectRatio)
    }

    // Resize image
    const resizedImageData = await resize(originalImageData, {
      width: targetWidth,
      height: targetHeight,
      method: 'lanczos3', // High quality resizing
      fitMethod: variant.fit || 'stretch',
    })

    // Encode to buffer
    const variantBuffer = await encodeImage(
      resizedImageData,
      detectedFormat,
      variant.quality || 85
    )

    // Generate filename
    const ext = originalFilename.split('.').pop()
    const basename = originalFilename.replace(`.${ext}`, '')
    const variantFilename = `${basename}-${variant.name}.${ext}`

    processedVariants.push({
      name: variant.name,
      buffer: variantBuffer,
      width: resizedImageData.width,
      height: resizedImageData.height,
      filename: variantFilename,
    })

    console.log(
      `[jSquash] Generated ${variant.name}: ${resizedImageData.width}x${resizedImageData.height} in ${Date.now() - variantStart}ms`
    )
  }

  const totalTime = Date.now() - startTime
  console.log(`[jSquash] Processed ${processedVariants.length} variants in ${totalTime}ms`)

  return processedVariants
}
