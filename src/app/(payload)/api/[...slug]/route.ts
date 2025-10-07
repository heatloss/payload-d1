/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

// Wrap handlers with detailed error logging
const wrapHandler = (handler: any, method: string) => {
  return async (req: Request, context: any) => {
    try {
      console.log(`[${method}] ${req.url}`)
      const result = await handler(req, context)
      return result
    } catch (error: any) {
      console.error(`[${method}] Error in API route:`, {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        cause: error?.cause,
        url: req.url,
        digest: error?.digest,
      })
      throw error
    }
  }
}

const restGet = REST_GET(config)
const restPost = REST_POST(config)
const restDelete = REST_DELETE(config)
const restPatch = REST_PATCH(config)
const restPut = REST_PUT(config)
const restOptions = REST_OPTIONS(config)

export const GET = wrapHandler(restGet, 'GET')
export const POST = wrapHandler(restPost, 'POST')
export const DELETE = wrapHandler(restDelete, 'DELETE')
export const PATCH = wrapHandler(restPatch, 'PATCH')
export const PUT = wrapHandler(restPut, 'PUT')
export const OPTIONS = wrapHandler(restOptions, 'OPTIONS')
