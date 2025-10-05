# Payload D1 Webcomic CMS - API Specification

## Overview

A webcomic content management system built on Payload CMS v3.x, deployed on Cloudflare Workers with D1 database and R2 storage. This API provides complete backend functionality for managing webcomic series, chapters, pages, users, and media assets with role-based access control.

## Base URLs

- **Local Development**: `http://localhost:3333`
- **Production**: `https://payload-d1.mike-17c.workers.dev` (your deployment URL)

**Note**: All Payload CMS endpoints use the `/api/*` prefix.

## Infrastructure

- **Database**: Cloudflare D1 (SQLite, edge-replicated)
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Hosting**: Cloudflare Workers (serverless edge functions)

## Authentication

### Endpoints

- `POST /api/users/login` - Login with email/password
- `POST /api/users/logout` - Logout current user
- `GET /api/users/me` - Get current user information
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `POST /api/register` - Create new user account (public registration)
- `POST /api/request-creator-role` - Upgrade from reader to creator role

### Request/Response Examples

```json
// Login Request
POST /api/users/login
{
  "email": "creator@example.com",
  "password": "password123"
}

// Login Response
{
  "message": "Logged in successfully",
  "user": {
    "id": "db280621-5b7c-41f0-902f-b2e0c09074bb",
    "email": "creator@example.com",
    "role": "creator",
    "displayName": "Creator Name"
  },
  "token": "jwt_token_here"
}

// Registration Request
POST /api/register
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "displayName": "New User"
}

// Registration Response
{
  "message": "User created successfully",
  "user": {
    "id": "4ab0590b-cfc0-4200-a311-968b6aff24f4",
    "email": "newuser@example.com",
    "role": "reader",
    "displayName": "New User",
    "status": "active"
  }
}

// Creator Role Upgrade Request (requires authentication)
POST /api/request-creator-role
Authorization: Bearer jwt_token_here

// Creator Role Upgrade Response
{
  "message": "Creator role granted successfully",
  "user": {
    "id": "4ab0590b-cfc0-4200-a311-968b6aff24f4",
    "email": "newuser@example.com",
    "role": "creator",
    "displayName": "New User"
  }
}
```

## User Roles & Permissions

- **Reader**: Can view published content only
- **Creator**: Can create/edit their own comics, pages, and media
- **Editor**: Can edit all content, assist creators
- **Admin**: Full system access, user management

## Collections & Endpoints

### Comics (`/comics`)

Webcomic series management.

#### Endpoints

- `GET /api/comics` - List comics (filtered by permissions)
- `POST /api/comics` - Create new comic series
- `GET /api/comics/:id` - Get specific comic details
- `PATCH /api/comics/:id` - Update comic
- `DELETE /api/comics/:id` - Delete comic (admin only)

#### Data Structure

```json
{
  "id": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e",
  "title": "My Awesome Comic",
  "slug": "my-awesome-comic",
  "description": "A brief summary of the comic series",
  "author": "4ab0590b-cfc0-4200-a311-968b6aff24f4", // Relationship to Users collection (UUID)
  "coverImage": "6e6b5807-1591-464e-bc97-c31529171d77", // Relationship to Media collection (UUID)
  "status": "draft|published|hiatus|completed",
  "publishSchedule": "daily|weekly|twice-weekly|monthly|irregular|completed|hiatus",
  "genres": ["adventure", "comedy", "fantasy"], // Array of genre strings
  "tags": ["custom", "tags", "here"], // Array of custom tags
  "isNSFW": false,

  // SEO & Metadata
  "seoMeta": {
    "metaTitle": "Custom SEO title",
    "metaDescription": "Custom SEO description",
    "socialImage": "6e6b5807-1591-464e-bc97-c31529171d77"
  },

  // Statistics (read-only)
  "stats": {
    "totalPages": 42,
    "totalChapters": 5,
    "lastPagePublished": "2024-01-15T10:30:00Z"
  },

  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Pages (`/pages`)

Individual comic page management.

#### Endpoints

- `GET /api/pages` - List pages (with filtering by comic, chapter, status)
- `POST /api/pages` - Create new page
- `GET /api/pages/:id` - Get specific page
- `PATCH /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page (admin only)

#### Query Parameters

- `?where[comic][equals]=comic_id` - Filter by comic
- `?where[chapter][equals]=chapter_id` - Filter by chapter
- `?where[status][equals]=published` - Filter by status
- `?sort=globalPageNumber` - Sort by global page order
- `?sort=chapterPageNumber` - Sort by chapter page order
- `?limit=20` - Limit results

#### Data Structure

```json
{
  "id": "1015f3b4-5476-476c-af05-9d3aa3a42d2f",
  "comic": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e", // Relationship to Comics collection (UUID)
  "chapter": "9d8d13b6-c1f7-4f60-90eb-7488f602b660", // Optional relationship to Chapters collection (UUID)
  "chapterPageNumber": 0, // Page number within chapter (0 = chapter cover, 1+ = regular pages)
  "globalPageNumber": 1, // Auto-calculated sequential number across entire comic (1-based)
  "title": "Optional page title",
  "displayTitle": "Chapter Title - Page 0: Optional Title", // Auto-generated
  "pageImage": "6e6b5807-1591-464e-bc97-c31529171d77", // Required - main comic page image (UUID)
  "pageExtraImages": [
    // Optional array for multi-image pages
    {
      "image": "52cb52f7-c78b-409b-88ef-cc4a3a2ce00d", // Image UUID
      "altText": "Description of this specific image"
    }
  ],
  "thumbnailImage": "52cb52f7-c78b-409b-88ef-cc4a3a2ce00d", // Optional - auto-populated from pageImage if empty (UUID)
  "altText": "Description of what happens in this page", // Optional accessibility description
  "authorNotes": "Author commentary and notes (supports Markdown)",
  "status": "draft|scheduled|published",
  "publishedDate": "2024-01-15T10:30:00Z",

  // Navigation (read-only, auto-generated)
  "navigation": {
    "previousPage": "b2a9a0f7-d9d8-466d-9a52-c84bd4d4f576|null",
    "nextPage": "391fec8e-db76-4ad5-b1b2-9aa8d9b1f588|null",
    "isFirstPage": true,
    "isLastPage": false
  },

  // SEO
  "seoMeta": {
    "slug": "page-1-title",
    "metaTitle": "Custom page SEO title",
    "metaDescription": "Custom page description"
  },

  // Statistics (read-only)
  "stats": {
    "viewCount": 1337,
    "firstViewed": "2024-01-15T10:35:00Z",
    "lastViewed": "2024-01-20T14:22:00Z"
  },

  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Chapters (`/chapters`)

Organizational containers for comic pages, grouped by story arcs or sections.

#### Endpoints

- `GET /api/chapters` - List chapters (sorted by order)
- `POST /api/chapters` - Create new chapter
- `GET /api/chapters/:id` - Get specific chapter
- `PATCH /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter (admin only)
- `POST /move-chapter` - Reorder chapters (see Custom Endpoints)

#### Data Structure

```json
{
  "id": "9d8d13b6-c1f7-4f60-90eb-7488f602b660",
  "comic": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e", // Relationship to Comics collection (UUID)
  "title": "The Beginning", // Human-readable chapter title
  "order": 1, // Display order (auto-assigned, reorderable via API)
  "description": "Optional chapter summary",
  "coverImage": "6e6b5807-1591-464e-bc97-c31529171d77", // Optional chapter cover art (UUID)

  // SEO
  "seoMeta": {
    "slug": "the-beginning",
    "metaTitle": "Chapter 1: The Beginning",
    "metaDescription": "Chapter description"
  },

  // Statistics (read-only)
  "stats": {
    "pageCount": 15,
    "firstPageNumber": 1,
    "lastPageNumber": 15
  },

  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Users (`/users`)

User management with role-based profiles.

#### Endpoints

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update own profile
- `GET /api/users/:id` - Get user profile (admins only)
- `PATCH /api/users/:id` - Update user (admins only)

#### Data Structure

```json
{
  "id": "4ab0590b-cfc0-4200-a311-968b6aff24f4",
  "email": "creator@example.com",
  "displayName": "Creator Name",
  "role": "creator|editor|admin|reader",
  "status": "active|inactive|banned",

  // Creator-specific fields (when role is creator/editor/admin)
  "creatorProfile": {
    "bio": "Tell readers about yourself",
    "avatar": "6e6b5807-1591-464e-bc97-c31529171d77",
    "website": "https://mywebsite.com",
    "socialLinks": {
      "bluesky": "username.bsky.social",
      "instagram": "username",
      "tumblr": "https://username.tumblr.com",
      "discord": "https://discord.gg/server-invite",
      "patreon": "https://patreon.com/username",
      "kofi": "username"
    },
    "preferences": {
      "emailNotifications": {
        "newComments": true,
        "weeklyStats": true,
        "systemUpdates": true
      },
      "privacySettings": {
        "showEmail": false,
        "showStatsPublic": false
      }
    }
  },

  // Reader-specific fields (when role is reader)
  "readerProfile": {
    "favoriteGenres": ["fantasy", "adventure"],
    "readingPreferences": {
      "hideNSFW": true,
      "autoSubscribe": false
    }
  },

  // Account metadata (read-only)
  "accountMeta": {
    "joinedDate": "2024-01-01T00:00:00Z",
    "lastActive": "2024-01-20T14:22:00Z",
    "totalComics": 2, // For creators only
    "totalPages": 45 // For creators only
  },

  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

### Media (`/media`)

File upload and image management with automatic thumbnail generation.

#### Endpoints

- `GET /api/media` - List media files
- `POST /api/media` - Upload new file (automatically generates 7 thumbnail sizes)
- `GET /api/media/:id` - Get specific media details
- `PATCH /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete file (automatically cleans up all thumbnails)
- `GET /api/media/file/:filename` - Access media file directly

#### Upload Endpoint

```javascript
// Upload file
POST /api/media
Content-Type: multipart/form-data

// Form data:
file: [binary file data]
alt: "Alt text for accessibility"
mediaType: "comic_page|comic_cover|chapter_cover|user_avatar|general"
```

**Automatic Processing on Upload:**
- Original image uploaded to R2 storage
- 7 thumbnail sizes generated using Sharp (local) or Cloudflare Images (production)
- All sizes stored in single JSON field to work around D1's 100 parameter limit
- Metadata includes dimensions, file sizes, and URLs for each variant

#### Data Structure

```json
{
  "id": "6e6b5807-1591-464e-bc97-c31529171d77",
  "filename": "comic-page-001.jpg",
  "alt": "Optional alt text (for webcomics, alt text is usually set on the page)", // Not required
  "caption": "Optional image caption",
  "mediaType": "comic_page|comic_cover|chapter_cover|user_avatar|website_asset|general",
  "uploadedBy": "4ab0590b-cfc0-4200-a311-968b6aff24f4", // Auto-assigned to current user (UUID)
  "isPublic": true,

  // File details
  "url": "/api/media/file/comic-page-001.jpg",
  "mimeType": "image/jpeg",

  // Generated thumbnail sizes (stored in JSON field)
  "imageSizes": {
    "thumbnail": {
      "url": "/api/media/file/comic-page-001-thumbnail.jpg",
      "width": 400,
      "height": 657, // Maintains aspect ratio
      "mimeType": "image/jpeg",
      "fileSize": 60395,
      "filename": "comic-page-001-thumbnail.jpg"
    },
    "thumbnail_small": {
      "url": "/api/media/file/comic-page-001-thumbnail_small.jpg",
      "width": 200,
      "height": 328,
      "mimeType": "image/jpeg",
      "fileSize": 16074,
      "filename": "comic-page-001-thumbnail_small.jpg"
    },
    "webcomic_page": {
      "url": "/api/media/file/comic-page-001-webcomic_page.jpg",
      "width": 800,
      "height": 1313,
      "mimeType": "image/jpeg",
      "fileSize": 227660,
      "filename": "comic-page-001-webcomic_page.jpg"
    },
    "webcomic_mobile": {
      "url": "/api/media/file/comic-page-001-webcomic_mobile.jpg",
      "width": 400,
      "height": 657,
      "mimeType": "image/jpeg",
      "fileSize": 60395,
      "filename": "comic-page-001-webcomic_mobile.jpg"
    },
    "cover_image": {
      "url": "/api/media/file/comic-page-001-cover_image.jpg",
      "width": 600,
      "height": 800,
      "mimeType": "image/jpeg",
      "fileSize": 108921,
      "filename": "comic-page-001-cover_image.jpg"
    },
    "social_preview": {
      "url": "/api/media/file/comic-page-001-social_preview.jpg",
      "width": 1200,
      "height": 630,
      "mimeType": "image/jpeg",
      "fileSize": 179913,
      "filename": "comic-page-001-social_preview.jpg"
    },
    "avatar": {
      "url": "/api/media/file/comic-page-001-avatar.jpg",
      "width": 200,
      "height": 200,
      "mimeType": "image/jpeg",
      "fileSize": 10179,
      "filename": "comic-page-001-avatar.jpg"
    }
  },

  // Comic-specific metadata (when mediaType is comic-related)
  "comicMeta": {
    "relatedComic": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e",
    "pageNumber": 1, // For comic_page type
    "chapterNumber": 1, // For chapter_cover type
    "isNSFW": false
  },

  // Technical metadata (read-only)
  "technicalMeta": {
    "originalDimensions": {
      "width": 1600,
      "height": 2400
    },
    "fileSize": 1024000, // bytes
    "colorProfile": "sRGB"
  },

  // Usage statistics (read-only)
  "usage": {
    "viewCount": 500,
    "downloadCount": 25,
    "usedInPages": ["1015f3b4-5476-476c-af05-9d3aa3a42d2f", "b2a9a0f7-d9d8-466d-9a52-c84bd4d4f576"] // References to content using this image (UUIDs)
  },

  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Extended API Endpoints

Chimera CMS provides two types of custom endpoints beyond the standard Payload collections:

### Architecture Overview

**Payload CMS Extensions** (`/api/*`): Simple extensions to Payload's core functionality

- Authentication helpers
- Data aggregation for performance
- Simple content management utilities
- System maintenance tasks

**Business Logic Operations** (direct paths): Complex multi-step operations

- Batch processing with file uploads
- Complex data transformations
- Multi-collection operations with extensive error handling
- Operations requiring file system access

---

## Payload CMS Extensions (`/api/*`)

These endpoints extend Payload's built-in functionality and inherit CORS configuration automatically.

### Comic Data Aggregation

#### Get Comic with Chapters and Pages (`GET /comic-with-chapters/:comicId`)

Retrieve a complete comic with all its chapters and each chapter's pages in a single request. This is the optimal endpoint for frontend applications that need to render a complete comic reader interface.

```json
// Request
GET /api/comic-with-chapters/c8410e79-a8e3-4fba-aefe-63fce4c2c35e
Authorization: Bearer jwt_token (optional - affects access to unpublished content)

// Response
{
  "id": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e",
  "title": "My Awesome Comic",
  "slug": "my-awesome-comic",
  "description": "A brief summary of the comic series",
  "author": "4ab0590b-cfc0-4200-a311-968b6aff24f4",
  "coverImage": "6e6b5807-1591-464e-bc97-c31529171d77",
  "status": "published",
  // ... all other comic fields ...

  "chapters": [
    {
      "id": "9d8d13b6-c1f7-4f60-90eb-7488f602b660",
      "title": "The Beginning",
      "order": 1,
      "description": "Chapter 1 description",
      "coverImage": "6e6b5807-1591-464e-bc97-c31529171d77",
      // ... all other chapter fields ...

      "pages": [
        {
          "id": "1015f3b4-5476-476c-af05-9d3aa3a42d2f",
          "chapterPageNumber": 0, // Chapter cover page
          "globalPageNumber": 1, // Sequential numbering (1-based)
          "title": null,
          "pageImage": "6e6b5807-1591-464e-bc97-c31529171d77",
          "altText": "Chapter 1 cover showing...",
          "status": "published",
          // ... all other page fields ...
        },
        {
          "id": "b2a9a0f7-d9d8-466d-9a52-c84bd4d4f576",
          "chapterPageNumber": 1, // First regular page
          "globalPageNumber": 2, // Sequential numbering continues
          "title": "The Hero Awakens",
          "pageImage": "52cb52f7-c78b-409b-88ef-cc4a3a2ce00d",
          "altText": "Our hero wakes up in a mysterious forest...",
          "status": "published",
          // ... all other page fields ...
        }
        // ... more pages
      ]
    },
    {
      "id": "2a32a4d1-83ba-4e9c-9dda-a598086e7cf2",
      "title": "The Journey Begins",
      "order": 2,
      // ... chapter data with pages array ...
    }
    // ... more chapters
  ]
}
```

**Features:**

- Returns complete nested structure in one request
- Chapters are sorted by `order` field
- Pages within each chapter are sorted by `chapterPageNumber`
- Respects user permissions (unpublished content filtered for non-creators)
- Includes all fields from comics, chapters, and pages collections

### Chapter Management

#### Move Chapter (`POST /move-chapter`)

Reorder chapters by moving one chapter up or down in the sequence.

```json
// Request
POST /move-chapter
Authorization: Bearer jwt_token
{
  "chapterId": "9d8d13b6-c1f7-4f60-90eb-7488f602b660",
  "direction": "up" // or "down"
}

// Response
{
  "message": "Chapter moved up successfully",
  "swappedWith": "Chapter Title That Got Swapped"
}
```

#### Bulk Reorder Chapters (`POST /reorder-chapters`)

Reorder all chapters for a comic in one atomic operation.

```json
// Request
POST /reorder-chapters
Authorization: Bearer jwt_token
{
  "comicId": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e",
  "chapterIds": ["25463ebf-fb53-4ffe-ab68-a3d9f5980b12", "9d8d13b6-c1f7-4f60-90eb-7488f602b660", "2a32a4d1-83ba-4e9c-9dda-a598086e7cf2"] // New order
}

// Response
{
  "message": "Chapters reordered successfully",
  "updatedChapters": 3
}
```

### Media Management

#### Regenerate Thumbnails (`POST /regenerate-thumbnails`)

Regenerate all thumbnail sizes for existing media (useful after thumbnail config changes).

```json
// Request
POST /regenerate-thumbnails
Authorization: Bearer jwt_token
{
  "mediaIds": ["6e6b5807-1591-464e-bc97-c31529171d77", "52cb52f7-c78b-409b-88ef-cc4a3a2ce00d"] // Optional: specific IDs, or all if empty
}

// Response
{
  "message": "Thumbnail regeneration completed",
  "summary": {
    "total": 15,
    "successful": 14,
    "errors": 1
  },
  "results": [
    {
      "id": "6e6b5807-1591-464e-bc97-c31529171d77",
      "filename": "comic-page-001.jpg",
      "status": "success"
    }
    // ... more results
  ]
}
```

#### Cleanup Missing Media (`POST /cleanup-missing-media`)

Remove database records for media files that no longer exist on disk.

```json
// Request
POST /cleanup-missing-media
Authorization: Bearer jwt_token

// Response
{
  "message": "Media cleanup completed",
  "summary": {
    "total": 20,
    "deleted": 3,
    "kept": 17,
    "orphaned": 0
  }
}
```

### Content Creation Helpers

#### Create Next Page (`POST /api/create-next-page`)

Create the next sequential page for a comic with auto-incremented page number.

```json
// Request
POST /api/create-next-page
Authorization: Bearer jwt_token
{
  "pageId": "1015f3b4-5476-476c-af05-9d3aa3a42d2f" // Reference page to increment from
}

// Response
{
  "message": "Next page created successfully",
  "nextPage": {
    "id": "391fec8e-db76-4ad5-b1b2-9aa8d9b1f588",
    "chapterPageNumber": 2,
    "globalPageNumber": 15
  },
  "editUrl": "/admin/collections/pages/391fec8e-db76-4ad5-b1b2-9aa8d9b1f588"
}
```

---

## Business Logic Operations (Direct Paths)

These endpoints handle complex multi-step operations and require explicit CORS configuration for cross-origin requests.

### Batch Processing

#### Bulk Create Pages (`POST /bulk-create-pages`)

Upload multiple images and create draft pages for each one in a single operation.

```json
// Request (multipart/form-data)
POST /bulk-create-pages
Authorization: Bearer jwt_token
Content-Type: multipart/form-data

// Form data structure:
comicId: "c8410e79-a8e3-4fba-aefe-63fce4c2c35e"
pagesData: JSON.stringify([
  {
    "chapterId": "9d8d13b6-c1f7-4f60-90eb-7488f602b660", // Optional - creates fallback chapter if null
    "title": "The Hero's Journey", // Optional
    "altText": "Hero begins adventure", // Optional
    "authorNotes": "First page of new arc", // Optional
    "order": 1 // Optional - for custom ordering
  },
  {
    "chapterId": null, // Will use/create "Uploaded Pages" chapter
    "title": "Entering the Forest",
    "altText": "Hero walks into mysterious woods",
    "authorNotes": "",
    "order": 2
  }
  // ... more pages
])
file_0: [File object for first page]
file_1: [File object for second page]
// ... more files

// Response
{
  "success": true,
  "message": "Successfully created 8 of 10 pages",
  "results": {
    "successful": 8,
    "failed": 2,
    "total": 10
  },
  "pages": [
    {
      "success": true,
      "pageId": "391fec8e-db76-4ad5-b1b2-9aa8d9b1f588",
      "mediaId": "6e6b5807-1591-464e-bc97-c31529171d77",
      "title": "The Hero's Journey",
      "filename": "hero-page-1.jpg",
      "chapterPageNumber": 0,
      "globalPageNumber": 25
    },
    {
      "success": false,
      "error": "File size 12.5MB exceeds 10MB limit",
      "filename": "huge-image.jpg",
      "title": "Failed Page"
    }
    // ... more results
  ],
  "fallbackChapterCreated": {
    "id": "new-chapter-uuid",
    "title": "Uploaded Pages"
  }
}
```

**Features:**

- **Batch Processing**: Upload up to 50 images at once
- **Individual Error Handling**: Failed uploads don't stop the batch
- **Automatic Chapter Creation**: Creates "Uploaded Pages" chapter for orphaned images
- **Draft Status**: All pages created as drafts for review
- **Automatic Numbering**: Chapter page numbers assigned automatically
- **Size Limits**: 10MB per file, 200MB total batch
- **Background Updates**: Comic statistics updated after creation

### Data Management Operations

#### Recalculate Global Page Numbers (`POST /recalculate-page-numbers`)

Recalculate global page numbers for all pages in a comic to ensure sequential ordering.

```json
// Request
POST /recalculate-page-numbers
Authorization: Bearer jwt_token
{
  "comicId": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e"
}

// Response
{
  "success": true,
  "message": "Successfully recalculated global page numbers for 25 pages",
  "comicId": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e",
  "totalPages": 25,
  "totalChapters": 3,
  "updates": [
    {
      "pageId": "1015f3b4-5476-476c-af05-9d3aa3a42d2f",
      "title": "Chapter 1 - Page 0",
      "chapterPageNumber": 0,
      "oldGlobalPageNumber": 1,
      "newGlobalPageNumber": 1
    }
    // ... more updates
  ]
}
```

#### Fix Chapter Page Numbers (`POST /fix-chapter-page-numbers`)

Renumber chapter page numbers to start from 0 (cover) and increment sequentially.

```json
// Request
POST /fix-chapter-page-numbers
Authorization: Bearer jwt_token
{
  "comicId": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e"
}

// Response
{
  "success": true,
  "message": "Successfully corrected chapter page numbers for 12 pages",
  "comicId": "c8410e79-a8e3-4fba-aefe-63fce4c2c35e",
  "totalUpdates": 12,
  "totalChapters": 3,
  "updates": [
    {
      "pageId": "1015f3b4-5476-476c-af05-9d3aa3a42d2f",
      "title": "Chapter 1 Cover",
      "chapterTitle": "Chapter 1: The Beginning",
      "oldChapterPageNumber": 1,
      "newChapterPageNumber": 0
    }
    // ... more updates
  ]
}
```

### File System Operations

#### Find Orphaned Media (`POST /find-orphaned-media`)

Identify media files that are not referenced by any pages, comics, or users. Performs complex analysis across multiple collections and file system operations.

```json
// Request (Dry Run)
POST /find-orphaned-media
Authorization: Bearer jwt_token
{
  "dryRun": true  // Default: true (analysis only)
}

// Request (Actually Delete)
POST /find-orphaned-media
Authorization: Bearer jwt_token
{
  "dryRun": false  // Will delete orphaned files
}
```

**Features:**

- **Dry Run Mode**: Safe analysis without deletion (default)
- **Comprehensive Scanning**: Checks all collections that reference media
- **Detailed Analysis**: Shows breakdown by upload month and media type
- **Space Calculation**: Reports wasted storage space
- **Batch Deletion**: Can delete all orphaned files in one operation
- **Error Handling**: Reports files that couldn't be deleted

---

## Common Query Patterns

### Filtering and Sorting

```javascript
// Get all published pages for a specific comic, sorted by global page number
GET /api/pages?where[comic][equals]=c8410e79-a8e3-4fba-aefe-63fce4c2c35e&where[status][equals]=published&sort=globalPageNumber

// Get all comics by current user (creator role)
GET /api/comics?where[author][equals]=4ab0590b-cfc0-4200-a311-968b6aff24f4

// Get pages in a specific chapter
GET /api/pages?where[comic][equals]=c8410e79-a8e3-4fba-aefe-63fce4c2c35e&where[chapter][equals]=9d8d13b6-c1f7-4f60-90eb-7488f602b660&sort=chapterPageNumber
```

### Pagination

```javascript
// Standard pagination
GET /api/pages?page=2&limit=20

// All endpoints support:
// - page: Page number (1-based)
// - limit: Items per page (default 10, max 100)
```

### Population (Include Related Data)

```javascript
// Get comic with author details and cover image populated
GET /api/comics/c8410e79-a8e3-4fba-aefe-63fce4c2c35e?depth=2

// Get page with relationships populated
GET /api/pages/1015f3b4-5476-476c-af05-9d3aa3a42d2f?depth=2

// Note: PayloadCMS uses 'depth' parameter for relationship population
// depth=0: No relationships populated (IDs only)
// depth=1: Direct relationships populated
// depth=2: Nested relationships populated
```

## Error Responses

All endpoints return consistent error formats:

```json
// 400 Bad Request
{
  "errors": [
    {
      "message": "Title is required",
      "field": "title"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Authentication required"
}

// 403 Forbidden
{
  "message": "Insufficient permissions"
}

// 404 Not Found
{
  "message": "Comic not found"
}

// 500 Internal Server Error
{
  "message": "Internal server error"
}
```

## File Upload & Media URLs

### Image Size Variants

All uploaded images automatically generate 7 size variants optimized for different use cases:

| Size Name | Dimensions | Fit Type | Use Case |
|-----------|------------|----------|----------|
| `thumbnail` | 400px wide | inside | List views, archive pages |
| `thumbnail_small` | 200px wide | inside | Compact lists, navigation |
| `webcomic_page` | 800px wide | inside | Main comic reader view |
| `webcomic_mobile` | 400px wide | inside | Mobile comic reader |
| `cover_image` | 600×800 | cover | Comic/chapter covers |
| `social_preview` | 1200×630 | cover | Social media sharing |
| `avatar` | 200×200 | cover | User profile pictures |

**Fit Types:**
- `inside`: Resizes to fit within dimensions, maintains aspect ratio (no cropping)
- `cover`: Resizes and crops to fill exact dimensions

### Accessing Images

```javascript
// Original image
GET /api/media/file/filename.jpg

// Specific size variants
GET /api/media/file/filename-thumbnail.jpg
GET /api/media/file/filename-thumbnail_small.jpg
GET /api/media/file/filename-webcomic_page.jpg
GET /api/media/file/filename-webcomic_mobile.jpg
GET /api/media/file/filename-cover_image.jpg
GET /api/media/file/filename-social_preview.jpg
GET /api/media/file/filename-avatar.jpg

// Or via imageSizes object in API response
const thumbnailUrl = mediaObject.imageSizes.thumbnail.url
const thumbnailWidth = mediaObject.imageSizes.thumbnail.width
const thumbnailSize = mediaObject.imageSizes.thumbnail.fileSize
```

### Thumbnail Generation Details

**Local Development:**
- Uses Sharp (Node.js native library) for fast, high-quality image processing
- Generates all 7 sizes automatically on upload
- Stores metadata in single JSON field (D1 parameter limit workaround)

**Production (Cloudflare Workers):**
- Will use Cloudflare Images API (requires implementation)
- Same 7 size variants and JSON storage structure

**Automatic Cleanup:**
- Deleting media automatically removes all 7 thumbnail files from R2
- Prevents orphaned files and wasted storage

## Page Numbering System

### Overview

Chimera CMS uses a dual numbering system for comic pages:

1. **Chapter Page Numbers**: Start at 0 for each chapter (0 = cover, 1+ = regular pages)
2. **Global Page Numbers**: Sequential numbering across the entire comic (1-based)

### Automatic Assignment

- **Chapter pages**: Auto-assigned based on existing pages in the chapter
- **Global pages**: Auto-calculated based on chapter order and chapter page position
- **Navigation**: Automatically maintained (previousPage, nextPage, isFirstPage, isLastPage)

### Hook System

The CMS uses Payload hooks with guard clauses to prevent infinite loops:

- `skipGlobalPageCalculation`: Prevents global page number recalculation
- `skipComicStatsCalculation`: Prevents comic statistics updates
- Background processing with `setTimeout` for non-blocking operations

## Development Notes

### Local Development

- Payload CMS runs on `http://localhost:3333`
- Admin interface: `http://localhost:3333/admin`
- API base: `http://localhost:3333/api`
- Media files: `http://localhost:3333/media/`

### Database

- **Database**: Cloudflare D1 (SQLite, edge-replicated)
- Local development uses Wrangler's simulated D1
- Production uses Cloudflare's distributed D1 database
- All IDs are UUIDs (RFC 4122 v4) instead of sequential integers
- Automatic migrations on startup
- **Important Limitation**: D1 has a 100 parameter limit per query (vs 999 for standard SQLite)
  - This is why image sizes are stored in a single JSON field instead of 42 separate columns

### Authentication

- JWT tokens in Authorization header: `Bearer token_here`
- Tokens expire after 24 hours
- Refresh tokens not implemented (re-login required)

### Performance Considerations

- Page creation optimized to ~300ms with deferred statistics updates
- Navigation updates run in background after page creation
- Guard clauses prevent hook cascades and database deadlocks
- Batch operations for multi-page updates

## Frontend Implementation Tips

1. **Authentication State**: Store JWT token and user info in secure storage
2. **File Uploads**: Use FormData for multipart uploads to `/media`
3. **Image Display**: Always use appropriate size variants for performance
4. **Error Handling**: All endpoints return consistent error formats
5. **Pagination**: Implement infinite scroll or traditional pagination
6. **Real-time Updates**: Consider polling for new content (no WebSocket support)

## Security Considerations

- All creator actions are restricted to own content
- Media uploads are validated for file type and size
- CORS is configured for frontend domains
- Rate limiting may be implemented
- Always validate user permissions on frontend
