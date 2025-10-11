# Workers Authentication Issue - Media Upload

## Issue Summary

Media uploads fail in the Cloudflare Workers preview environment with "Unauthorized" error. The root cause is that POST requests lose user authentication context, while GET requests work correctly.

## Symptoms

- **Error**: `Error: Unauthorized` when attempting to upload media files
- **When**: POST to `/admin/collections/media/create` in preview environment
- **Environment**: Cloudflare Workers via `pnpm preview` (OpenNext Cloudflare)
- **Not affected**: GET requests work fine, user can log in and navigate

## Root Cause

POST requests are losing the authentication cookie/session context in the Workers runtime. Debug logging shows:

### Working GET requests:
```
🔐 Media create access check: {
  hasUser: true,
  userId: '61104b13-126a-4e8d-bc90-d7dcde4fb576',
  userRole: 'creator',
  userEmail: 'mike@the-ottoman.com'
}
🔐 Access result: true
```

### Failing POST requests:
```
🔐 Media create access check: {
  hasUser: false,
  userId: undefined,
  userRole: undefined,
  userEmail: undefined
}
🔐 Access result: null
```

## Technical Details

### Environment Configuration
- **Payload CMS**: 3.58.0
- **Next.js**: 15.5.4
- **OpenNext Cloudflare**: 1.9.1
- **Database**: D1 (remote mode)
- **Storage**: R2 (local mode in preview)

### Debug Code Added

In `src/collections/Media.ts` (lines 12-24):
```typescript
create: ({ req: { user } }) => {
  // Debug logging for access control
  console.log('🔐 Media create access check:', {
    hasUser: !!user,
    userId: user?.id,
    userRole: user?.role,
    userEmail: user?.email,
  })

  const hasAccess = user && ['creator', 'editor', 'admin'].includes(user.role)
  console.log('🔐 Access result:', hasAccess)

  return hasAccess
},
```

### Payload Configuration

Current config in `src/payload.config.ts`:
```typescript
export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Comics, Chapters, Pages, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  cookiePrefix: 'payload',
  // ... plugins
})
```

**Note**: Payload CMS 3.x does not support top-level `cookies` configuration. Cookie handling is internal to the auth system.

## Investigation Timeline

1. **Initial hypothesis**: Image resizing without sharp causing issues
   - **Result**: Not the issue. Error occurs before save, during file selection

2. **Second hypothesis**: R2 storage adapter issues
   - **Result**: R2 adapter code looks correct, no "Unauthorized" errors thrown

3. **Third hypothesis**: Access control configuration
   - **Result**: Access control is correct, user has 'creator' role which is allowed

4. **Fourth hypothesis (CONFIRMED)**: Cookie/session loss in Workers POST requests
   - **Result**: Debug logs clearly show user context missing only on POST requests

## Attempted Fixes

### 1. Conditional imageSizes (Not the issue)
Made `imageSizes` only load in development:
```typescript
upload: {
  ...(process.env.NODE_ENV === 'development' ? {
    imageSizes: [ /* ... */ ],
  } : {}),
}
```

### 2. Cookie configuration (Not supported by Payload)
Attempted to add cookie config - TypeScript compiler rejected it:
```
Type error: Object literal may only specify known properties,
and 'cookies' does not exist in type 'Config'.
```

## Known Issues & Context

### Wrangler Authentication Timeout
- Wrangler authentication expires after a few minutes of inactivity
- Build fails with: "You must be logged in to use wrangler dev in remote mode"
- **Workaround**: Run `wrangler login` frequently during development

### OpenNext + Workers Cookie Handling
This appears to be an issue with how OpenNext Cloudflare handles cookie forwarding for POST requests in the Workers runtime. The middleware may not be correctly forwarding authentication cookies from the request headers to Payload's auth system.

## Possible Solutions (Not Yet Attempted)

### 1. Test in Development Mode
```bash
pnpm dev
```
Test if media upload works in Node.js dev mode to confirm this is Workers-specific.

### 2. Check OpenNext Issues
Search OpenNext Cloudflare repository for:
- Cookie handling issues
- Authentication middleware problems
- POST request header forwarding

### 3. Middleware Investigation
Check if there's OpenNext middleware configuration that controls cookie forwarding:
- `.open-next/server-functions/default/handler.mjs`
- Look for cookie parsing/forwarding code
- Check if POST requests need special handling

### 4. Alternative Auth Approaches
- Use JWT in Authorization header instead of cookies
- Would require changes to Payload auth configuration
- May need custom middleware to extract token from headers

### 5. Check Wrangler Configuration
Review `wrangler.jsonc` for any settings that might affect cookie handling in preview mode.

## Next Steps

1. **Test in dev mode** - Confirm Workers-specific issue
2. **Search OpenNext repo** - Look for similar cookie/auth issues
3. **Examine Workers output** - Check actual HTTP requests/responses in browser DevTools
4. **Contact OpenNext/Payload** - May need to file issue if this is a known limitation

## Files Modified

- `src/collections/Media.ts` - Added debug logging to access control
- `src/payload.config.ts` - Removed sharp, attempted cookie config (reverted)

## Stack Trace

```
Error: Unauthorized
  at q (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1929:12169)
  at async t4 (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1225:2704)
  at null.<anonymous> (async file:///Users/mike/Sites/payload-d1/.wrangler/tmp/dev-aOJFDn/worker.js:151075:73)
  at async t22 (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1224:16135)
  at async nQ (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1231:25663)
  at async n2 (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1929:88400)
  at async iP.handleResponse (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1234:36489)
  at async q2 (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1931:1670)
  at async M (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:1931:6919)
  at async NextNodeServer.renderToResponseWithComponentsImpl (file:///Users/mike/Sites/payload-d1/.open-next/server-functions/default/handler.mjs:24:33025)
```

## Date

Issue documented: October 9, 2025
Last updated: October 9, 2025
