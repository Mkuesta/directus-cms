# @directus-cms/banners

Announcement banners, promotions, and popups from Directus for Next.js sites. Supports scheduled display (start/end dates), page targeting with wildcards, and dismissible banners. Data only — no styling.

## Setup

### 1. Directus Collection (`{prefix}_banners`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Internal name |
| `slug` | String | Unique identifier |
| `content` | Text | Banner message (HTML or plain text) |
| `type` | Dropdown | `announcement`, `promotion`, `popup`, `info`, `warning` |
| `position` | Dropdown | `top`, `bottom`, `popup` |
| `link_url` | String | Optional CTA link |
| `link_text` | String | Optional CTA text |
| `background_color` | String | Hex color (e.g. `#FF6B00`) |
| `text_color` | String | Hex color |
| `dismissible` | Boolean | Can user close it |
| `start_date` | DateTime | Start showing (optional) |
| `end_date` | DateTime | Stop showing (optional) |
| `target_pages` | JSON | Array of paths/patterns: `["/", "/blog/*"]` |
| `status` | Dropdown | `published`, `draft` |
| `sort` | Integer | Display order |
| `site` | Integer | Optional multi-tenant site ID |

### 2. Config

```ts
// lib/banners.ts
import { createBannerClient } from '@directus-cms/banners';
import { directus, COLLECTION_PREFIX } from './cms';

export const banners = createBannerClient({
  directus,
  collections: { banners: `${COLLECTION_PREFIX}_banners` },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
```

## Usage

```ts
// Get all active banners (within date range)
const active = await banners.getActiveBanners();

// Get banners for a specific page
const pageBanners = await banners.getBannersForPage('/blog/my-post');

// Get a specific banner
const promo = await banners.getBanner('summer-sale');
```

### Page Targeting

The `target_pages` field supports:
- Exact match: `"/about"` — only on /about
- Wildcard prefix: `"/blog/*"` — all pages under /blog/
- Global: `"*"` — all pages
- Empty array or null — all pages (same as `*`)

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `getActiveBanners()` | `Promise<Banner[]>` | All currently active banners |
| `getBannersForPage(pathname)` | `Promise<Banner[]>` | Active banners matching the page |
| `getBanner(slug)` | `Promise<Banner \| null>` | Specific active banner |
