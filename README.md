# Payload D1 - Webcomic CMS

A webcomic content management system built with Payload CMS v3, deployed on Cloudflare Workers with D1 (SQLite) database and R2 object storage.

## Features

- **Comic Management**: Create and organize comics with chapters and pages
- **User Roles**: Admin, Editor, Creator, and Reader roles with granular permissions
- **Media Management**: Upload comic pages and cover images with automatic resizing
- **Publishing Workflow**: Draft, scheduled, and published content states
- **Page Numbering**: Dual numbering system (chapter + global) with auto-calculation
- **Cloudflare Edge**: Global deployment with D1 database and R2 storage
- **Custom API Endpoints**: Bulk operations, page numbering utilities, chapter reordering

**This requires Paid Workers due to bundle size limits (~17MB).**

## Quick start

This template can be deployed directly to Cloudflare Workers by clicking the button to take you to the setup screen.

From there you can connect your code to a git provider such Github or Gitlab, name your Workers, D1 Database and R2 Bucket as well as attach any additional environment variables or services you need.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. Cloudflare will connect your app to a git provider such as Github and you can access your code from there.

### Local Development

## How it works

Out of the box, using [`Wrangler`](https://developers.cloudflare.com/workers/wrangler/) will automatically create local bindings for you to connect to the remote services and it can even create a local mock of the services you're using with Cloudflare.

We've pre-configured Payload for you with the following:

### Collections

This CMS extends the Payload template with webcomic-specific collections:

- **Users**: Auth-enabled with role-based access (Reader, Creator, Editor, Admin)
  - Creators can manage their own comics
  - Editors can assist all creators
  - Readers have public access only

- **Comics**: Top-level comic series with metadata, cover images, genres, and publishing schedule
  - Auto-assigned author on creation
  - Statistics tracking (total pages, chapters, last published)
  - SEO metadata fields

- **Chapters**: Organizational units within comics
  - Auto-incrementing order field
  - Chapter-specific metadata and SEO
  - Statistics (page count, first/last page numbers)

- **Pages**: Individual comic pages with dual numbering
  - **Chapter Page Number**: 0-based within chapter (0 = cover)
  - **Global Page Number**: Auto-calculated across entire comic
  - Navigation fields (previousPage, nextPage) computed in hooks
  - Multi-image support for double-page spreads
  - Draft/scheduled/published workflow

- **Media**: R2-backed uploads with automatic image resizing
  - Generates 7 sizes (thumbnail, webcomic_page, mobile, social, etc.)
  - Metadata tracking (dimensions, file size, usage)

### Image Storage (R2)

Images will be served from an R2 bucket which you can then further configure to use a CDN to serve for your frontend directly.

### D1 Database

The Worker will have direct access to a D1 SQLite database which Wrangler can connect locally to, just note that you won't have a connection string as you would typically with other providers.

You can enable read replicas by adding `readReplicas: 'first-primary'` in the DB adapter and then enabling it on your D1 Cloudflare dashboard. Read more about this feature on [our docs](https://payloadcms.com/docs/database/sqlite#d1-read-replicas).

## Working with Cloudflare

Firstly, after installing dependencies locally you need to authenticate with Wrangler by running:

```bash
pnpm wrangler login
```

This will take you to Cloudflare to login and then you can use the Wrangler CLI locally for anything, use `pnpm wrangler help` to see all available options.

Wrangler is pretty smart so it will automatically bind your services for local development just by running `pnpm dev`.

## Deployments

When you're ready to deploy, first make sure you have created your migrations:

```bash
pnpm payload migrate:create
```

Then run the following command:

```bash
pnpm run deploy
```

This will spin up Wrangler in `production` mode, run any created migrations, build the app and then deploy the bundle up to Cloudflare.

That's it! You can if you wish move these steps into your CI pipeline as well.

## Enabling logs

By default logs are not enabled for your API, we've made this decision because it does run against your quota so we've left it opt-in. But you can easily enable logs in one click in the Cloudflare panel, [see docs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#enable-workers-logs).

## Known issues

### GraphQL

We are currently waiting on some issues with GraphQL to be [fixed upstream in Workers](https://github.com/cloudflare/workerd/issues/5175) so full support for GraphQL is not currently guaranteed when deployed.

### Worker size limits

We currently recommend deploying this template to the Paid Workers plan due to bundle [size limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size) of 3mb. We're actively trying to reduce our bundle footprint over time to better meet this metric.

This also applies to your own code, in the case of importing a lot of libraries you may find yourself limited by the bundle.

## Additional Features

### Page Numbering System

The CMS uses sophisticated hooks to maintain accurate page numbering:

- **Auto-assignment**: New pages get next available chapter page number
- **Global calculation**: Computes position across all chapters automatically
- **Guard clauses**: `skipGlobalPageCalculation` flag prevents infinite hook loops
- **Recalculation utility**: `/api/recalculate-page-numbers` endpoint for fixing inconsistencies

### Hook Performance

Collection hooks are optimized to prevent cascades:
- Guard flags (`skipGlobalPageCalculation`, `skipComicStatsCalculation`) prevent recursion
- Statistics updates happen after main operations complete
- Page creation optimized to ~300ms with background processing

### Custom API Endpoints

See `docs/api-specification.md` (when available) for full API documentation:

- `POST /api/register` - Public user registration
- `POST /api/request-creator-role` - Upgrade reader to creator
- `POST /api/recalculate-page-numbers` - Fix global page numbering for a comic
- `POST /api/move-chapter` - Move chapter up/down in order

## Troubleshooting

### TypeScript Compilation Errors

If deployment fails with TypeScript errors:
1. Check collection field types match PayloadCMS interfaces
2. Add `as any` casts for custom `req` object properties
3. Ensure all validate functions have proper type annotations

### Missing Media in Production

If images don't load after deployment:
```bash
# Verify R2 binding in wrangler.toml
pnpm wrangler r2 bucket list

# Upload local media files
cd .wrangler/state/v3/r2/payload-d1/
find . -type f | while read file; do
  pnpm wrangler r2 object put "payload-d1/$(basename "$file")" \
    --file="$file" --remote
done
```

### Database Schema Mismatch

If local and production schemas differ:
```bash
# Generate migration capturing current schema
pnpm payload migrate:create

# Review generated file in src/migrations/
# Deploy with migrations
pnpm run deploy
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

## Project Structure

```
src/
├── collections/          # Payload collections
│   ├── Users.ts         # Role-based user management
│   ├── Comics.ts        # Comic series
│   ├── Chapters.ts      # Chapter organization
│   ├── Pages.ts         # Pages with auto-numbering
│   └── Media.ts         # R2 file management
├── lib/                 # Utility functions
│   └── recalculate-page-numbers.ts
├── payload.config.ts    # Payload + Cloudflare config
└── migrations/          # Database migrations

.wrangler/               # Local dev state (gitignored)
├── state/v3/d1/        # Local D1 database
└── state/v3/r2/        # Local R2 storage
```

## Architecture Notes

### D1 vs PostgreSQL

This implementation uses Cloudflare D1 (SQLite) instead of traditional PostgreSQL:

**Advantages:**
- Global edge database with automatic replication
- No connection limits or cold starts
- Lower latency for edge queries
- Integrated with Workers

**Differences:**
- SQLite syntax (TEXT vs VARCHAR, etc.)
- No stored procedures
- Simpler transaction model

The migration from the original chimera-cms (PostgreSQL) to this D1 version required updating migrations and adapting hooks for SQLite compatibility.

### R2 vs File System

Media storage moved from local file system to R2:

**Advantages:**
- S3-compatible API
- No egress fees
- Global CDN distribution
- Automatic scaling

**Configuration:**
- PayloadCMS r2Storage plugin handles uploads
- Sharp for image resizing
- Direct R2 bucket binding in Workers

## Questions

- **Payload CMS**: [Discord](https://discord.com/invite/payload) | [Docs](https://payloadcms.com/docs)
- **Cloudflare Workers**: [Discord](https://discord.gg/cloudflaredev) | [Docs](https://developers.cloudflare.com/workers/)
- **Cloudflare D1**: [Docs](https://developers.cloudflare.com/d1/)
- **Cloudflare R2**: [Docs](https://developers.cloudflare.com/r2/)
