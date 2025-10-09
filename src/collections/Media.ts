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
    // Payload automatically generates these sizes and stores them in flattened DB columns
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
    beforeChange: [
      async ({ data, req }) => {
        // Extract technical metadata from uploaded file
        if (req.file) {
          data.technicalMeta = {
            ...data.technicalMeta,
            fileSize: req.file.size,
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
