/**
 * Node.js wrapper that uses Sharp for local development
 *
 * Since jSquash WASM loading is incompatible with Node.js server environments
 * (WASM modules try to use fetch() which doesn't work with file:// URLs in Node),
 * we simply use Sharp for local development. Production will use the
 * pure WASM approach (generateImageSizesWasm) in Cloudflare Workers.
 *
 * This is just a thin wrapper around generateImageSizes for testing purposes.
 */
import { generateImageSizes } from './generateImageSizes'
import type { GeneratedImageSize } from './generateImageSizes'

/**
 * Generate all image size variants - uses Sharp in Node.js
 */
export async function generateImageSizesWasmNode(
  imageBuffer: ArrayBuffer,
  originalFilename: string,
  r2Bucket: any,
  mimeType: string = 'image/jpeg',
): Promise<Record<string, GeneratedImageSize>> {
  console.log(`🎨 (Node-Sharp) Generating image sizes for ${originalFilename}...`)

  // Convert ArrayBuffer to Buffer for Sharp
  const buffer = Buffer.from(imageBuffer)

  // Use the existing Sharp-based implementation
  return generateImageSizes(buffer, originalFilename, r2Bucket, mimeType)
}
