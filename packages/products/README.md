# @directus-cms/products

Product catalog with multi-tenancy for Directus CMS-powered Next.js sites. Provides product fetching, category management, SEO metadata, static params, and Schema.org JSON-LD components. Depends on `@directus-cms/core` for content processing utilities.

## Prerequisites

- Next.js 14+ (App Router)
- A Directus instance with product collections set up
- `@directus/sdk` and `@directus-cms/core` installed in your site

## Installation

```bash
npm install ../../directus-cms-products --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/products": "file:../../directus-cms-products"
  }
}
```

## Setup

### 1. Product Config

Create `lib/products.ts` in your site:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createProductClient } from '@directus-cms/products';

const COLLECTION_PREFIX = 'listenportal';

export const products = createProductClient({
  directus: createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest()),
  collections: {
    products: `${COLLECTION_PREFIX}_products`,
    categories: `${COLLECTION_PREFIX}_categories`,
    settings: `${COLLECTION_PREFIX}_settings`,
  },
  siteName: 'Listenportal',
  baseUrl: 'https://listenportal.de',
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  siteId: 4,
  currency: 'EUR',
  productRoute: 'produkt',
  categoryRoute: 'kategorie',
  listingRoute: 'listen',
  locale: 'de_DE',
  organization: {
    logo: 'https://listenportal.de/logo.png',
    description: 'Digital product marketplace',
  },
});
```

## Usage

### Fetching Products

```ts
// Get paginated products
const { products, pagination } = await products.getProducts({ page: 1, pageSize: 12 });

// Get a single product by slug
const product = await products.getProductBySlug('premium-template');

// Filter by category
const { products } = await products.getProducts({ category: 'templates' });

// Filter featured / on sale / free
const { products } = await products.getProducts({ featured: true });
const { products } = await products.getProducts({ onSale: true });
const { products } = await products.getProducts({ free: true });

// Related products
const related = await products.getRelatedProducts(product.id, 'templates', 4);
```

### Product Categories

```ts
const categories = await products.getProductCategories();
const category = await products.getProductCategoryBySlug('templates');
```

### SEO Metadata

```ts
// Product detail page
export async function generateMetadata({ params }) {
  return products.getProductMetadata(params.slug);
}

// Category page
export async function generateMetadata({ params }) {
  return products.getCategoryMetadata(params.slug);
}

// Product listing index
export async function generateMetadata() {
  return products.getProductIndexMetadata();
}
```

### Static Params (SSG)

```ts
// For /produkt/[slug] routes
export async function generateStaticParams() {
  return products.getProductStaticParams();
  // → [{ slug: 'premium-template' }, ...]
}

// For /kategorie/[slug] routes
export async function generateStaticParams() {
  return products.getCategoryStaticParams();
  // → [{ slug: 'templates' }, ...]
}
```

### SEO Article Content

```ts
const { html, headings } = products.processProductSeoContent(product.seoArticle ?? '');
// html: sanitized HTML with heading IDs
// headings: [{ id, text, level }, ...] for table of contents
```

### Schema.org Components

```tsx
import { ProductSchema, CategoryListSchema } from '@directus-cms/products/components';

// On product detail pages
<ProductSchema product={product} config={products.config} />

// On category listing pages
<CategoryListSchema products={productList} config={products.config} />
```

## Directus Collections

### Products Collection (`{prefix}_products`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Product name |
| `slug` | String | URL slug |
| `description` | Text | Full description |
| `short_description` | Text | Summary |
| `price` | Float | Price |
| `compare_at_price` | Float | Original price (for sale display) |
| `file_format` | String | e.g. "PDF", "XLSX" |
| `file_size` | String | e.g. "2.4 MB" |
| `file_url` | String | Download URL |
| `status` | Dropdown | `published`, `draft` |
| `featured` | Boolean | Featured product flag |
| `sku` | String | Product SKU |
| `category` | M2O | Reference to categories collection |
| `image` | File | Product image |
| `preview_images` | Files | Additional images |
| `site` | M2O | Multi-tenant site reference |
| `seo_article` | Text | Long-form SEO content (Markdown) |
| `seo_article_title` | String | SEO article heading |

### Categories Collection (`{prefix}_categories`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Category name |
| `slug` | String | URL slug |
| `description` | Text | Category description |
| `featured` | Boolean | Featured category flag |
| `display_order` | Integer | Sort order |
| `site` | M2O | Multi-tenant site reference |

## Multi-Tenancy

Products and categories are filtered by `siteId` — each site only sees its own data. This allows multiple sites to share a single Directus instance.

## API Reference

### `createProductClient(config: ProductConfig): ProductClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `getProducts(options?)` | `{ products, pagination }` | Paginated products with optional filters |
| `getProductBySlug(slug)` | `Product \| null` | Single product by slug |
| `getRelatedProducts(id, category?, limit?)` | `Product[]` | Related products |
| `getProductCategories()` | `ProductCategory[]` | All categories for this site |
| `getProductCategoryBySlug(slug)` | `ProductCategory \| null` | Single category |
| `getProductMetadata(slug)` | `Metadata` | Next.js metadata for product pages |
| `getCategoryMetadata(slug)` | `Metadata` | Next.js metadata for category pages |
| `getProductIndexMetadata()` | `Metadata` | Next.js metadata for listing page |
| `getProductStaticParams()` | `{ slug }[]` | Static params for product routes |
| `getCategoryStaticParams()` | `{ slug }[]` | Static params for category routes |
| `processProductSeoContent(markdown)` | `{ html, headings }` | Process SEO article content |
| `getDirectusAssetUrl(fileId)` | `string` | Directus asset URL |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `listenportal`, `shopsite` |
| `siteName` | `"Listenportal"`, `"ShopSite"` |
| `siteId` | `4`, `7` |
| `currency` | `"EUR"`, `"USD"` |
| `productRoute` | `"produkt"`, `"product"` |
| `categoryRoute` | `"kategorie"`, `"category"` |
| `listingRoute` | `"listen"`, `"products"` |
| `locale` | `"de_DE"`, `"en_US"` |
