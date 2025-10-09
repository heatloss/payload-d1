import type { CollectionConfig } from 'payload'
import { generateImageSizes } from '../lib/generateImageSizes'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Admin', // Move to Admin group for file management
    // Temporarily show to all users to check thumbnails
    // hidden: ({ user }) => user?.role !== 'admin', // Only admins see raw file management
  },
  access: {
    create: ({ req: { user } }) => {
      return user && ['creator', 'editor', 'admin'].includes(user.role)
    },
    read: () => true, // Media files are public
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'editor') return true
      if (!user?.id) return false
      // Creators can only edit media they uploaded
      return {
        uploadedBy: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'editor') return true
      if (!user?.id) return false
      // Creators can only delete media they uploaded
      return {
        uploadedBy: {
          equals: user.id,
        },
      }
    },
  },
  upload: {
    staticDir: 'media',
    // NOTE: Image sizes disabled due to D1's 100 parameter limit
    // Sizes are generated via custom hook and stored as JSON
    imageSizes: [],
    mimeTypes: ['image/*'],
    disableLocalStorage: true, // R2 only, no local storage
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            // Only generate ID on create, not on update
            if (operation === 'create' && !value) {
              // Use crypto.randomUUID() which is available in both Node and Workers
              return crypto.randomUUID()
            }
            return value
          }
        ]
      }
    },
    {
      name: 'imageSizesPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/fields/ImageSizesUI#ImageSizesUI',
        },
      },
    },
    {
      name: 'imageSizes',
      type: 'json',
      label: 'Generated Image Sizes (Raw Data)',
      admin: {
        readOnly: true,
        description: 'Auto-generated image variants stored as JSON',
        components: {
          Cell: '@/components/fields/ImageSizesCell#ImageSizesCell',
        },
      },
      hooks: {
        afterRead: [
          ({ value }) => {
            // Handle legacy/corrupt data where imageSizes is the literal string "image_sizes"
            if (typeof value === 'string' && value === 'image_sizes') {
              console.warn('⚠️  Found corrupt imageSizes data (literal string "image_sizes"), returning null')
              return null
            }
            // If it's a string but looks like JSON, try parsing it
            if (typeof value === 'string') {
              try {
                return JSON.parse(value)
              } catch (e) {
                console.warn('⚠️  Failed to parse imageSizes JSON string:', e)
                return null
              }
            }
            return value
          }
        ],
        beforeChange: [
          ({ value }) => {
            // Ensure we're storing proper JSON, not a string
            if (value && typeof value === 'object') {
              // D1 adapter should handle this, but being explicit
              return value
            }
            return value
          }
        ]
      }
    },
    {
      name: 'alt',
      type: 'text',
      required: false, // Not required - alt text belongs to pages, not raw images
      label: 'Alt Text',
      admin: {
        description: 'Optional alt text (for webcomics, alt text is usually set on the page, not the raw image)',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional caption or description for this image',
      },
    },
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'General Image', value: 'general' },
        { label: 'Comic Page', value: 'comic_page' },
        { label: 'Comic Cover', value: 'comic_cover' },
        { label: 'Chapter Cover', value: 'chapter_cover' },
        { label: 'User Avatar', value: 'user_avatar' },
        { label: 'Website Asset', value: 'website_asset' },
      ],
      admin: {
        position: 'sidebar',
        description: 'What type of image is this?',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: false, // Changed to false to prevent validation errors when user context is missing
      label: 'Uploaded By',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ req, operation, value }) => {
            // Auto-assign current user as uploader on create
            if (operation === 'create' && !value) {
              // Safely access user ID
              if (req.user?.id) {
                return req.user.id
              }
              // If no user context, log warning but don't fail
              console.warn('⚠️  Media upload: No user context available in beforeValidate hook')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      label: 'Public Image',
      admin: {
        position: 'sidebar',
        description: 'Whether this image can be viewed by the public',
      },
    },
    // Metadata for comic pages specifically
    {
      name: 'comicMeta',
      type: 'group',
      label: 'Comic Metadata',
      admin: {
        condition: (data, siblingData) => {
          return ['comic_page', 'comic_cover', 'chapter_cover'].includes(siblingData?.mediaType)
        },
      },
      fields: [
        {
          name: 'relatedComic',
          type: 'relationship',
          relationTo: 'comics',
          label: 'Related Comic',
          admin: {
            description: 'Which comic this image belongs to (leave blank to select later)',
          },
          // Removed async defaultValue - it was causing issues in Workers runtime
          // Users can manually select the comic when uploading
        },
        {
          name: 'pageNumber',
          type: 'number',
          label: 'Page Number',
          admin: {
            description: 'If this is a comic page, what page number?',
            condition: (data, siblingData) => {
              return siblingData?.mediaType === 'comic_page'
            },
          },
        },
        {
          name: 'chapterNumber',
          type: 'number',
          label: 'Chapter Number',
          admin: {
            description: 'If this is a chapter cover, what chapter number?',
            condition: (data, siblingData) => {
              return siblingData?.mediaType === 'chapter_cover'
            },
          },
        },
        {
          name: 'isNSFW',
          type: 'checkbox',
          defaultValue: false,
          label: 'Contains Adult Content (NSFW)',
          admin: {
            description: 'Check if this image contains mature/adult content',
          },
        },
      ],
    },
    // Technical metadata
    {
      name: 'technicalMeta',
      type: 'group',
      label: 'Technical Information',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'originalDimensions',
          type: 'group',
          label: 'Original Dimensions',
          fields: [
            {
              name: 'width',
              type: 'number',
              admin: { readOnly: true },
            },
            {
              name: 'height',
              type: 'number',
              admin: { readOnly: true },
            },
          ],
        },
        {
          name: 'fileSize',
          type: 'number',
          label: 'File Size (bytes)',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'colorProfile',
          type: 'text',
          label: 'Color Profile',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // Usage tracking
    {
      name: 'usage',
      type: 'group',
      label: 'Usage Statistics',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times this image has been viewed',
          },
        },
        {
          name: 'downloadCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times this image has been downloaded',
          },
        },
        {
          name: 'usedInPages',
          type: 'relationship',
          relationTo: ['comics', 'pages', 'chapters'],
          hasMany: true,
          required: false,
          admin: {
            readOnly: true,
            description: 'Content that uses this image',
          },
        },
      ],
    },
  ],
  hooks: {
    afterDelete: [
      async ({ doc }) => {
        // Clean up generated image size files from R2
        if (doc.imageSizes && typeof doc.imageSizes === 'object') {
          try {
            const cloudflare = await getCloudflareContext({ async: true })
            const r2Bucket = cloudflare.env.R2

            const sizes = Object.values(doc.imageSizes)
            console.log(`🗑️  Deleting ${sizes.length} generated image sizes for ${doc.filename}`)

            for (const size of sizes) {
              if (size && typeof size === 'object' && 'filename' in size && typeof size.filename === 'string') {
                try {
                  await r2Bucket.delete(size.filename)
                  console.log(`   ✅ Deleted ${size.filename}`)
                } catch (error) {
                  console.error(`   ❌ Failed to delete ${size.filename}:`, error)
                }
              }
            }
          } catch (error) {
            console.error('❌ Error cleaning up image sizes:', error)
          }
        }
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        // Extract technical metadata from uploaded file
        if (req.file) {
          data.technicalMeta = {
            ...data.technicalMeta,
            fileSize: req.file.size,
          }

          // Generate image size variants (D1 parameter limit workaround)
          if (operation === 'create' && req.file.data) {
            try {
              const cloudflare = await getCloudflareContext({ async: true })
              const r2Bucket = cloudflare.env.R2

              // Ensure we have a proper Buffer
              const imageBuffer = Buffer.isBuffer(req.file.data)
                ? req.file.data
                : Buffer.from(req.file.data)

              const mimeType = req.file.mimetype || 'image/jpeg'

              console.log(`🎨 Generating image sizes for ${req.file.name} (${mimeType}, ${imageBuffer.length} bytes)...`)
              console.log(`   R2 bucket available: ${!!r2Bucket}`)

              const sizes = await generateImageSizes(
                imageBuffer,
                req.file.name || 'image.jpg',
                r2Bucket,
                mimeType
              )

              data.imageSizes = sizes
              console.log(`✅ Generated ${Object.keys(sizes).length} image sizes for ${req.file.name}`)
            } catch (error) {
              console.error('❌ Error generating image sizes:', error)
              // Don't fail the upload if size generation fails
            }
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
