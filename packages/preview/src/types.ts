import type { RestClient } from '@directus/sdk';

export interface PreviewCollections {
  /** Posts collection name (e.g. 'mysite_posts') */
  posts?: string;
  /** Products collection name (e.g. 'mysite_products') */
  products?: string;
  /** Pages collection name (e.g. 'mysite_pages') */
  pages?: string;
}

export interface PreviewConfig {
  /** Directus SDK client with ADMIN token (bypasses status filter) */
  directus: RestClient<any>;
  /** Base URL of the Directus instance, used for constructing asset URLs (e.g. "https://cms.example.com") */
  directusUrl: string;
  /** Collection name mappings for posts, products, and pages */
  collections: PreviewCollections;
  /** Secret for HMAC URL signing */
  previewSecret: string;
  /** Default redirect path after enabling preview */
  defaultRedirect?: string;
  /** Site identifier for multi-tenant filtering; scopes preview queries to this site */
  siteId?: number;
  /** Token expiry in seconds (default: 3600 = 1 hour) */
  tokenExpiry?: number;
}

export interface PreviewClient {
  /** The bound preview configuration */
  config: PreviewConfig;
  /** Fetch a draft/unpublished post by slug, bypassing status filters */
  getPreviewPost: (slug: string) => Promise<PreviewItem | null>;
  /** Fetch a draft/unpublished product by slug, bypassing status filters */
  getPreviewProduct: (slug: string) => Promise<PreviewItem | null>;
  /** Fetch a draft/unpublished page by slug, bypassing status filters */
  getPreviewPage: (slug: string) => Promise<PreviewItem | null>;
  /** Generate an HMAC-signed preview URL for the given path */
  generatePreviewUrl: (path: string) => Promise<string>;
  /** Verify that an HMAC preview token is valid and not expired */
  verifyPreviewToken: (token: string) => Promise<boolean>;
  /** Retrieve all items with a scheduled publish date in the future */
  getScheduledContent: () => Promise<ScheduledItem[]>;
  /** Publish all items whose scheduled publish date has passed, returning a summary */
  publishScheduledContent: () => Promise<PublishResult>;
}

export interface PreviewItem {
  /** Directus item ID */
  id: string | number;
  /** Display title of the item */
  title: string;
  /** URL slug for the item */
  slug: string;
  /** Full content body (Markdown or HTML) */
  content?: string;
  /** Directus workflow status (e.g. 'draft', 'published', 'scheduled') */
  status: string;
  /** Short summary or excerpt of the content */
  excerpt?: string;
  /** Directus file ID or URL for the item's featured image */
  featuredImage?: string;
  /** ISO date string when the item was published */
  publishedDate?: string;
  /** ISO date string when the item was last updated */
  updatedDate?: string;
  /** ISO date string when the item is scheduled to be published */
  scheduledPublishDate?: string;
}

export interface ScheduledItem {
  /** Directus item ID */
  id: string | number;
  /** Directus collection name this item belongs to */
  collection: string;
  /** Display title of the scheduled item */
  title: string;
  /** URL slug for the item */
  slug: string;
  /** ISO date string when this item is scheduled to be published */
  scheduledPublishDate: string;
  /** Current Directus workflow status (typically 'scheduled') */
  status: string;
}

export interface PublishResult {
  /** Number of items successfully transitioned to 'published' status */
  published: number;
  /** Error messages for items that failed to publish */
  errors: string[];
}
