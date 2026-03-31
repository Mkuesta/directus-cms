# @directus-cms/seo

SEO utilities, Schema.org structured data generation, and meta tag helpers for Directus CMS sites. Generates JSON-LD, Open Graph, Twitter Cards, canonical URLs, and breadcrumbs — all without a Directus SDK dependency.

Does NOT replace existing `<ArticleSchema>` or `<ProductSchema>` components in core/products. Provides additional generic Schema.org types and a unified meta tag system.

## Installation

```bash
npm install ../../directus-cms-seo --legacy-peer-deps
```

## Setup

```ts
// lib/seo.ts
import { createSeoClient } from '@directus-cms/seo';

export const seo = createSeoClient({
  baseUrl: 'https://mysite.com',
  siteName: 'My Site',
  defaultOgImage: 'https://mysite.com/og-default.jpg',
  twitterHandle: 'mysite',
  trailingSlash: false,
  organization: {
    name: 'My Company',
    logo: 'https://mysite.com/logo.png',
    sameAs: ['https://twitter.com/mysite', 'https://linkedin.com/company/mysite'],
    email: 'hello@mysite.com',
  },
});
```

## Usage

### Schema.org JSON-LD

Generate structured data objects and render them with the `<JsonLd>` component:

```tsx
import { seo } from '@/lib/seo';
import { JsonLd } from '@directus-cms/seo/components';

// In your layout or page
export default async function RootLayout({ children }) {
  const orgSchema = seo.generateOrganization();
  const siteSchema = seo.generateWebSite('https://mysite.com/search?q={search_term_string}');

  return (
    <html>
      <head>
        <JsonLd data={[orgSchema, siteSchema]} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Breadcrumbs

```tsx
import { seo } from '@/lib/seo';
import { JsonLd } from '@directus-cms/seo/components';

export default function ProductPage({ product, category }) {
  const breadcrumbs = seo.generateBreadcrumbList([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: category.name, url: `/products/${category.slug}` },
    { name: product.title, url: `/products/${category.slug}/${product.slug}` },
  ]);

  return <JsonLd data={breadcrumbs} />;
}
```

Or build breadcrumbs from path segments:

```ts
import { buildBreadcrumbs } from '@directus-cms/seo';

const items = buildBreadcrumbs('https://mysite.com', [
  { label: 'Products', path: '/products' },
  { label: 'Skincare', path: '/skincare' },
]);
// → [{ name: 'Home', url: 'https://mysite.com' },
//    { name: 'Products', url: 'https://mysite.com/products' },
//    { name: 'Skincare', url: 'https://mysite.com/products/skincare' }]
```

### FAQ Page

```tsx
const faqSchema = seo.generateFAQPage({
  questions: [
    { question: 'What is your return policy?', answer: '30-day money-back guarantee.' },
    { question: 'Do you ship internationally?', answer: 'Yes, we ship to 50+ countries.' },
  ],
});
```

### HowTo

```tsx
const howtoSchema = seo.generateHowTo({
  name: 'How to Apply Vitamin C Serum',
  description: 'A step-by-step guide to applying vitamin C serum correctly.',
  totalTime: 'PT5M',
  steps: [
    { name: 'Cleanse', text: 'Wash your face with a gentle cleanser.' },
    { name: 'Apply', text: 'Apply 3-4 drops of serum to your face.' },
    { name: 'Moisturize', text: 'Follow with your daily moisturizer.' },
  ],
});
```

### Event, LocalBusiness, VideoObject

```tsx
const event = seo.generateEvent({
  name: 'Product Launch Webinar',
  startDate: '2024-03-15T18:00:00Z',
  location: { name: 'Online' },
  offers: [{ price: '0', currency: 'EUR', availability: 'InStock' }],
});

const business = seo.generateLocalBusiness({
  type: 'Pharmacy',
  address: { streetAddress: '123 Main St', addressLocality: 'Berlin', addressCountry: 'DE' },
  geo: { latitude: 52.52, longitude: 13.405 },
  telephone: '+49-30-1234567',
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-14:00'],
});

const video = seo.generateVideoObject({
  name: 'How to Use Our Product',
  description: 'A 5-minute tutorial.',
  thumbnailUrl: 'https://mysite.com/thumb.jpg',
  uploadDate: '2024-01-15',
  embedUrl: 'https://youtube.com/embed/abc123',
  duration: 'PT5M',
});
```

### Meta Tags (Next.js Metadata API)

Generate a complete metadata object for Next.js:

```ts
// app/blog/[slug]/page.tsx
import { seo } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return seo.generateMetaTags({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalPath: `/blog/${post.slug}`,
    ogImage: post.featuredImage?.url,
    ogType: 'article',
    alternateLanguages: [
      { locale: 'de', url: `https://mysite.de/blog/${post.slug}` },
    ],
  });
}
// Returns: { title, description, alternates: { canonical }, openGraph: { ... }, twitter: { ... } }
```

### Canonical URLs

```ts
const url = seo.generateCanonicalUrl('/blog/my-post');
// → 'https://mysite.com/blog/my-post'

const url = seo.generateCanonicalUrl('/blog/my-post', { page: '2' });
// → 'https://mysite.com/blog/my-post?page=2'
```

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<JsonLd data={object \| object[]} />` | `data` | Renders `<script type="application/ld+json">` tags |
| `<MetaTags meta={MetaTagResult} />` | `meta` | Renders `<meta>` and `<link>` elements for OG/Twitter/canonical |

## API Reference

### `createSeoClient(config: SeoConfig): SeoClient`

| Config Field | Type | Required | Description |
|-------------|------|----------|-------------|
| `baseUrl` | `string` | Yes | Site base URL (e.g. `https://mysite.com`) |
| `siteName` | `string` | Yes | Display name for the site |
| `defaultOgImage` | `string` | No | Fallback Open Graph image URL |
| `organization` | `OrganizationData` | No | Organization details for structured data |
| `twitterHandle` | `string` | No | Twitter/X handle (without @) |
| `trailingSlash` | `boolean` | No | Whether URLs should have trailing slashes |

### Client Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `generateBreadcrumbList(items)` | `Record<string, unknown>` | BreadcrumbList JSON-LD |
| `generateOrganization()` | `Record<string, unknown>` | Organization JSON-LD |
| `generateWebSite(searchUrl?)` | `Record<string, unknown>` | WebSite JSON-LD with optional SearchAction |
| `generateHowTo(data)` | `Record<string, unknown>` | HowTo JSON-LD |
| `generateEvent(data)` | `Record<string, unknown>` | Event JSON-LD |
| `generateFAQPage(data)` | `Record<string, unknown>` | FAQPage JSON-LD |
| `generateLocalBusiness(data?)` | `Record<string, unknown>` | LocalBusiness JSON-LD |
| `generateVideoObject(data)` | `Record<string, unknown>` | VideoObject JSON-LD |
| `generateMetaTags(input)` | `MetaTagResult` | Next.js Metadata-shaped object |
| `generateCanonicalUrl(path, params?)` | `string` | Full canonical URL |

### Standalone Functions

All client methods are also available as standalone functions:

```ts
import { generateBreadcrumbList, generateMetaTags, buildBreadcrumbs } from '@directus-cms/seo';
```
