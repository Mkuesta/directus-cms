/**
 * Directus CMS configuration.
 *
 * IMPORTANT:
 * - DIRECTUS_STATIC_TOKEN = public read-only token (used for fetching content)
 * - DIRECTUS_TOKEN = admin write token (used for preview/scheduling — must have WRITE access)
 * - Do NOT set siteId if your collections don't have a 'site' column
 * - COLLECTION_PREFIX must match what you used in provision-directus-site
 */

// ── Connection ──────────────────────────────────────────────────────────────
export const DIRECTUS_URL = (process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://cms.drlogist.com').trim();
export const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || '';

// ── Site identity ───────────────────────────────────────────────────────────
export const SITE_NAME = 'My Site';  // TODO: change to your site name
export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com').trim();

// ── Collection prefix ───────────────────────────────────────────────────────
// Change this to match your Directus prefix (e.g. 'mysite', 'acme', 'ml')
const PREFIX = 'mysite';  // TODO: change to your prefix

export const COLLECTIONS = {
  settings: `${PREFIX}_settings`,
  posts: `${PREFIX}_posts`,
  blogCategories: `${PREFIX}_blog_categories`,
  categories: `${PREFIX}_categories`,
  products: `${PREFIX}_products`,
  pages: `${PREFIX}_pages`,
  navigationItems: `${PREFIX}_navigation_items`,
  formSubmissions: `${PREFIX}_form_submissions`,
  analyticsSettings: `${PREFIX}_analytics_settings`,
  redirects: `${PREFIX}_redirects`,
  banners: `${PREFIX}_banners`,
  translations: `${PREFIX}_translations`,
  subscribers: `${PREFIX}_subscribers`,
  emailTemplates: `${PREFIX}_email_templates`,
  emailLog: `${PREFIX}_email_log`,
  notificationTemplates: `${PREFIX}_notification_templates`,
} as const;

// ── Multi-tenancy (optional) ────────────────────────────────────────────────
// Only set this if your collections have a 'site' column.
// If they don't, leave undefined — otherwise queries silently return 0 results.
export const SITE_ID: number | undefined = undefined;

// ── Routes ──────────────────────────────────────────────────────────────────
// These MUST match the actual Next.js file-system routes in app/
// e.g. if blog is at app/blog/, set BLOG_ROUTE = 'blog'
// If products are at app/products/, set PRODUCT_ROUTE = 'products'
export const BLOG_ROUTE = 'blog';       // TODO: change if different
export const PRODUCT_ROUTE = 'products'; // TODO: change if different
