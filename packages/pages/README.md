# @directus-cms/pages

Dynamic pages from Directus for Next.js sites. Fetches pages like About, Privacy, Terms, and landing pages from a Directus collection, processes Markdown/HTML content using `@directus-cms/core`, and provides SEO metadata and static params generation.

Data only — no UI components or styling.

## Prerequisites

- Next.js 14+ (App Router)
- A Directus instance with a pages collection set up
- `@directus/sdk` and `@directus-cms/core` installed in your site

## Installation

```bash
npm install ../../directus-cms-pages --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/pages": "file:../../directus-cms-pages"
  }
}
```

## Setup

### 1. Directus Collection

Create a `pages` collection (or `{prefix}_pages`) in Directus with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Page title |
| `slug` | String | URL slug (e.g. `about`, `privacy-policy`) |
| `content` | Text | Markdown or HTML content |
| `excerpt` | Text | Short summary |
| `featured_image` | File | Featured/hero image |
| `parent_id` | M2O (self) | Parent page for nesting (e.g. `/legal/privacy`) |
| `template` | String | Optional template identifier (e.g. `default`, `landing`, `full-width`) |
| `status` | Dropdown | `published` or `draft` |
| `sort` | Integer | Sort order |
| `seo_title` | String | SEO title override |
| `seo_description` | Text | Meta description |
| `seo_keywords` | String | Comma-separated keywords |
| `meta_robots` | String | Robots directive (e.g. `noindex`) |
| `og_image` | File | Open Graph image |
| `published_date` | DateTime | Publication date |
| `updated_date` | DateTime | Last update |
| `site` | Integer | Optional multi-tenant site ID |

### 2. Page Config

Create `lib/pages.ts` in your site:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createPageClient } from '@directus-cms/pages';

const COLLECTION_PREFIX = 'stopabo_de';

export const pages = createPageClient({
  directus: createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest()),
  collections: {
    pages: `${COLLECTION_PREFIX}_pages`,
  },
  siteName: 'StopAbo',
  baseUrl: 'https://stopabo.de',
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
```

### 3. Next.js Routes

**`app/[slug]/page.tsx`** — Dynamic page route:

```tsx
import { pages } from '@/lib/pages';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return pages.getPageStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return pages.getPageMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await pages.getPage(slug);
  if (!page) notFound();

  return (
    <article>
      <h1>{page.title}</h1>
      {page.html && (
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      )}
    </article>
  );
}
```

## Usage

### Get a Single Page

```ts
const page = await pages.getPage('about');
// → {
//   id: 1,
//   title: 'About Us',
//   slug: 'about',
//   html: '<p>Processed HTML with heading IDs...</p>',
//   headings: [{ id: 'our-mission', text: 'Our Mission', level: 2 }],
//   excerpt: 'Learn about our company',
//   featuredImageUrl: 'https://cms.drlogist.com/assets/abc123',
//   template: 'default',
//   ...
// }
```

### Get All Pages

```ts
const allPages = await pages.getPages();
```

### Get Nested Page Tree

For sites with parent/child pages (e.g. `/legal/privacy`, `/legal/terms`):

```ts
const tree = await pages.getPageTree();
// → [
//   { title: 'About', slug: 'about', children: [] },
//   { title: 'Legal', slug: 'legal', children: [
//     { title: 'Privacy Policy', slug: 'privacy-policy', ... },
//     { title: 'Terms of Service', slug: 'terms', ... },
//   ]},
// ]
```

### SEO Metadata

```ts
export async function generateMetadata({ params }) {
  return pages.getPageMetadata(params.slug);
}
// → { title, description, openGraph: { ... }, alternates: { canonical } }
```

### Static Params

```ts
export async function generateStaticParams() {
  return pages.getPageStaticParams();
}
// → [{ slug: 'about' }, { slug: 'privacy-policy' }, ...]
```

### Using Templates

The `template` field lets you render different layouts per page:

```tsx
export default async function Page({ params }) {
  const page = await pages.getPage(params.slug);
  if (!page) notFound();

  switch (page.template) {
    case 'landing':
      return <LandingLayout page={page} />;
    case 'full-width':
      return <FullWidthLayout page={page} />;
    default:
      return <DefaultLayout page={page} />;
  }
}
```

## Content Processing

Content is automatically processed using `@directus-cms/core`'s `processArticleContent`:

- Markdown is converted to HTML
- HTML tags are sanitized
- Heading IDs are added (for anchor links / table of contents)
- Both `html` (processed) and `content` (raw) are available on the `Page` object

## API Reference

### `createPageClient(config: PageConfig): PageClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `getPage(slug)` | `Promise<Page \| null>` | Single page by slug |
| `getPages()` | `Promise<Page[]>` | All published pages (flat) |
| `getPageTree()` | `Promise<Page[]>` | Pages as nested tree |
| `getPageMetadata(slug)` | `Promise<PageMetadata>` | Next.js metadata for a page |
| `getPageStaticParams()` | `Promise<{ slug }[]>` | Static params for all pages |

### `Page`

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Page ID |
| `title` | `string` | Page title |
| `slug` | `string` | URL slug |
| `content` | `string \| undefined` | Raw content (Markdown/HTML) |
| `html` | `string \| undefined` | Processed HTML with heading IDs |
| `headings` | `{ id, text, level }[]` | Extracted headings for TOC |
| `excerpt` | `string \| undefined` | Short summary |
| `featuredImageUrl` | `string \| undefined` | Featured image URL |
| `parentId` | `number \| null` | Parent page ID |
| `template` | `string \| undefined` | Template identifier |
| `status` | `'published' \| 'draft'` | Publication status |
| `sort` | `number` | Sort order |
| `seo` | `{ title?, description?, keywords? }` | SEO fields |
| `metaRobots` | `string \| undefined` | Robots directive |
| `ogImageUrl` | `string \| undefined` | OG image URL |
| `children` | `Page[] \| undefined` | Child pages (in tree mode) |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl` |
| `collections.pages` | `"stopabo_de_pages"` |
| `siteName` | `"StopAbo"`, `"Falwo"` |
| `baseUrl` | `"https://stopabo.de"` |
| `siteId` | `4` (or omit for single-tenant) |
