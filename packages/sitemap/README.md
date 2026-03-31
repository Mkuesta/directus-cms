# @directus-cms/sitemap

Sitemap and robots.txt generation for Directus CMS-powered Next.js sites. Composes data from existing `CmsClient` and `ProductClient` instances — never queries Directus directly.

## Prerequisites

- Next.js 14+ (App Router)
- At least one of `@directus-cms/core` or `@directus-cms/products` (both optional)

## Installation

```bash
npm install ../../directus-cms-sitemap --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/sitemap": "file:../../directus-cms-sitemap"
  }
}
```

## Setup

### 1. Sitemap Config

Create `lib/sitemap.ts` in your site:

```ts
import { createSitemapClient } from '@directus-cms/sitemap';
import { cms } from './cms';           // from @directus-cms/core
import { products } from './products'; // from @directus-cms/products

export const sitemapClient = createSitemapClient({
  baseUrl: 'https://stopabo.de',
  cms,
  products, // optional — omit for blog-only sites
  staticPages: [
    { path: '/', priority: 1.0 },
    { path: '/about', priority: 0.5 },
    { path: '/contact', priority: 0.5 },
  ],
});
```

### 2. Next.js Sitemap Route

**`app/sitemap.ts`**

```ts
import { sitemapClient } from '@/lib/sitemap';

export default async function sitemap() {
  return sitemapClient.generateSitemap();
}
```

### 3. Robots.txt Route

**`app/robots.ts`**

```ts
import { sitemapClient } from '@/lib/sitemap';

export default async function robots() {
  return sitemapClient.generateRobots();
}
```

## Usage

### Basic Sitemap (Small Sites)

```ts
const entries = await sitemapClient.generateSitemap();
// → [{ url, lastModified, changeFrequency, priority }, ...]
```

### Sitemap Index (Large Sites, >50k URLs)

For sites with many URLs, use segmented sitemaps:

```ts
// app/sitemap.ts
import { sitemapClient } from '@/lib/sitemap';

export async function generateSitemaps() {
  return sitemapClient.generateSitemapIndex();
  // → [{ id: 0 }, { id: 1 }, ...]
}

export default async function sitemap({ id }: { id: number }) {
  return sitemapClient.generateSitemapSegment(id);
}
```

### Individual Entry Sources

```ts
// Blog entries only (posts + categories + index)
const blogEntries = await sitemapClient.getBlogEntries();

// Product entries only (products + categories + listing)
const productEntries = await sitemapClient.getProductEntries();

// Static pages only
const staticEntries = sitemapClient.getStaticEntries();
```

### Hide Sitemap from Robots.txt

If you don't want the sitemap publicly discoverable (e.g. submit it directly via Google Search Console):

```ts
const sitemapClient = createSitemapClient({
  baseUrl: 'https://stopabo.de',
  hideSitemap: true, // robots.txt won't list /sitemap.xml
  cms,
});
```

### Custom Sitemap Path

Set `sitemapPath` in config or manage it from Directus via the `sitemap_path` settings field:

```ts
const sitemapClient = createSitemapClient({
  baseUrl: 'https://stopabo.de',
  sitemapPath: 'my-custom-sitemap.xml', // overrides Directus setting
  cms,
});
```

If `sitemapPath` is not set in config, the package checks `cms.getSettings().sitemapPath` (the `sitemap_path` field in Directus). Falls back to `sitemap.xml`.

### i18n / Hreflang Alternates

```ts
const sitemapClient = createSitemapClient({
  baseUrl: 'https://stopabo.de',
  cms,
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'fr'],
    strategy: 'prefix', // or 'subdomain'
  },
});
```

Each entry will include `alternates.languages`:

```ts
{
  url: 'https://stopabo.de/blog/my-post',
  alternates: {
    languages: {
      'de': 'https://stopabo.de/blog/my-post',
      'en': 'https://stopabo.de/en/blog/my-post',
      'fr': 'https://stopabo.de/fr/blog/my-post',
      'x-default': 'https://stopabo.de/blog/my-post',
    }
  }
}
```

## URL Construction

URLs are built from the existing client configs:

| Source | URL pattern |
|--------|-------------|
| Blog index | `{baseUrl}/{cms.config.route}` |
| Blog category | `{baseUrl}/{cms.config.route}/{category.slug}` |
| Blog post | `{baseUrl}/{cms.config.route}/{post.blogCategory.slug}/{post.slug}` |
| Product listing | `{baseUrl}/{products.config.listingRoute}` |
| Product category | `{baseUrl}/{products.config.categoryRoute}/{category.slug}` |
| Product | `{baseUrl}/{products.config.productRoute}/{product.slug}` |
| Static page | `{baseUrl}{staticPage.path}` |

## Config Reference

### `SitemapConfig`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | *required* | Canonical site URL, no trailing slash |
| `cms` | `CmsClient` | — | From `@directus-cms/core` (optional) |
| `products` | `ProductClient` | — | From `@directus-cms/products` (optional) |
| `staticPages` | `StaticPageEntry[]` | `[{ path: '/' }]` | Static pages to include |
| `defaultChangeFrequency` | `ChangeFrequency` | varies | Default change frequency |
| `defaultPriority` | `number` | varies | Default priority (0.0–1.0) |
| `maxUrlsPerSitemap` | `number` | `50000` | Max URLs per sitemap segment |
| `i18n` | `I18nConfig` | — | Hreflang alternate configuration |
| `sitemapPath` | `string` | `'sitemap.xml'` | Custom sitemap filename |
| `hideSitemap` | `boolean` | `false` | Hide sitemap URL from robots.txt |
| `robotsDisallow` | `string[]` | — | Extra disallowed paths in robots.txt |
| `additionalSitemaps` | `string[]` | — | External sitemap URLs for robots.txt |

## API Reference

### `createSitemapClient(config: SitemapConfig): SitemapClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `generateSitemap()` | `Promise<SitemapEntry[]>` | All entries merged and deduped |
| `generateSitemapSegment(id)` | `Promise<SitemapEntry[]>` | Entries for a specific segment |
| `generateSitemapIndex()` | `Promise<{ id: number }[]>` | Segment IDs for `generateSitemaps()` |
| `generateRobots()` | `Promise<RobotsConfig>` | Robots.txt configuration |
| `getBlogEntries()` | `Promise<SitemapEntry[]>` | Blog-only entries |
| `getProductEntries()` | `Promise<SitemapEntry[]>` | Product-only entries |
| `getStaticEntries()` | `SitemapEntry[]` | Static page entries |

## Default Priorities

| Content type | Priority |
|-------------|----------|
| Static pages | 1.0 |
| Blog index / Product listing | 0.8 |
| Blog posts / Products | 0.7 |
| Blog categories / Product categories | 0.6 |
