import type { RestClient } from '@directus/sdk';

export interface AdminConfig {
  /** A Directus SDK client instance (write-capable) */
  directus: RestClient<any>;
  /** URL of the Directus instance */
  directusUrl: string;
  /** Directus static token for file uploads (server-side only) */
  directusToken: string;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: {
    posts: string;
    settings: string;
    blogCategories?: string;
    products?: string;
    productCategories?: string;
    subscribers?: string;
    notificationTemplates?: string;
  };
  /** Display name for the site */
  siteName: string;
  /** Secret for signing session cookies (use a random string) */
  adminSecret: string;
  /** Multi-tenant site ID for product filtering */
  siteId?: number;
}
