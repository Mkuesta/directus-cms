# @directus-cms/search

Site-wide search across posts, products, and pages using Directus `_icontains` filter composition. Supports weighted field searching, snippet extraction with highlighting, and a search results component.

## Prerequisites

- A Directus instance with collections to search
- `@directus/sdk` installed in your site

## Installation

```bash
npm install ../../directus-cms-search --legacy-peer-deps
```

## Setup

```ts
// lib/search.ts
import { createSearchClient } from '@directus-cms/search';
import { directus, COLLECTION_PREFIX } from './cms';

export const search = createSearchClient({
  directus,
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  collections: [
    {
      collection: `${COLLECTION_PREFIX}_posts`,
      type: 'post',
      searchFields: ['title', 'content', 'excerpt'],  // ordered by weight: title matches rank highest
      resultFields: ['id', 'title', 'slug', 'excerpt', 'featured_image'],
      titleField: 'title',
      slugField: 'slug',
      excerptField: 'excerpt',
      imageField: 'featured_image',
      baseFilter: { status: { _eq: 'published' } },
      urlPrefix: '/blog',
    },
    {
      collection: `${COLLECTION_PREFIX}_products`,
      type: 'product',
      searchFields: ['title', 'description', 'short_description'],
      resultFields: ['id', 'title', 'slug', 'short_description', 'image'],
      titleField: 'title',
      slugField: 'slug',
      excerptField: 'short_description',
      imageField: 'image',
      baseFilter: { status: { _eq: 'published' } },
      urlPrefix: '/products',
    },
    {
      collection: `${COLLECTION_PREFIX}_pages`,
      type: 'page',
      searchFields: ['title', 'content', 'excerpt'],
      resultFields: ['id', 'title', 'slug', 'excerpt'],
      titleField: 'title',
      slugField: 'slug',
      excerptField: 'excerpt',
      baseFilter: { status: { _eq: 'published' } },
      urlPrefix: '',
    },
  ],
  siteId: 1,        // optional, for multi-tenancy
  defaultLimit: 20,  // optional
});
```

## Usage

### Search All Content

```ts
import { search } from '@/lib/search';

const results = await search.search('vitamin c serum');
// → {
//   query: 'vitamin c serum',
//   results: [
//     { type: 'product', id: 5, title: 'Vitamin C Serum', slug: 'vitamin-c-serum',
//       url: '/products/vitamin-c-serum', snippet: '...potent vitamin C serum...', score: 1.0 },
//     { type: 'post', id: 12, title: 'Guide to Vitamin C', slug: 'guide-to-vitamin-c',
//       url: '/blog/guide-to-vitamin-c', snippet: '...benefits of vitamin C...', score: 0.7 },
//   ],
//   counts: { product: 1, post: 1 },
//   total: 2,
// }
```

### Search by Type

```ts
const blogResults = await search.searchByType('post', 'skincare tips');
// → SearchResult[]  (only posts)
```

### With Pagination

```ts
const page2 = await search.search('skincare', { limit: 10, offset: 10 });
```

### Filter by Types

```ts
const results = await search.search('serum', { types: ['product', 'post'] });
```

### API Route

```ts
// app/api/search/route.ts
import { search } from '@/lib/search';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const results = await search.search(query, { limit: 20 });
  return Response.json(results);
}
```

### Search Results Component

```tsx
import { SearchResults } from '@directus-cms/search/components';

export function SearchPage({ results, query }) {
  return (
    <SearchResults
      results={results}
      query={query}
      emptyMessage="No results found. Try a different search term."
      className="search-results"
    />
  );
}
```

Custom result rendering:

```tsx
<SearchResults
  results={results}
  query={query}
  renderResult={(result, query) => (
    <div key={`${result.type}-${result.id}`}>
      <a href={result.url}><h3>{result.title}</h3></a>
      <p>{result.snippet}</p>
      <span>{result.type} — Score: {result.score}</span>
    </div>
  )}
/>
```

### Snippet Extraction

```ts
import { extractSnippet } from '@directus-cms/search';

const { snippet, highlights } = extractSnippet(
  '<p>This is a long article about vitamin C serums and their benefits...</p>',
  'vitamin C',
  200, // max length
);
// snippet: '...article about vitamin C serums and their benefits...'
// highlights: [{ start: 16, end: 25 }]
```

## How Scoring Works

Results are scored 0–1 based on which field matched:
- **Title match** (1st field): score 1.0
- **Content match** (2nd field): score 0.7
- **Description match** (3rd field): score 0.4
- **Other fields**: score 0.2

Partial term matching is supported — multi-word queries score based on the fraction of terms found.

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<SearchResults>` | `results`, `query`, `renderResult?`, `emptyMessage?`, `className?` | Renders search results with query term highlighting |

## API Reference

### `createSearchClient(config: SearchConfig): SearchClient`

| Config Field | Type | Required | Description |
|-------------|------|----------|-------------|
| `directus` | `RestClient<any>` | Yes | Directus SDK client instance |
| `directusUrl` | `string` | Yes | Directus base URL for asset URLs |
| `collections` | `SearchableCollection[]` | Yes | Collections to search |
| `siteId` | `number` | No | Multi-tenant site filter |
| `defaultLimit` | `number` | No | Default result limit (default: 20) |

### `SearchableCollection`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection` | `string` | Yes | Directus collection name |
| `type` | `string` | Yes | Type identifier (e.g. `'post'`) |
| `searchFields` | `string[]` | Yes | Fields to search, ordered by weight |
| `resultFields` | `string[]` | Yes | Fields to return |
| `titleField` | `string` | Yes | Field used for result title |
| `slugField` | `string` | Yes | Field used for result slug |
| `excerptField` | `string` | No | Field for snippet source |
| `imageField` | `string` | No | Field for result image |
| `baseFilter` | `Record<string, any>` | No | Base Directus filter (e.g. `{ status: { _eq: 'published' } }`) |
| `urlPrefix` | `string` | Yes | URL prefix for result URLs |

### Client Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `search(query, options?)` | `Promise<SearchResponse>` | Search all configured collections |
| `searchByType(type, query, options?)` | `Promise<SearchResult[]>` | Search a single collection type |

### `SearchResult`

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Collection type identifier |
| `id` | `string \| number` | Item ID |
| `title` | `string` | Result title |
| `slug` | `string` | Result slug |
| `url` | `string` | Full URL path |
| `snippet` | `string?` | Text snippet around match |
| `highlights` | `{start, end}[]?` | Highlight positions in snippet |
| `imageUrl` | `string?` | Image URL |
| `score` | `number` | Relevance score (0–1) |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl` |
| `siteId` | `1`, `4` (or omit for single-tenant) |
| `collections[].urlPrefix` | `'/blog'`, `'/products'`, `'/guides'` |
