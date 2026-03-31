# @directus-cms/preview

Draft content preview with token-based auth, scheduled publishing, and Next.js draft mode integration. View unpublished content securely, auto-publish scheduled drafts, and show a preview toolbar.

## Prerequisites

- A Directus instance with an admin token (with read access to all content regardless of status)
- `@directus/sdk` and `next >=14.0.0` installed in your site

## Installation

```bash
npm install ../../directus-cms-preview --legacy-peer-deps
```

## Setup

### 1. Environment Variables

```env
# .env.local
PREVIEW_SECRET=generate-with-openssl-rand-hex-32
DIRECTUS_ADMIN_TOKEN=your-admin-token-here
```

Generate a secret: `openssl rand -hex 32`

### 2. Config

```ts
// lib/preview.ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createPreviewClient } from '@directus-cms/preview';

const COLLECTION_PREFIX = 'mysite';

// Admin client — bypasses status filters
const adminDirectus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!))
  .with(rest());

export const preview = createPreviewClient({
  directus: adminDirectus,
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  collections: {
    posts: `${COLLECTION_PREFIX}_posts`,
    products: `${COLLECTION_PREFIX}_products`,
    pages: `${COLLECTION_PREFIX}_pages`,
  },
  previewSecret: process.env.PREVIEW_SECRET!,
  defaultRedirect: '/',
  tokenExpiry: 3600, // 1 hour (in seconds)
});
```

### 3. API Routes

```ts
// app/api/preview/route.ts
import { createPreviewApiHandler } from '@directus-cms/preview';
import { preview } from '@/lib/preview';

const handler = createPreviewApiHandler(preview.config);
export const GET = handler;
```

```ts
// app/api/preview/exit/route.ts
import { createExitPreviewHandler } from '@directus-cms/preview';
import { preview } from '@/lib/preview';

const handler = createExitPreviewHandler(preview.config);
export const GET = handler;
```

## Usage

### Generate Preview URLs

Generate HMAC-signed preview URLs (e.g. from a Directus custom hook or admin panel):

```ts
import { preview } from '@/lib/preview';

const previewUrl = await preview.generatePreviewUrl('/blog/my-draft-post');
// → '/api/preview?path=%2Fblog%2Fmy-draft-post&token=a1b2c3...%3A1710500000000'
```

The token contains an HMAC signature and expiry timestamp. Invalid or expired tokens are rejected.

### Fetch Draft Content

Fetch any content regardless of status (admin token bypasses filters):

```ts
import { preview } from '@/lib/preview';

// In a page component that checks draftMode
import { draftMode } from 'next/headers';

export default async function BlogPost({ params }) {
  const { isEnabled } = await draftMode();

  const post = isEnabled
    ? await preview.getPreviewPost(params.slug)  // fetches drafts too
    : await cms.getPostBySlug(params.slug);       // only published

  if (!post) return notFound();
  return <article>{post.title}</article>;
}
```

Available fetchers:

```ts
const post = await preview.getPreviewPost('my-draft');
const product = await preview.getPreviewProduct('unreleased-product');
const page = await preview.getPreviewPage('coming-soon');
// Returns PreviewItem | null
```

### Preview Banner

Show a "Preview Mode" banner when draft mode is active:

```tsx
// app/layout.tsx
import { draftMode } from 'next/headers';
import { PreviewBanner } from '@directus-cms/preview/components';

export default async function RootLayout({ children }) {
  const { isEnabled } = await draftMode();

  return (
    <html>
      <body>
        {children}
        {isEnabled && <PreviewBanner
          message="You are viewing a draft"
          exitUrl="/api/preview/exit"
          position="bottom"
        />}
      </body>
    </html>
  );
}
```

### Scheduled Publishing

The `scheduled_publish_date` field on posts (and now pages/products) allows content editors to schedule future publication.

#### Check Scheduled Content

```ts
const scheduled = await preview.getScheduledContent();
// → [{ id: 5, collection: 'posts', title: 'Holiday Sale', scheduledPublishDate: '2024-12-20T00:00:00Z', status: 'draft' }]
```

#### Auto-Publish Scheduled Content

```ts
const result = await preview.publishScheduledContent();
// → { published: 3, errors: [] }
```

Call this from a cron job or scheduled function:

```ts
// app/api/cron/publish/route.ts
import { preview } from '@/lib/preview';

export async function GET(request: Request) {
  // Verify cron secret
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await preview.publishScheduledContent();
  return Response.json(result);
}
```

## Preview Flow

1. Editor clicks "Preview" in Directus → your app generates a signed URL via `generatePreviewUrl()`
2. The URL hits `/api/preview?path=...&token=...`
3. The handler verifies the HMAC token → enables Next.js `draftMode()` → redirects to the content page
4. The page detects `draftMode().isEnabled` → fetches draft content via `getPreviewPost()`
5. `<PreviewBanner>` shows at the bottom with an "Exit Preview" button
6. Clicking exit hits `/api/preview/exit` → disables `draftMode()` → redirects to `/`

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<PreviewBanner>` | `message?`, `exitUrl?`, `className?`, `position?` | Fixed banner showing preview mode is active (client component) |

## API Reference

### `createPreviewClient(config: PreviewConfig): PreviewClient`

| Config Field | Type | Required | Description |
|-------------|------|----------|-------------|
| `directus` | `RestClient<any>` | Yes | Admin-token Directus client |
| `directusUrl` | `string` | Yes | Directus base URL |
| `collections` | `{ posts?, products?, pages? }` | Yes | Collection names to preview |
| `previewSecret` | `string` | Yes | HMAC signing secret |
| `defaultRedirect` | `string` | No | Redirect path after exiting preview (default: `/`) |
| `siteId` | `number` | No | Multi-tenant site filter |
| `tokenExpiry` | `number` | No | Token expiry in seconds (default: 3600) |

### Client Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getPreviewPost(slug)` | `Promise<PreviewItem \| null>` | Fetch post regardless of status |
| `getPreviewProduct(slug)` | `Promise<PreviewItem \| null>` | Fetch product regardless of status |
| `getPreviewPage(slug)` | `Promise<PreviewItem \| null>` | Fetch page regardless of status |
| `generatePreviewUrl(path)` | `Promise<string>` | Generate signed preview URL |
| `verifyPreviewToken(token)` | `Promise<boolean>` | Verify an HMAC token |
| `getScheduledContent()` | `Promise<ScheduledItem[]>` | Get content past its scheduled date |
| `publishScheduledContent()` | `Promise<PublishResult>` | Publish all overdue scheduled content |

### Route Handlers

| Export | Description |
|--------|-------------|
| `createPreviewApiHandler(config)` | `GET /api/preview` — validates token, enables draftMode, redirects |
| `createExitPreviewHandler(config)` | `GET /api/preview/exit` — disables draftMode, redirects to `/` |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl` |
| `PREVIEW_SECRET` | Unique per site |
| `DIRECTUS_ADMIN_TOKEN` | Admin token with read access |
| `siteId` | `1`, `4` (or omit for single-tenant) |
