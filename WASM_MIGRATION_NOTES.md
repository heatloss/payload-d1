# WASM Image Resizing Migration - Progress Notes

## Date: October 5, 2025

### Goal
Migrate from Sharp (Node.js) to WASM-based image resizing (Photon + jSquash) for Cloudflare Workers compatibility.

### Branch
`wasm-image-resizing`

### What We Accomplished

1. **Fixed Build Issues**
   - Added `outputFileTracingRoot: process.cwd()` to `next.config.ts` to fix OpenNext standalone path issues
   - Changed from `@silvia-odwyer/photon-node` to `@silvia-odwyer/photon` (web-compatible version)
   - Updated `serverExternalPackages` to use the correct package name
   - Fixed TypeScript errors with Buffer to ArrayBuffer conversion

2. **Created Staging Environment**
   - Set up `payload-d1-staging` D1 database: `e039de67-aabf-4e3c-b594-5d2fbd50fd38`
   - Set up `payload-d1-staging` R2 bucket
   - Added staging environment config to `wrangler.jsonc`
   - Successfully deployed to: https://payload-d1-staging.mike-17c.workers.dev

3. **Ported `comic-with-chapters` Endpoint**
   - Successfully migrated the endpoint from chimera-cms to payload-d1
   - Available at: `GET /api/comic-with-chapters/:comicId`
   - Returns complete nested structure: comic → chapters → pages

4. **Updated Media Collection**
   - Modified `src/collections/Media.ts` to use WASM image sizing in production
   - Uses environment check: `process.env.NODE_ENV === 'production'`
   - Production: `generateImageSizesWasm()` (Photon + jSquash)
   - Development: `generateImageSizes()` (Sharp)
   - Removed async `defaultValue` function from `relatedComic` field (was causing errors)

### Current Issues

#### Primary Issue: 403 Forbidden on Media Uploads

**Symptoms:**
- Browser console shows: `POST /api/media?depth=0&fallback-locale=null 403 (Forbidden)`
- Server logs show: "Ok" (200 response)
- No media items are created in the database
- User gets "You are not allowed to perform this action" notification

**Mismatch:** Server thinks it's returning 200, but client receives 403.

**Possible Causes:**
1. **R2 Bucket Permissions** - The `@payloadcms/storage-r2` plugin may need additional configuration for Workers
2. **CORS Configuration** - Response headers might not be properly set for uploads
3. **WASM Processing Errors** - Image processing might be failing silently, causing transaction rollback
4. **Payload R2 Plugin Compatibility** - The plugin might not be fully compatible with the Workers environment

**Additional Errors Observed:**
- RSC (React Server Components) route errors: "Error: Unauthorized" on `/admin/collections/media/create`
- These appear to be client-side validation errors that occur before the actual API call

### Files Modified

1. `src/payload.config.ts`
   - Added `comic-with-chapters` endpoint

2. `next.config.ts`
   - Added `outputFileTracingRoot: process.cwd()`
   - Changed `experimental.serverComponentsExternalPackages` to `serverExternalPackages`
   - Updated package name from `photon-node` to `photon`

3. `src/collections/Media.ts`
   - Imported `generateImageSizesWasm`
   - Added environment-based image processing logic
   - Removed async `defaultValue` from `relatedComic` field
   - Fixed Buffer to ArrayBuffer conversion with type cast

4. `src/lib/generateImageSizesWasm.ts`
   - Changed import from `@silvia-odwyer/photon-node` to `@silvia-odwyer/photon`

5. `wrangler.jsonc`
   - Added staging environment configuration

6. `package.json`
   - Removed `@silvia-odwyer/photon-node`
   - Added `@silvia-odwyer/photon@^0.3.3`

### Testing Status

✅ **Working:**
- Staging environment deploys successfully
- Admin UI loads without 500 errors
- Database migrations run correctly
- User authentication works (admin role confirmed)
- `comic-with-chapters` endpoint available (not yet tested)

❌ **Not Working:**
- Media uploads fail with 403 Forbidden
- No media items created in database
- Image size generation not yet tested (can't get past upload stage)

### Next Steps

1. **Debug 403 Forbidden Error**
   - Check R2 bucket permissions and bindings
   - Verify `@payloadcms/storage-r2` plugin configuration for Workers
   - Add detailed error logging to the `beforeChange` hook in Media.ts
   - Test if uploads work without image size generation

2. **Test WASM Image Processing**
   - Once uploads work, verify `generateImageSizesWasm()` runs successfully
   - Check if all 7 image sizes are generated correctly
   - Verify images are uploaded to R2 bucket
   - Compare image quality with Sharp-based resizing

3. **Local Testing**
   - Test WASM approach in local dev environment first
   - Verify it can coexist with Sharp (dev) and Photon (production)

4. **Alternative Approaches**
   - Consider using Cloudflare Images API instead of client-side processing
   - Investigate if Payload's R2 plugin needs a Workers-specific adapter

### Environment Details

**Staging:**
- URL: https://payload-d1-staging.mike-17c.workers.dev
- D1 Database: `payload-d1-staging` (e039de67-aabf-4e3c-b594-5d2fbd50fd38)
- R2 Bucket: `payload-d1-staging`
- Deploy command: `CLOUDFLARE_ENV=staging pnpm run deploy`

**Local:**
- Port: 3333
- Database: Local D1 simulation via Wrangler

### Dependencies

```json
{
  "@jsquash/jpeg": "^1.6.0",
  "@jsquash/png": "^3.1.1",
  "@jsquash/resize": "^2.1.0",
  "@jsquash/webp": "^1.5.0",
  "@silvia-odwyer/photon": "^0.3.3"
}
```

### Resources

- Kai.Bi's hybrid Photon/jSquash approach: https://github.com/ccbikai/cloudflare-worker-image
- Photon WASM docs: https://silvia-odwyer.github.io/photon/
- jSquash docs: https://github.com/jamsinclair/jSquash

---

## Session End: October 5, 2025, ~10:20 PM

**Status:** Staging environment is operational but media uploads are blocked by 403 Forbidden errors. The WASM image processing code is in place but untested. Further debugging needed to resolve upload permissions before we can verify the WASM approach works.
