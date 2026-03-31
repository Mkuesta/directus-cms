import type { CmsClient } from '@directus-cms/core';
import type { ProductClient } from '@directus-cms/products';

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface I18nConfig {
  defaultLocale: string;
  locales: string[];
  strategy?: 'prefix' | 'subdomain';
}

export interface StaticPageEntry {
  path: string;
  priority?: number;
  changeFrequency?: ChangeFrequency;
  lastModified?: string | Date;
}

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

export interface ContentTypeDefaults {
  changeFrequency?: ChangeFrequency;
  priority?: number;
}

export interface SitemapConfig {
  /** Canonical site URL, no trailing slash (e.g. "https://example.com") */
  baseUrl: string;
  /** CmsClient from @directus-cms/core (optional) */
  cms?: CmsClient;
  /** ProductClient from @directus-cms/products (optional) */
  products?: ProductClient;
  /** Static pages to include */
  staticPages?: StaticPageEntry[];
  /** Default change frequency for entries without one */
  defaultChangeFrequency?: ChangeFrequency;
  /** Default priority for entries without one (0.0 – 1.0) */
  defaultPriority?: number;
  /** Per-content-type defaults for changeFrequency and priority */
  contentTypeDefaults?: {
    blog?: ContentTypeDefaults;
    product?: ContentTypeDefaults;
    page?: ContentTypeDefaults;
    static?: ContentTypeDefaults;
  };
  /** Max URLs per sitemap segment (default 50000) */
  maxUrlsPerSitemap?: number;
  /** i18n configuration for hreflang alternates */
  i18n?: I18nConfig;
  /** Extra paths to disallow in robots.txt */
  robotsDisallow?: string[];
  /** Custom sitemap path, e.g. "my-secret-sitemap.xml" (default "sitemap.xml"). Also used in robots.txt unless hidden. */
  sitemapPath?: string;
  /** Hide sitemap URL from robots.txt (default false) */
  hideSitemap?: boolean;
  /** Additional external sitemap URLs to include in robots.txt */
  additionalSitemaps?: string[];
}

export interface NextSitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

export interface SitemapClient {
  /** Generate all sitemap entries (for small sites <50k URLs) */
  generateSitemap(): Promise<SitemapEntry[]>;
  /** Generate entries in Next.js MetadataRoute.Sitemap format (Date objects, ready to export) */
  generateNextSitemap(): Promise<NextSitemapEntry[]>;
  /** Generate a specific segment of sitemap entries (for sitemap index) */
  generateSitemapSegment(id: number): Promise<SitemapEntry[]>;
  /** Generate sitemap index IDs (for Next.js generateSitemaps()) */
  generateSitemapIndex(): Promise<{ id: number }[]>;
  /** Generate robots.txt configuration */
  generateRobots(): Promise<RobotsConfig>;
  /** Get blog-related sitemap entries */
  getBlogEntries(): Promise<SitemapEntry[]>;
  /** Get product-related sitemap entries */
  getProductEntries(): Promise<SitemapEntry[]>;
  /** Get static page sitemap entries */
  getStaticEntries(): SitemapEntry[];
}

export interface RobotsConfig {
  rules: {
    userAgent: string;
    allow: string[];
    disallow: string[];
  }[];
  sitemap: string[];
}
