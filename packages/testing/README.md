# @directus-cms/testing

Test utilities, mock factories, and fixtures for unit testing `@directus-cms/*` packages. Provides everything you need to test CMS code without a running Directus instance.

## Prerequisites

- `vitest >=3.0.0` (peer dependency)

## Installation

```bash
npm install --save-dev ../../directus-cms-testing
```

## Mock Directus Client

Create a mock client that intercepts all `request()` calls and returns configured data:

```ts
import { createMockDirectus } from '@directus-cms/testing';

// Basic mock — returns empty arrays by default
const mockClient = createMockDirectus();

// Mock with configured data
const mockClient = createMockDirectus({
  data: {
    my_posts: [
      { id: 1, title: 'Hello', slug: 'hello', status: 'published' },
    ],
  },
  singletons: {
    my_settings: { site_name: 'Test Site' },
  },
});

// Use it like a real Directus client
const result = await mockClient.request(readItems('my_posts'));
// → [{ id: 1, title: 'Hello', ... }]

// Inspect calls
console.log(mockClient._calls.length); // 1
console.log(mockClient._calls[0].query); // the readItems query

// Reset call tracking
mockClient._reset();
```

### Failure Mode

```ts
const failingClient = createMockDirectus({ shouldFail: true });
await failingClient.request(anything); // throws Error('Mock Directus request failed')

const customError = createMockDirectus({
  shouldFail: true,
  error: new Error('Network timeout'),
});
```

## Config Factories

Pre-configured mock configs for every package type:

```ts
import {
  createMockCmsConfig,
  createMockProductConfig,
  createMockAnalyticsConfig,
  createMockNavigationConfig,
  createMockBannerConfig,
  createMockRedirectConfig,
  createMockI18nConfig,
  createMockFormConfig,
} from '@directus-cms/testing';

// Each returns a complete config with sensible defaults
const config = createMockCmsConfig();
// → { directus: MockClient, collections: { posts: 'test_posts', ... }, siteName: 'Test Site', ... }

// Override any field
const config = createMockCmsConfig({
  siteName: 'My Custom Site',
  baseUrl: 'https://custom.example.com',
});
```

## Fixture Factories

Realistic domain objects with auto-incrementing IDs. Each type has two versions: Directus raw (snake_case) and transformed (camelCase).

```ts
import {
  createPost, createDirectusPost,
  createProduct, createDirectusProduct,
  createBlogCategory, createDirectusBlogCategory,
  createSiteSettings, createDirectusSiteSettings,
  createBanner, createDirectusBanner,
  createMenuItem, createDirectusNavigationItem,
  createRedirect, createDirectusRedirect,
  createPage, createDirectusPage,
} from '@directus-cms/testing';

// Transformed (camelCase) — what your app code works with
const post = createPost();
// → { id: '1', title: 'Test Post 1', slug: 'test-post-1', authorTitle: '...', publishedDate: '...' }

// Raw Directus (snake_case) — what the API returns
const rawPost = createDirectusPost();
// → { id: '1', title: 'Test Post 1', slug: 'test-post-1', author_title: '...', published_date: '...' }

// Override any field
const draft = createPost({ status: 'draft', title: 'My Draft' });

// IDs auto-increment across calls
const post1 = createPost(); // id: '3'
const post2 = createPost(); // id: '4'
```

## Assertion Helpers

### `expectJsonLd(html, expectedType, expectedProps?)`

Assert that an HTML string contains a valid JSON-LD script tag:

```ts
import { expectJsonLd } from '@directus-cms/testing';

const html = renderToString(<ArticleSchema post={post} config={config} />);
expectJsonLd(html, 'Article', { headline: 'My Post Title' });
```

## Cleanup Utilities

```ts
import { createTmpDir, removeTmpDir } from '@directus-cms/testing';

const dir = createTmpDir(); // creates temp directory
// ... write test files ...
removeTmpDir(dir); // cleans up
```

## Example: Testing a CMS Function

```ts
import { describe, it, expect } from 'vitest';
import { createMockCmsConfig, createDirectusPost } from '@directus-cms/testing';

describe('getPostBySlug', () => {
  it('returns transformed post', async () => {
    const config = createMockCmsConfig({
      directus: createMockDirectus({
        data: {
          test_posts: [createDirectusPost({ slug: 'hello-world' })],
        },
      }),
    });

    const post = await getPostBySlug(config, 'hello-world');
    expect(post).toBeDefined();
    expect(post.slug).toBe('hello-world');
  });
});
```

## API Reference

### Mock Client

| Export | Description |
|--------|-------------|
| `createMockDirectus(config?)` | Mock Directus client with configurable responses |

### Config Factories

| Export | Returns |
|--------|---------|
| `createMockCmsConfig(overrides?)` | `MockCmsConfig` with core collections |
| `createMockProductConfig(overrides?)` | `MockProductConfig` with siteId, currency |
| `createMockAnalyticsConfig(overrides?)` | `MockAnalyticsConfig` |
| `createMockNavigationConfig(overrides?)` | `MockNavigationConfig` |
| `createMockBannerConfig(overrides?)` | `MockBannerConfig` |
| `createMockRedirectConfig(overrides?)` | `MockRedirectConfig` |
| `createMockI18nConfig(overrides?)` | `MockI18nConfig` with locales |
| `createMockFormConfig(overrides?)` | `MockFormConfig` |

### Fixture Factories

| Transformed (camelCase) | Raw (snake_case) | Domain |
|------------------------|-------------------|--------|
| `createPost()` | `createDirectusPost()` | Blog posts |
| `createProduct()` | `createDirectusProduct()` | Products |
| `createBlogCategory()` | `createDirectusBlogCategory()` | Categories |
| `createSiteSettings()` | `createDirectusSiteSettings()` | Site settings |
| `createBanner()` | `createDirectusBanner()` | Banners |
| `createMenuItem()` | `createDirectusNavigationItem()` | Navigation |
| `createRedirect()` | `createDirectusRedirect()` | Redirects |
| `createPage()` | `createDirectusPage()` | Pages |
