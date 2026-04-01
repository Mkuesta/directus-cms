import type { RestClient } from '@directus/sdk';
import type { DirectusFile, CollectionFieldMappings } from '@mkuesta/core';

// ── ProductConfig: passed to createProductClient() ──────────────────────────

export interface ProductCollections {
  products: string;
  categories: string;
  settings: string;
}

export interface OrganizationConfig {
  /** Organization logo URL */
  logo?: string;
  /** Social profile URLs (Facebook, Twitter, LinkedIn, etc.) */
  sameAs?: string[];
  /** Contact email */
  email?: string;
  /** Contact phone */
  telephone?: string;
  /** Legal business name (if different from siteName) */
  legalName?: string;
  /** Short description of the organization */
  description?: string;
}

export interface ProductConfig {
  /** A Directus SDK client instance (created with createDirectus().with(rest())) */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: ProductCollections;
  /** Display name for the site (e.g. "Listenportal") */
  siteName: string;
  /** Public base URL (e.g. "https://listenportal.de") */
  baseUrl: string;
  /** URL of the Directus instance (e.g. "https://cms.drlogist.com") */
  directusUrl: string;
  /** Multi-tenant site ID for filtering (e.g. 4 for Listenportal). Omit to skip site filtering. */
  siteId?: number;
  /** Currency code for schema.org Offer (e.g. "EUR") */
  currency: string;
  /** URL segment for product detail pages (e.g. "produkt") */
  productRoute: string;
  /** URL segment for category pages (e.g. "kategorie") */
  categoryRoute: string;
  /** URL segment for product listing page (e.g. "listen") */
  listingRoute: string;
  /** Locale for OpenGraph (e.g. "de_DE") */
  locale?: string;
  /** Organization details for JSON-LD schema — set once, applies to all pages */
  organization?: OrganizationConfig;
  /** Default author name for product pages (visible byline + meta author + Person schema) */
  defaultAuthor?: string;
  /** Default author job title */
  defaultAuthorTitle?: string;
  /**
   * Optional field name mappings when Directus uses different field names
   * than the package expects. Key = collection logical name (e.g. "products"),
   * value = mapping of { packageFieldName: 'actualDirectusFieldName' }.
   */
  fieldMapping?: CollectionFieldMappings;
}

// ── Directus raw types ──────────────────────────────────────────────────────

export interface DirectusSite {
  id: number;
  name: string;
  domain: string;
  locale: string;
  currency: string;
}

export interface DirectusProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  display_order: number;
  site?: DirectusSite | number;
}

export interface DirectusProductFull {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  file_format?: string;
  file_size?: string;
  file_url?: string;
  status: 'draft' | 'published';
  featured: boolean;
  sku?: string;
  publisher?: string;
  vat_included?: boolean;
  vat_rate?: number;
  average_rating?: number;
  review_count?: number;
  target_audience?: string;
  features?: string[];
  tags?: string[] | Array<{ name: string }>;
  category?: DirectusProductCategory;
  site?: DirectusSite | number;
  image?: DirectusFile;
  preview_images?: DirectusFile[];
  seo_article?: string;
  seo_article_title?: string;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;
  date_created?: string;
  date_updated?: string;
}

// ── Transformed types (used by consumers) ───────────────────────────────────

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  fileFormat?: string;
  fileSize?: string;
  fileUrl?: string;
  status: 'draft' | 'published';
  featured: boolean;
  sku?: string;
  publisher?: string;
  vatIncluded?: boolean;
  vatRate?: number;
  averageRating?: number;
  reviewCount?: number;
  targetAudience?: string;
  features?: string[];
  tags: string[];
  category?: ProductCategory;
  imageUrl?: string;
  previewImageUrls: string[];
  seoArticle?: string;
  seoArticleTitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  faqs?: ProductFAQ[];
  howToSteps?: ProductHowToStep[];
  tables?: ProductTable[];
  itemLists?: ProductItemList[];
  createdAt?: string;
  updatedAt?: string;
  /** Extra fields from Directus not known to the package */
  extras?: Record<string, unknown>;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  displayOrder: number;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductHowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface ProductTable {
  name?: string;
  schemaName?: string;
  schemaDescription?: string;
  headers: string[];
  rows: string[][];
}

export interface ProductItemList {
  name: string;
  items: string[];
}

export type ProductSortOption = 'price_asc' | 'price_desc' | 'newest' | 'featured';

export interface ProductFilterOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  fileFormats?: string[];
  onSale?: boolean;
  free?: boolean;
  /** Minimum price (inclusive) */
  priceMin?: number;
  /** Maximum price (inclusive) */
  priceMax?: number;
  /** Sort order (default: 'featured') */
  sort?: ProductSortOption;
  /** Search query — matches title and description via _icontains */
  search?: string;
  /** Filter by tag(s) */
  tags?: string[];
}

export interface ProductsResult {
  products: Product[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ── ProductClient: returned by createProductClient() ────────────────────────

export interface ProductClient {
  config: ProductConfig;

  // Products
  getProducts: (options?: ProductFilterOptions) => Promise<ProductsResult>;
  getProductBySlug: (slug: string) => Promise<Product | null>;
  getRelatedProducts: (productId: number, categorySlug?: string, limit?: number) => Promise<Product[]>;

  // Categories
  getProductCategories: () => Promise<ProductCategory[]>;
  getProductCategoryBySlug: (slug: string) => Promise<ProductCategory | null>;

  // Metadata
  getProductMetadata: (slug: string) => Promise<any>;
  getCategoryMetadata: (categorySlug: string) => Promise<any>;
  getProductIndexMetadata: () => Promise<any>;

  // Static params
  getProductStaticParams: () => Promise<{ slug: string }[]>;
  getCategoryStaticParams: () => Promise<{ slug: string }[]>;

  // Content processing
  processProductSeoContent: (markdown: string) => Promise<{ html: string; headings: { id: string; text: string; level: number }[] }>;

  // Images
  getDirectusAssetUrl: (fileId: string | undefined) => string;

  // Pricing utilities (stateless — config provides currency/locale defaults)
  formatPrice: (amount: number, currency?: string, locale?: string) => string;
  formatPriceCents: (amountCents: number, currency?: string, locale?: string) => string;
  getDiscountPercent: (price: number, compareAtPrice?: number) => number;
  isOnSale: (product: Product) => boolean;
  getSavings: (product: Product) => number;
  calculateVat: (price: number, vatRate: number, vatIncluded?: boolean) => import('./pricing.js').VatBreakdown;
  isValidVatFormat: (vatId: string) => boolean;
  getFileInfo: (product: Product) => import('./pricing.js').ProductFileInfo;
  isDigitalProduct: (product: Product) => boolean;
}
