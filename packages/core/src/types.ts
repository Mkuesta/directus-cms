import type { RestClient } from '@directus/sdk';
import type { CollectionFieldMappings } from './field-mapping';

// ── CmsConfig: passed to createCmsClient() ──────────────────────────────────

export interface CmsCollections {
  posts: string;
  settings: string;
  blogCategories: string;
  categories: string;
  products: string;
}

export interface CmsUrlBuilders {
  /** Build a post URL path. Default: /${route}/${categorySlug}/${slug} */
  post?: (slug: string, categorySlug?: string) => string;
  /** Build a category URL path. Return null to skip category pages. Default: /${route}/${categorySlug} */
  category?: (categorySlug: string) => string | null;
  /** Build the blog index URL path. Default: /${route} */
  index?: () => string;
}

export interface CmsConfig {
  /** A Directus SDK client instance (created with createDirectus().with(rest())) */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: CmsCollections;
  /** Display name for the site (e.g. "Medlead.io") */
  siteName: string;
  /** Public base URL (e.g. "https://medlead.io") */
  baseUrl: string;
  /** URL of the Directus instance (e.g. "https://cms.drlogist.com") */
  directusUrl: string;
  /** Blog route path segment (e.g. "blog") */
  route: string;
  /** Optional URL builders for custom URL patterns */
  urls?: CmsUrlBuilders;
  /** Optional site ID for multi-tenant filtering */
  siteId?: number;
  /**
   * Optional field name mappings when Directus uses different field names
   * than the package expects. Key = collection logical name (e.g. "posts"),
   * value = mapping of { packageFieldName: 'actualDirectusFieldName' }.
   */
  fieldMapping?: CollectionFieldMappings;
}

// ── Directus raw types ──────────────────────────────────────────────────────

export interface DirectusFile {
  id: string;
  title?: string;
  filename_disk: string;
  filename_download: string;
  type: string;
  filesize: number;
  width?: number;
  height?: number;
  description?: string;
}

export interface DirectusSettings {
  id: number;
  site_name?: string;
  site_title?: string;
  site_description?: string;
  default_author_name?: string;
  default_author_title?: string;
  default_author_url?: string;
  default_author_image?: DirectusFile;
  organization_description?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  default_article_image?: DirectusFile;
  default_og_image?: DirectusFile;
  default_logo?: DirectusFile;
  favicon?: DirectusFile;
  apple_touch_icon?: DirectusFile;
  theme_color?: string;
  site_tagline?: string;
  default_language?: string;
  primary_color?: string;
  secondary_color?: string;
  homepage_keywords?: string;
  default_meta_robots?: string;
  logo_initials?: string;
  contact_page_path?: string;
  default_author_twitter?: string;
  sitemap_path?: string;
}

export interface DirectusBlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  status: 'published' | 'draft';
  sort?: number;
}

export type ArticleType = 'blog' | 'product' | 'guide' | 'comparison';
export type AuthorType = 'Person' | 'Organization';

export interface DirectusPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  author_title?: string;
  author_type?: AuthorType;
  author_image?: DirectusFile;
  author_url?: string;
  author_twitter?: string;
  author_image_url?: string;
  published_date?: string;
  updated_date?: string;
  scheduled_publish_date?: string;
  status: 'published' | 'draft' | 'archived';
  category?: string;
  tags?: string[];
  read_time?: number;
  article_type?: ArticleType;
  featured_image?: DirectusFile;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  meta_description?: string;
  meta_robots?: string;
  meta_tags?: string;
  canonical_url?: string;
  og_image?: string;
  og_image_alt?: string;
  og_title?: string;
  og_description?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_image_alt?: string;
  faqs_json?: string;
  howto_json?: string;
  tables_json?: string;
  itemlists_json?: string;
  language?: string;
}

export interface DirectusCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  seo_article_content?: string;
  cta_text?: string;
  cta_url?: string;
  lead_count?: number;
  status: 'published' | 'draft';
  sort?: number;
  parent_id?: string;
  parent?: any;
  children?: DirectusCategory[];
}

export interface DirectusProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price?: number;
  currency?: string;
  file_format?: string;
  vat_rate?: number;
  sku?: string;
  category?: string;
  image?: DirectusFile;
  is_featured?: boolean;
  status: 'published' | 'draft';
  features?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_article_title?: string;
  seo_article?: string;
}

export interface DirectusResponse<T> {
  data: T;
  meta?: {
    filter_count?: number;
    total_count?: number;
  };
}

export interface DirectusCollectionResponse<T> {
  data: T[];
  meta?: {
    filter_count?: number;
    total_count?: number;
  };
}

// ── Transformed types (used by consumers) ───────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface TableItem {
  name?: string;
  schemaName?: string;
  schemaDescription?: string;
  headers: string[];
  rows: string[][];
}

export interface ItemListData {
  name: string;
  items: string[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  authorTitle?: string;
  authorType?: AuthorType;
  authorUrl?: string;
  publishedDate: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  readingTime?: number;
  articleType?: ArticleType;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  authorImage?: {
    url: string;
    alt?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  canonicalUrl?: string;
  metaRobots?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogTitle?: string;
  ogDescription?: string;
  authorTwitter?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  faqs?: FAQItem[];
  howToSteps?: HowToStep[];
  tables?: TableItem[];
  itemLists?: ItemListData[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  blogCategory?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  /** Extra fields from Directus not known to the package */
  extras?: Record<string, unknown>;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sort?: number;
}

export interface SiteSettings {
  siteName: string;
  siteTitle?: string;
  siteDescription?: string;
  defaultAuthorName?: string;
  defaultAuthorTitle?: string;
  defaultAuthorUrl?: string;
  defaultAuthorImageUrl?: string;
  logoUrl?: string;
  ogImageUrl?: string;
  defaultArticleImageUrl?: string;
  faviconUrl?: string;
  appleTouchIconUrl?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  organizationDescription?: string;
  themeColor?: string;
  siteTagline?: string;
  defaultLanguage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homepageKeywords?: string[];
  defaultMetaRobots?: string;
  logoInitials?: string;
  contactPagePath?: string;
  defaultAuthorTwitter?: string;
  sitemapPath?: string;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'avif' | 'auto';
}

// ── CmsClient: returned by createCmsClient() ───────────────────────────────

export interface CmsClient {
  config: CmsConfig;
  getPosts: (options?: {
    page?: number;
    pageSize?: number;
    status?: 'draft' | 'published';
    category?: string;
    featured?: boolean;
  }) => Promise<{ posts: Post[]; pagination: any }>;
  getPostBySlug: (slug: string) => Promise<Post | null>;
  getRecentPosts: (limit?: number) => Promise<Post[]>;
  getBlogCategories: () => Promise<BlogCategory[]>;
  getBlogCategoryBySlug: (slug: string) => Promise<BlogCategory | null>;
  getCategoryWithCount: (category: BlogCategory) => { label: string; value: string; count: number; description?: string };
  getSettings: () => Promise<SiteSettings>;
  getArticleMetadata: (slug: string, category: string) => Promise<any>;
  getCategoryMetadata: (categorySlug: string) => Promise<any>;
  getBlogIndexMetadata: () => Promise<any>;
  getCategoryStaticParams: () => Promise<{ category: string }[]>;
  getArticleStaticParams: () => Promise<{ category: string; slug: string }[]>;
  getDirectusAssetUrl: (fileId: string | undefined | null) => string | undefined;
  getDirectusImageUrl: (fileId: string | undefined | null, options?: ImageTransformOptions) => string | undefined;
  toAbsoluteAssetUrl: (path: string | undefined | null) => string | undefined;
}
