import type { CollectionConfig } from 'payload'

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
      // Creators can only edit media they uploaded
      return {
        uploadedBy: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'editor') return true
      // Creators can only delete media they uploaded
      return {
        uploadedBy: {
          equals: user?.id,
        },
      }
    },
  },
  upload: {
    staticDir: 'media',
    staticURL: '/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined, // Let height be determined by aspect ratio
        position: 'centre',
        fit: 'inside', // Preserve aspect ratio, don't crop
      },
      {
        name: 'thumbnail_small',
        width: 200,
        height: undefined, // Smaller version for compact displays
        position: 'centre',
        fit: 'inside',
      },
      {
        name: 'webcomic_page',
        width: 800,
        height: undefined,
        position: 'centre',
        fit: 'inside',
      },
      {
        name: 'webcomic_mobile',
        width: 400,
        height: undefined,
        position: 'centre',
        fit: 'inside',
      },
      {
        name: 'cover_image',
        width: 600,
        height: 800,
        position: 'centre',
        fit: 'cover',
      },
      {
        name: 'social_preview',
        width: 1200,
        height: 630,
        position: 'centre',
        fit: 'cover',
      },
      {
        name: 'avatar',
        width: 200,
        height: 200,
        position: 'centre',
        fit: 'cover',
      },
    ],
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumbnail', // Should now be aspect-ratio preserving
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
          ({ value }) => {
            if (!value) {
              return crypto.randomUUID()
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
      required: true,
      label: 'Uploaded By',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      defaultValue: ({ user }) => user?.id,
      hooks: {
        beforeValidate: [
          ({ req, operation, value }) => {
            // Auto-assign current user as uploader
            if (operation === 'create' && !value && req.user) {
              return req.user.id
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
        collapsed: true,
      },
      fields: [
        {
          name: 'relatedComic',
          type: 'relationship',
          relationTo: 'comics',
          label: 'Related Comic',
          admin: {
            description: 'Which comic this image belongs to',
          },
          defaultValue: async ({ user, req }) => {
            // Auto-select comic if user has only one
            if (user && req.payload) {
              try {
                const userComics = await req.payload.find({
                  collection: 'comics',
                  where: {
                    author: { equals: user.id }
                  },
                  limit: 2 // Only need to check if there's exactly 1
                })
                
                if (userComics.docs.length === 1) {
                  return userComics.docs[0].id
                }
              } catch (error) {
                console.error('Error getting user comics for default:', error)
              }
            }
            return undefined
          },
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
        collapsed: true,
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
        collapsed: true,
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
    beforeChange: [
      ({ data, req }) => {
        // Extract technical metadata from uploaded file
        if (req.file) {
          data.technicalMeta = {
            ...data.technicalMeta,
            fileSize: req.file.size,
            // Additional metadata would be extracted here in a real implementation
          }
        }
        
        // Usage tracking will be handled automatically by page/comic relationships
        
        return data
      },
    ],
  },
  timestamps: true,
}
