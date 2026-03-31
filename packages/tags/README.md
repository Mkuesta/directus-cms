# @directus-cms/tags

Tag taxonomy and content discovery for Directus CMS sites. Extracts tags from posts' JSON `tags` field, provides querying/filtering, related-by-tag discovery, and tag cloud/list components.

Works out of the box with the existing `tags` JSON field on posts — no extra Directus collections needed.

## Prerequisites

- A Directus instance with a posts collection that has a `tags` JSON field
- `@directus/sdk` installed in your site

## Installation

```bash
npm install ../../directus-cms-tags --legacy-peer-deps
```

## Setup

```ts
// lib/tags.ts
import { createTagClient } from '@directus-cms/tags';
import { directus, COLLECTION_PREFIX } from './cms';

export const tags = createTagClient({
  directus,
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  collections: {
    posts: `${COLLECTION_PREFIX}_posts`,
  },
  siteId: 1, // optional, for multi-tenancy
});
```

## Usage

### Get All Tags

```ts
import { tags } from '@/lib/tags';

const allTags = await tags.getAllTags();
// → ['css', 'health', 'javascript', 'react', 'skincare', 'wellness']
// Sorted alphabetically, deduplicated
```

### Get Posts by Tag

```ts
const posts = await tags.getPostsByTag('javascript');
// → [{ id: '3', title: 'Getting Started with React', slug: 'react-guide', tags: ['javascript', 'react'], ... }]

// With limit
const top5 = await tags.getPostsByTag('javascript', 5);
```

### Find Related Posts

Find posts that share tags with a given post (for "Related Articles" sections):

```ts
const related = await tags.getRelatedByTags(
  ['javascript', 'react'],  // tags from the current post
  'current-post-slug',       // exclude the current post
  5,                          // limit
);
// Returns posts sorted by number of shared tags (most related first)
```

### Tag Counts (for Tag Clouds)

```ts
const tagCounts = await tags.getTagCounts();
// → [
//   { tag: 'javascript', count: 12 },
//   { tag: 'react', count: 8 },
//   { tag: 'css', count: 5 },
//   ...
// ]
// Sorted by count descending
```

### Tag Cloud Component

```tsx
import { TagCloud } from '@directus-cms/tags/components';
import { tags } from '@/lib/tags';

export async function Sidebar() {
  const tagCounts = await tags.getTagCounts();

  return (
    <TagCloud
      tags={tagCounts}
      baseUrl="/tags"             // links go to /tags/{tag}
      minFontSize={0.8}           // smallest tag font size in rem
      maxFontSize={2.0}           // largest tag font size in rem
      className="my-tag-cloud"
    />
  );
}
```

Tags are sized proportionally to their count. The most-used tag gets `maxFontSize`, the least-used gets `minFontSize`.

### Tag List Component

Inline tag display (e.g. on a post card):

```tsx
import { TagList } from '@directus-cms/tags/components';

export function PostCard({ post }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <TagList tags={post.tags} baseUrl="/tags" />
    </article>
  );
}
```

### Tag Page

```tsx
// app/tags/[tag]/page.tsx
import { tags } from '@/lib/tags';

export default async function TagPage({ params }) {
  const { tag } = await params;
  const posts = await tags.getPostsByTag(decodeURIComponent(tag));

  return (
    <main>
      <h1>Posts tagged "{tag}"</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <a href={`/blog/${post.slug}`}>{post.title}</a>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}
```

## Caching

All tag data is fetched once and cached for 60 seconds using a WeakMap keyed by the Directus client instance. Multiple calls to `getAllTags()`, `getPostsByTag()`, etc. within the same request share the same cached data.

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<TagCloud>` | `tags`, `baseUrl?`, `className?`, `minFontSize?`, `maxFontSize?` | Weighted tag cloud with proportional sizing |
| `<TagList>` | `tags`, `baseUrl?`, `className?` | Inline tag list with links |

## API Reference

### `createTagClient(config: TagConfig): TagClient`

| Config Field | Type | Required | Description |
|-------------|------|----------|-------------|
| `directus` | `RestClient<any>` | Yes | Directus SDK client instance |
| `directusUrl` | `string` | Yes | Directus base URL for asset URLs |
| `collections.posts` | `string` | Yes | Posts collection name |
| `siteId` | `number` | No | Multi-tenant site filter |

### Client Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getAllTags()` | `Promise<string[]>` | All unique tags, sorted alphabetically |
| `getPostsByTag(tag, limit?)` | `Promise<TaggedPost[]>` | Posts with the given tag |
| `getRelatedByTags(tags, excludeSlug?, limit?)` | `Promise<TaggedPost[]>` | Posts sharing tags, sorted by overlap |
| `getTagCounts()` | `Promise<TagCount[]>` | Tags with post counts, sorted by count desc |

### `TaggedPost`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string \| number` | Post ID |
| `title` | `string` | Post title |
| `slug` | `string` | Post slug |
| `excerpt` | `string?` | Post excerpt |
| `tags` | `string[]` | All tags on the post |
| `publishedDate` | `string?` | Publication date |
| `featuredImage` | `string?` | Featured image URL |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl` |
| `collections.posts` | `"stopabo_de_posts"` |
| `siteId` | `1`, `4` (or omit for single-tenant) |
| `baseUrl` (components) | `"/tags"`, `"/blog/tags"` |
