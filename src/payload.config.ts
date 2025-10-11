// storage-adapter-import-placeholder
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Comics } from './collections/Comics'
import { Chapters } from './collections/Chapters'
import { Pages } from './collections/Pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isNextBuild = process.argv.some(arg => arg.includes('next') && (arg.includes('build') || process.argv.includes('build')))
const cloudflareRemoteBindings = process.env.NODE_ENV === 'production' && !isNextBuild
const isCommandLineOperation = process.argv.find((value) => value.match(/^(generate|migrate):?/))

const cloudflare =
  isCommandLineOperation || !cloudflareRemoteBindings
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Comics, Chapters, Pages, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  // sharp only works in Node.js, not in Cloudflare Workers
  // In development, sharp is automatically used if available as a devDependency
  cookiePrefix: 'payload',
  plugins: [
    payloadCloudPlugin(),
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: {
        media: true,
      },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        experimental: { remoteBindings: cloudflareRemoteBindings },
      } satisfies GetPlatformProxyOptions),
  )
}
