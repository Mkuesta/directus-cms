# @directus-cms/core

Blog and content infrastructure for Directus CMS-powered Next.js sites. Provides post fetching, category management, site settings, image handling, SEO metadata, and content processing (Markdown/HTML → sanitized HTML with heading IDs, FAQ/table/list extraction).

## Prerequisites

- Next.js 14+ (App Router)
- A Directus instance with your collections set up
- `@directus/sdk` installed in your site

## Installation

```bash
npm install ../../directus-cms-core --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/core": "file:../../directus-cms-core"
  }
}
```

## Setup

### 1. Environment Variables

```env
NEXT_PUBLIC_DIRECTUS_URL=https://cms.drlogist.com
DIRECTUS_STATIC_TOKEN=your-directus-token
```

### 2. CMS Config

Create `lib/cms.ts` in your site:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createCmsClient } from '@directus-cms/core';

const COLLECTION_PREFIX = 'stopabo_de';

export const cms = createCmsClient({
  directus: createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest()),
  collections: {
    posts: `${COLLECTION_PREFIX}_posts`,
    settings: `${COLLECTION_PREFIX}_settings`,
    blogCategories: `${COLLECTION_PREFIX}_blog_categories`,
    categories: `${COLLECTION_PREFIX}_categories`,
    products: `${COLLECTION_PREFIX}_products`,
  },
  siteName: 'StopAbo',
  baseUrl: 'https://stopabo.de',
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  route: 'blog',
});
```

## Usage

### Fetching Posts

```ts
// Get paginated posts
const { posts, pagination } = await cms.getPosts({ page: 1, pageSize: 10 });

// Get a single post by slug
const post = await cms.getPostBySlug('my-article');

// Get recent posts
const recent = await cms.getRecentPosts(5);

// Filter by category
const { posts } = await cms.getPosts({ category: 'health', pageSize: 20 });
```

### Blog Categories

```ts
const categories = await cms.getBlogCategories();
const category = await cms.getBlogCategoryBySlug('health');
```

### Site Settings

```ts
const settings = await cms.getSettings();
// → { siteName, siteDescription, logoUrl, ogImageUrl, ... }
```

Settings are cached for 60 seconds using a WeakMap keyed by the Directus client instance.

### SEO Metadata

```ts
// For article pages
export async function generateMetadata({ params }) {
  return cms.getArticleMetadata(params.slug, params.category);
}

// For category pages
export async function generateMetadata({ params }) {
  return cms.getCategoryMetadata(params.category);
}

// For the blog index
export async function generateMetadata() {
  return cms.getBlogIndexMetadata();
}
```

### Static Params (SSG)

```ts
// For [category]/[slug] routes
export async function generateStaticParams() {
  return cms.getArticleStaticParams();
  // → [{ category: 'health', slug: 'my-article' }, ...]
}

// For [category] routes
export async function generateStaticParams() {
  return cms.getCategoryStaticParams();
  // → [{ category: 'health' }, ...]
}
```

### Images

```ts
// Raw asset URL
const url = cms.getDirectusAssetUrl('file-id-123');
// → "https://cms.drlogist.com/assets/file-id-123"

// Transformed image URL
const thumb = cms.getDirectusImageUrl('file-id-123', {
  width: 400,
  height: 300,
  fit: 'cover',
  format: 'webp',
  quality: 80,
});
```

### Schema.org Component

```tsx
import { ArticleSchema } from '@directus-cms/core/components';

<ArticleSchema post={post} settings={settings} baseUrl="https://stopabo.de" />
```

## Directus Collections

### Posts Collection (`{prefix}_posts`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Post title |
| `slug` | String | URL slug |
| `content` | Text | Markdown or HTML content |
| `excerpt` | Text | Short summary |
| `status` | Dropdown | `published`, `draft`, `archived` |
| `category` | String | Blog category reference |
| `published_date` | DateTime | Publication date |
| `updated_date` | DateTime | Last update |
| `author` | String | Author name |
| `featured_image` | File | Featured image |
| `seo_title` | String | SEO title override |
| `seo_description` | Text | Meta description |
| `seo_keywords` | String | Comma-separated keywords |
| `tags` | JSON | Array of tag strings |
| `article_type` | Dropdown | `blog`, `product`, `guide`, `comparison` |

### Settings Collection (`{prefix}_settings`) — Singleton

| Field | Type | Description |
|-------|------|-------------|
| `site_name` | String | Display name |
| `site_title` | String | HTML title |
| `site_description` | Text | Meta description |
| `default_author_name` | String | Fallback author |
| `default_logo` | File | Site logo |
| `default_og_image` | File | Default Open Graph image |
| `favicon` | File | Favicon |
| `twitter_handle` | String | Twitter @handle |
| `theme_color` | String | Theme color hex |
| `homepage_keywords` | String | Comma-separated keywords |
| `sitemap_path` | String | Custom sitemap path (used by `@directus-cms/sitemap`) |

### Blog Categories Collection (`{prefix}_blog_categories`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Category name |
| `slug` | String | URL slug |
| `description` | Text | Category description |
| `seo_title` | String | SEO title override |
| `seo_description` | Text | Meta description |
| `status` | Dropdown | `published`, `draft` |
| `sort` | Integer | Sort order |

## API Reference

### `createCmsClient(config: CmsConfig): CmsClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `getPosts(options?)` | `{ posts, pagination }` | Paginated posts with optional filters |
| `getPostBySlug(slug)` | `Post \| null` | Single post by slug |
| `getRecentPosts(limit?)` | `Post[]` | Latest posts (default 5) |
| `getBlogCategories()` | `BlogCategory[]` | All published categories |
| `getBlogCategoryBySlug(slug)` | `BlogCategory \| null` | Single category |
| `getSettings()` | `SiteSettings` | Site settings (cached 60s) |
| `getArticleMetadata(slug, category)` | `Metadata` | Next.js metadata for article pages |
| `getCategoryMetadata(categorySlug)` | `Metadata` | Next.js metadata for category pages |
| `getBlogIndexMetadata()` | `Metadata` | Next.js metadata for blog index |
| `getCategoryStaticParams()` | `{ category }[]` | Static params for category routes |
| `getArticleStaticParams()` | `{ category, slug }[]` | Static params for article routes |
| `getDirectusAssetUrl(fileId)` | `string \| undefined` | Raw Directus asset URL |
| `getDirectusImageUrl(fileId, options?)` | `string \| undefined` | Transformed image URL |
| `toAbsoluteAssetUrl(path)` | `string \| undefined` | Resolve relative asset path |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl`, `resiliax_fr` |
| `siteName` | `"StopAbo"`, `"Falwo"`, `"Resiliax"` |
| `baseUrl` | `"https://stopabo.de"`, `"https://falwo.nl"` |
| `route` | `"blog"`, `"artikel"`, `"articles"` |
