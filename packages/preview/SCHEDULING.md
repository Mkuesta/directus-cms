# Scheduled Publishing Guide

## How it works

Content items (posts, products, pages) can be scheduled for future publication by setting:
- `status: "draft"`
- `scheduled_publish_date: "2026-04-01T02:00:00Z"` (UTC)

A cron job checks every 5 minutes for draft items whose `scheduled_publish_date` has passed and automatically publishes them.

## Setup (3 steps)

### 1. Create the API endpoint in your Next.js site

```ts
// app/api/cron/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { preview } from '@/lib/preview';

export async function GET(request: NextRequest) {
  // Optional: verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await preview.publishScheduledContent();
  return NextResponse.json(result);
}
```

### 2. Create a Directus Flow to call the endpoint

In Directus Admin → Settings → Flows → Create Flow:
- **Trigger:** Schedule, cron: `*/5 * * * *`
- **Operation:** Request (Webhook)
  - Method: GET
  - URL: `https://yoursite.com/api/cron/publish`

### 3. Configure the preview client

```ts
// lib/preview.ts
import { createPreviewClient } from '@directus-cms/preview';

export const preview = createPreviewClient({
  directus: adminDirectus,  // Must have WRITE access (admin token)
  directusUrl: DIRECTUS_URL,
  collections: {
    posts: 'mysite_posts',
    products: 'mysite_products',  // Include all collections that support scheduling
    pages: 'mysite_pages',
  },
  previewSecret: process.env.PREVIEW_SECRET || '',
  // Only set siteId if your collections have a 'site' column:
  // siteId: 20,
});
```

## Required environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `DIRECTUS_TOKEN` or `DIRECTUS_ADMIN_TOKEN` | Vercel + .env.local | Admin token with WRITE access to update item status |
| `NEXT_PUBLIC_DIRECTUS_URL` | Vercel + .env.local | Directus instance URL |
| `CRON_SECRET` (optional) | Vercel | Protects the cron endpoint from unauthorized calls |

**IMPORTANT:** The token must have write access. A read-only public token will not work — `updateItem()` requires admin permissions.

## Known issues and gotchas

### 1. siteId filter on collections without a `site` column

If your collection (e.g. `mysite_posts`) does NOT have a `site` field, do NOT pass `siteId` to the preview client. The siteId filter adds `AND site = X` to every query — if the column doesn't exist, the query silently returns 0 results and nothing publishes.

**Symptom:** `publishScheduledContent()` returns `{ published: 0, errors: [] }` even though draft items with past scheduled dates exist.

**Fix:** Remove `siteId` from the preview client config.

### 2. Raw PATCH request doesn't work with Directus SDK

Early versions used a raw request object:
```ts
// ❌ BROKEN — "s is not a function" error
config.directus.request({
  method: 'PATCH',
  path: `/items/${collection}/${id}`,
  body: { status: 'published' },
});
```

The fix is to use `updateItem()` from `@directus/sdk`:
```ts
// ✅ WORKS
import { updateItem } from '@directus/sdk';
config.directus.request(
  updateItem(collection, id, { status: 'published' })
);
```

### 3. Directus Flows `item-update` operation is unreliable

We tested pure Directus Flow operations (item-read → item-update with template IDs) and they never executed. The hybrid approach is more reliable:
- Directus Flow (schedule trigger) → calls external webhook
- Webhook endpoint → uses Directus SDK to update items

### 4. Status values

The scheduler checks for `status IN ('draft', 'scheduled')`. Directus default collections use `draft`/`published`/`archived`. If you add a `scheduled` status option to the dropdown, items with either `draft` or `scheduled` will be published when their time comes.

### 5. published_date is set automatically

When an item is published by the scheduler, `published_date` is set to the `scheduled_publish_date` value (or current time if missing). This ensures:
- Meta tags show the correct `datePublished`
- JSON-LD schema has accurate dates
- Sitemap `<lastmod>` reflects the publish time

## Vercel Cron (alternative to Directus Flow)

If you prefer not to use Directus Flows, add Vercel Cron to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Both approaches work. Directus Flow is preferred because it runs even if the site is redeploying.

## Testing

To test the scheduler:

1. Set an item to draft with a past `scheduled_publish_date`:
   ```
   PATCH /items/mysite_posts/{id}
   { "status": "draft", "scheduled_publish_date": "2026-01-01T00:00:00Z" }
   ```

2. Call the endpoint manually:
   ```
   curl https://yoursite.com/api/cron/publish
   ```

3. Expected response:
   ```json
   { "success": true, "published": 1, "errors": [], "timestamp": "..." }
   ```

4. Verify the item is now `status: "published"` in Directus.
