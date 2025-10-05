# Image Processing with jSquash (WASM)

This project uses **jSquash** for image processing instead of Sharp. jSquash is a WASM-based image processing library that works in both Node.js and Cloudflare Workers environments.

## Why WASM Instead of Sharp?

**Sharp** is a native Node.js module that cannot run in Cloudflare Workers' V8 isolate environment. **jSquash** uses WebAssembly, which is supported by both Node.js and Cloudflare Workers.

## How It Works

### 1. Image Upload Flow

When a user uploads an image through PayloadCMS:

1. Image is uploaded to R2 (original file)
2. `beforeChange` hook in `Media.ts` is triggered
3. Hook calls `generateImageSizes()` function
4. Function generates 7 size variants using jSquash
5. All variants are uploaded to R2
6. Metadata for all sizes is stored in a single JSON field

### 2. Image Sizes Generated

All 7 required sizes from the API specification:

```typescript
{
  thumbnail: '400px wide (maintains aspect ratio)',
  thumbnail_small: '200px wide (maintains aspect ratio)',
  webcomic_page: '800px wide (maintains aspect ratio)',
  webcomic_mobile: '400px wide (maintains aspect ratio)',
  cover_image: '600×800 (cover crop)',
  social_preview: '1200×630 (social media, cover crop)',
  avatar: '200×200 (square crop)'
}
```

### 3. Storage Strategy

**Problem**: D1 has a 100 parameter limit per query. PayloadCMS's built-in `imageSizes` creates 6 columns per size (url, width, height, mimeType, fileSize, filename), which would be 42 columns for 7 sizes.

**Solution**: Store all image size metadata in a single JSON field:

```typescript
// Database column: imageSizes (JSON type)
{
  "thumbnail": {
    "url": "/media/image-thumbnail.jpg",
    "width": 400,
    "height": 300,
    "mimeType": "image/jpeg",
    "fileSize": 45678,
    "filename": "image-thumbnail.jpg"
  },
  "thumbnail_small": { ... },
  // ... all other sizes
}
```

## Implementation Files

- `/src/lib/generateImageSizes.ts` - Core image processing logic
- `/src/collections/Media.ts` - PayloadCMS collection with beforeChange hook
- Dependencies: `@jsquash/jpeg`, `@jsquash/png`, `@jsquash/webp`, `@jsquash/resize`

## Testing Locally

1. Start dev server: `pnpm dev`
2. Log into admin: `http://localhost:3333/admin`
3. Upload an image to the Media collection
4. Check console for: `✅ Generated 7 image sizes for [filename]`
5. Verify in R2 that all size variants were created

## Production Deployment

The same code works in Cloudflare Workers without modification. The WASM modules are bundled with the deployment and execute in the Workers runtime.

## Performance Considerations

- WASM image processing is slower than Sharp (native code)
- For large images or high upload volumes, consider:
  - Processing in a background queue
  - Using Cloudflare Images service instead
  - Implementing client-side resizing before upload

## API Response Format

The Media API returns the `imageSizes` JSON field:

```json
{
  "id": "123",
  "filename": "comic-page.jpg",
  "url": "/media/comic-page.jpg",
  "imageSizes": {
    "thumbnail": {
      "url": "/media/comic-page-thumbnail.jpg",
      "width": 400,
      "height": 300,
      "mimeType": "image/jpeg",
      "fileSize": 45678,
      "filename": "comic-page-thumbnail.jpg"
    }
    // ... all other sizes
  }
}
```

Frontend code can access specific sizes:

```javascript
const thumbnailUrl = mediaObject.imageSizes.thumbnail.url
const webcomicPageUrl = mediaObject.imageSizes.webcomic_page.url
```
