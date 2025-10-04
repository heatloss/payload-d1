import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'email', 'role', 'status'],
    group: 'Admin',
    hidden: ({ user }) => user?.role !== 'admin', // Hide from non-admin users
  },
  auth: {
    verify: false, // Disable email verification for local development
    forgotPassword: {
      generateEmailHTML: ({ token }) => {
        return `<p>Reset your password by clicking <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/reset-password?token=${token}">here</a>.</p>`
      },
    },
  },
  access: {
    // Only admins can create new users directly
    create: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    // Users can read their own profile, admins can read all
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Users can update their own profile, admins can update anyone
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: {
        hidden: true, // Hide from admin form since it's auto-generated
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // Generate UUID if not provided (for new records)
            if (!value) {
              return crypto.randomUUID()
            }
            return value
          }
        ]
      }
    },
    {
      name: 'displayName',
      type: 'text',
      required: false, // Temporarily optional for setup
      label: 'Display Name',
      admin: {
        description: 'Public name shown to readers and other creators',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'reader',
      options: [
        {
          label: 'Reader',
          value: 'reader',
        },
        {
          label: 'Creator',
          value: 'creator',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'User permission level',
      },
      access: {
        // Only admins can change user roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Banned',
          value: 'banned',
        },
      ],
      admin: {
        position: 'sidebar',
      },
      access: {
        // Only admins can change user status
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    // Creator-specific profile fields
    {
      name: 'creatorProfile',
      type: 'group',
      label: 'Creator Profile',
      admin: {
        condition: (data, siblingData) => {
          return ['creator', 'editor', 'admin'].includes(siblingData?.role)
        },
      },
      fields: [
        {
          name: 'bio',
          type: 'textarea',
          label: 'Biography',
          admin: {
            description: 'Tell readers about yourself and your work',
            rows: 4,
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Profile Picture',
          admin: {
            description: 'Your profile picture for comic pages and author info',
          },
        },
        {
          name: 'website',
          type: 'text',
          label: 'Website',
          admin: {
            description: 'Your personal website or portfolio',
          },
        },
        {
          name: 'socialLinks',
          type: 'group',
          label: 'Social Media Links',
          admin: {
            collapsed: true,
          },
          fields: [
            {
              name: 'bluesky',
              type: 'text',
              label: 'Bluesky Handle',
              admin: {
                description: 'Your Bluesky handle (e.g., username.bsky.social)',
              },
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'Instagram Username',
              admin: {
                description: 'Without the @ symbol',
              },
            },
            {
              name: 'tumblr',
              type: 'text',
              label: 'Tumblr URL',
              admin: {
                description: 'Full Tumblr blog URL',
              },
            },
            {
              name: 'discord',
              type: 'text',
              label: 'Discord Server',
              admin: {
                description: 'Your Discord server invite URL (e.g., https://discord.gg/ps2JtZA)',
              },
            },
            {
              name: 'patreon',
              type: 'text',
              label: 'Patreon URL',
              admin: {
                description: 'Full Patreon page URL',
              },
            },
            {
              name: 'kofi',
              type: 'text',
              label: 'Ko-fi Username',
              admin: {
                description: 'Without the @ symbol',
              },
            },
          ],
        },
        {
          name: 'preferences',
          type: 'group',
          label: 'Creator Preferences',
          admin: {
            collapsed: true,
          },
          fields: [
            {
              name: 'emailNotifications',
              type: 'group',
              label: 'Email Notifications',
              fields: [
                {
                  name: 'newComments',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'New comments on my comics',
                },
                {
                  name: 'weeklyStats',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Weekly reader statistics',
                },
                {
                  name: 'systemUpdates',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'System updates and announcements',
                },
              ],
            },
            {
              name: 'privacySettings',
              type: 'group',
              label: 'Privacy Settings',
              fields: [
                {
                  name: 'showEmail',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Show email address publicly',
                },
                {
                  name: 'showStatsPublic',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Allow readers to see comic statistics',
                },
              ],
            },
          ],
        },
      ],
    },
    // Reader-specific fields
    {
      name: 'readerProfile',
      type: 'group',
      label: 'Reader Profile',
      admin: {
        condition: (data, siblingData) => {
          return ['reader'].includes(siblingData?.role)
        },
      },
      fields: [
        {
          name: 'favoriteGenres',
          type: 'select',
          hasMany: true,
          label: 'Favorite Genres',
          options: [
            { label: 'Adventure', value: 'adventure' },
            { label: 'Comedy', value: 'comedy' },
            { label: 'Drama', value: 'drama' },
            { label: 'Fantasy', value: 'fantasy' },
            { label: 'Horror', value: 'horror' },
            { label: 'Mystery', value: 'mystery' },
            { label: 'Romance', value: 'romance' },
            { label: 'Sci-Fi', value: 'sci-fi' },
            { label: 'Slice of Life', value: 'slice-of-life' },
            { label: 'Superhero', value: 'superhero' },
            { label: 'Thriller', value: 'thriller' },
            { label: 'Western', value: 'western' },
          ],
          admin: {
            description: 'Help us recommend comics you might enjoy',
          },
        },
        {
          name: 'readingPreferences',
          type: 'group',
          label: 'Reading Preferences',
          fields: [
            {
              name: 'hideNSFW',
              type: 'checkbox',
              defaultValue: true,
              label: 'Hide NSFW content',
            },
            {
              name: 'autoSubscribe',
              type: 'checkbox',
              defaultValue: false,
              label: 'Auto-subscribe to comics I comment on',
            },
          ],
        },
      ],
    },
    // Account metadata
    {
      name: 'accountMeta',
      type: 'group',
      label: 'Account Information',
      admin: {
        collapsed: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'joinedDate',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'lastActive',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'totalComics',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            condition: (data, siblingData) => {
              return ['creator', 'editor', 'admin'].includes(siblingData?.role)
            },
          },
        },
        {
          name: 'totalPages',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            condition: (data, siblingData) => {
              return ['creator', 'editor', 'admin'].includes(siblingData?.role)
            },
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Set join date on creation
        if (operation === 'create') {
          data.accountMeta = {
            ...data.accountMeta,
            joinedDate: new Date(),
          }
        }
        
        // Update last active timestamp
        data.accountMeta = {
          ...data.accountMeta,
          lastActive: new Date(),
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        // Update user statistics when users change - but prevent recursion
        if (['creator', 'editor', 'admin'].includes(doc.role) && req.payload && operation !== 'create') {
          // Only update stats if this isn't already a stats update and if relevant user data changed
          const statsChanged = previousDoc?.accountMeta?.totalComics !== doc.accountMeta?.totalComics ||
                               previousDoc?.accountMeta?.totalPages !== doc.accountMeta?.totalPages
          
          // Only run if this is NOT a stats update and role/status might affect comic visibility
          const relevantChange = previousDoc?.role !== doc.role || 
                                 previousDoc?.status !== doc.status
          
          if (!statsChanged && relevantChange) {
            try {
              // Count comics created by this user
              const comics = await req.payload.find({
                collection: 'comics',
                where: {
                  author: { equals: doc.id },
                },
              })
              
              // Count pages in comics created by this user  
              const pages = await req.payload.find({
                collection: 'pages',
                where: {
                  'comic.author': { equals: doc.id },
                },
              })
              
              // Only update if the counts actually changed
              if (comics.totalDocs !== doc.accountMeta?.totalComics || 
                  pages.totalDocs !== doc.accountMeta?.totalPages) {
                await req.payload.update({
                  collection: 'users',
                  id: doc.id,
                  data: {
                    accountMeta: {
                      ...doc.accountMeta,
                      totalComics: comics.totalDocs,
                      totalPages: pages.totalDocs,
                    }
                  },
                })
              }
            } catch (error) {
              console.error('Error updating user statistics:', error)
            }
          }
        }
      },
    ],
  },
}
