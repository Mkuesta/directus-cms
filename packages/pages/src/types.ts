import type { RestClient } from '@directus/sdk';

// ── PageConfig: passed to createPageClient() ─────────────────────────────────

export interface PageCollections {
  /** Directus collection name for pages (e.g. "pages") */
  pages: string;
}

export interface PageConfig {
  /** A Directus SDK client instance (created with createDirectus().with(rest())) */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: PageCollections;
  /** Display name for the site (e.g. "StopAbo") */
  siteName: string;
  /** Public base URL (e.g. "https://stopabo.de") */
  baseUrl: string;
  /** URL of the Directus instance (e.g. "https://cms.drlogist.com") */
  directusUrl: string;
  /** Multi-tenant site ID for filtering (optional) */
  siteId?: number;
}

// ── Directus raw types ───────────────────────────────────────────────────────

export interface DirectusPage {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: { id: string } | null;
  parent_id?: number | null;
  template?: string;
  status: 'published' | 'draft';
  sort?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  meta_robots?: string;
  og_image?: { id: string } | null;
  published_date?: string;
  updated_date?: string;
  site?: number | null;
}

// ── Transformed types (used by consumers) ────────────────────────────────────

export interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string;
  /** Processed HTML content with heading IDs */
  html?: string;
  /** Extracted headings for table of contents */
  headings?: { id: string; text: string; level: number }[];
  excerpt?: string;
  featuredImageUrl?: string;
  parentId?: number | null;
  template?: string;
  status: 'published' | 'draft';
  sort: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  metaRobots?: string;
  ogImageUrl?: string;
  publishedDate?: string;
  updatedDate?: string;
  children?: Page[];
}

// ── PageClient: returned by createPageClient() ──────────────────────────────

export interface PageClient {
  config: PageConfig;
  /** Get a single page by slug */
  getPage(slug: string): Promise<Page | null>;
  /** Get all published pages */
  getPages(): Promise<Page[]>;
  /** Get pages as a nested tree (using parent_id) */
  getPageTree(): Promise<Page[]>;
  /** Get Next.js metadata for a page */
  getPageMetadata(slug: string): Promise<PageMetadata>;
  /** Get static params for all pages (for generateStaticParams) */
  getPageStaticParams(): Promise<{ slug: string }[]>;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    images?: { url: string }[];
    type?: string;
  };
  robots?: string;
  alternates?: {
    canonical?: string;
  };
}
