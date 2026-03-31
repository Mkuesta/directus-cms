# @directus-cms/webhooks

Webhook receiver for Directus events with cache invalidation and Next.js on-demand ISR revalidation. When content changes in Directus, automatically revalidate the right pages.

## Prerequisites

- A Next.js 14+ site with App Router
- Webhook configured in Directus admin (Settings → Webhooks)

## Installation

```bash
npm install ../../directus-cms-webhooks --legacy-peer-deps
```

## Setup

### 1. Environment Variables

```env
# .env.local
WEBHOOK_SECRET=generate-with-openssl-rand-hex-32
```

Generate: `openssl rand -hex 32`

### 2. Config

```ts
// lib/webhooks.ts
import { defaultCollectionMappings } from '@directus-cms/webhooks';

const COLLECTION_PREFIX = 'mysite';

export const webhookConfig = {
  secret: process.env.WEBHOOK_SECRET!,
  mappings: defaultCollectionMappings(COLLECTION_PREFIX),
};
```

### 3. API Route

```ts
// app/api/webhooks/directus/route.ts
import { createWebhookHandler } from '@directus-cms/webhooks';
import { webhookConfig } from '@/lib/webhooks';

const handler = createWebhookHandler(webhookConfig);
export const POST = handler;
```

### 4. Configure Directus

In Directus admin → Settings → Webhooks:

| Field | Value |
|-------|-------|
| Name | `Site Revalidation` |
| URL | `https://mysite.com/api/webhooks/directus` |
| Status | Active |
| Events | `items.create`, `items.update`, `items.delete` |
| Collections | All content collections |

If using Directus Cloud or a version that supports webhook signatures, configure the shared secret to match `WEBHOOK_SECRET`.

## Usage

### Default Mappings

`defaultCollectionMappings(prefix)` provides sensible defaults for all content types:

| Collection | Actions |
|-----------|---------|
| `{prefix}_posts` | Revalidate `/blog` (layout), `/sitemap.xml`, tag `posts` |
| `{prefix}_blog_categories` | Revalidate `/blog` (layout), tag `blog-categories` |
| `{prefix}_settings` | Revalidate `/` (layout), tag `settings` |
| `{prefix}_products` | Revalidate `/products` (layout), `/sitemap.xml`, tag `products` |
| `{prefix}_categories` | Revalidate `/products` (layout), tag `product-categories` |
| `{prefix}_pages` | Revalidate `/` (layout), `/sitemap.xml`, tag `pages` |
| `{prefix}_navigation_items` | Revalidate `/` (layout), tag `navigation` |
| `{prefix}_banners` | Revalidate `/` (layout), tag `banners` |
| `{prefix}_redirects` | Tag `redirects` |

### Custom Mappings

Override or extend the defaults:

```ts
import { defaultCollectionMappings } from '@directus-cms/webhooks';

const COLLECTION_PREFIX = 'mysite';

export const webhookConfig = {
  secret: process.env.WEBHOOK_SECRET!,
  mappings: [
    ...defaultCollectionMappings(COLLECTION_PREFIX),

    // Custom: revalidate specific product pages
    {
      collection: `${COLLECTION_PREFIX}_products`,
      events: ['items.update'],
      actions: [
        { type: 'revalidateTag', tag: 'featured-products' },
        { type: 'revalidatePath', path: '/', mode: 'page' },
      ],
    },

    // Custom handler for any collection matching prefix
    {
      collection: `${COLLECTION_PREFIX}_*`,
      actions: [
        {
          type: 'custom',
          handler: async (payload) => {
            console.log(`Content changed: ${payload.collection} (${payload.event})`);
            // Send Slack notification, trigger rebuild, etc.
          },
        },
      ],
    },
  ],
};
```

### Collection Matching

- **Exact match**: `'mysite_posts'` matches only that collection
- **Wildcard prefix**: `'mysite_*'` matches any collection starting with `mysite_`

### Event Filtering

```ts
{
  collection: `${PREFIX}_posts`,
  events: ['items.create', 'items.update'],  // ignore deletes
  actions: [{ type: 'revalidateTag', tag: 'posts' }],
}
```

When `events` is omitted, all events match.

### Action Types

| Type | Description | Example |
|------|-------------|---------|
| `revalidatePath` | Calls Next.js `revalidatePath()` | `{ type: 'revalidatePath', path: '/blog', mode: 'layout' }` |
| `revalidateTag` | Calls Next.js `revalidateTag()` | `{ type: 'revalidateTag', tag: 'posts' }` |
| `custom` | Runs your async handler function | `{ type: 'custom', handler: async (payload) => { ... } }` |

### Callbacks and Logging

```ts
export const webhookConfig = {
  secret: process.env.WEBHOOK_SECRET!,
  mappings: defaultCollectionMappings('mysite'),
  onWebhook: (payload, actionsExecuted) => {
    console.log(`Processed ${payload.event} on ${payload.collection}: ${actionsExecuted} actions`);
  },
  onInvalidSignature: (request) => {
    console.warn('Invalid webhook signature from:', request.headers.get('x-forwarded-for'));
  },
  logger: {
    info: (msg) => console.log(`[webhook] ${msg}`),
    error: (msg) => console.error(`[webhook] ${msg}`),
  },
};
```

### Signature Verification

The handler validates the `X-Directus-Signature` header using HMAC-SHA256. If no signature header is present, the request is still processed (for Directus versions that don't support webhook signatures). If a signature IS present but invalid, the request is rejected with 401.

```ts
import { verifySignature } from '@directus-cms/webhooks';

const valid = await verifySignature(requestBody, signatureHeader, secret);
```

## Handler Flow

1. **Reject non-POST** → 405
2. **Read body** → 400 if empty
3. **Verify signature** (if `X-Directus-Signature` header present) → 401 if invalid
4. **Parse JSON payload** → 400 if invalid
5. **Match against mappings** (collection + event filter)
6. **Execute actions** (revalidatePath, revalidateTag, custom)
7. **Return 200** `{ success: true, actionsExecuted: N }`

## API Reference

### `createWebhookHandler(config): (request: Request) => Promise<Response>`

### `createWebhookClient(config): WebhookClient`

| Config Field | Type | Required | Description |
|-------------|------|----------|-------------|
| `secret` | `string` | Yes | HMAC shared secret |
| `mappings` | `CollectionMapping[]` | Yes | Collection-to-action mappings |
| `onWebhook` | `(payload, count) => void` | No | Success callback |
| `onInvalidSignature` | `(request) => void` | No | Invalid signature callback |
| `logger` | `{ info, error }` | No | Custom logger |

### Standalone Functions

| Function | Description |
|----------|-------------|
| `verifySignature(payload, signature, secret)` | HMAC-SHA256 signature verification |
| `defaultCollectionMappings(prefix)` | Generate default mappings for a prefix |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl` |
| `WEBHOOK_SECRET` | Unique per site |
| Directus webhook URL | `https://stopabo.de/api/webhooks/directus` |
