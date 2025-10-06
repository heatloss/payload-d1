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
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:3333',
    'http://localhost:8888',  // Frontend dev server
  ],
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:3333',
    'http://localhost:8888',  // Frontend dev server
  ],
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
  endpoints: [
    {
      path: '/comic-with-chapters/:comicId',
      method: 'get',
      handler: async (req) => {
        const { comicId } = req.routeParams

        if (typeof comicId !== 'string') {
          return Response.json(
            { error: 'Invalid Comic ID format' },
            { status: 400 },
          )
        }

        try {
          // Get the comic
          const comic = await req.payload.findByID({
            collection: 'comics',
            id: comicId,
          })

          if (!comic) {
            return Response.json(
              { error: 'Comic not found' },
              { status: 404 }
            )
          }

          // Get all chapters for this comic, ordered by chapter order
          const chapters = await req.payload.find({
            collection: 'chapters',
            where: {
              comic: { equals: comicId }
            },
            sort: 'order',
            limit: 1000, // Adjust based on your needs
          })

          // For each chapter, get all its pages
          const chaptersWithPages = await Promise.all(
            chapters.docs.map(async (chapter) => {
              const pages = await req.payload.find({
                collection: 'pages',
                where: {
                  chapter: { equals: chapter.id }
                },
                sort: 'chapterPageNumber',
                limit: 1000, // Adjust based on expected pages per chapter
              })

              return {
                ...chapter,
                pages: pages.docs
              }
            })
          )

          return Response.json({
            ...comic,
            chapters: chaptersWithPages
          })

        } catch (error) {
          console.error('Error fetching comic with chapters:', error)
          return Response.json(
            { error: 'Failed to fetch comic data' },
            { status: 500 }
          )
        }
      },
    },
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
