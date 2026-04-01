// Directus CMS configuration
const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
if (!directusUrl && process.env.NODE_ENV === 'production') {
  console.error("CRITICAL: DIRECTUS_URL not configured for production");
}
export const DIRECTUS_URL = directusUrl || 'https://cms.drlogist.com';

const directusToken = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;
if (!directusToken && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: DIRECTUS_TOKEN not configured. Authenticated CMS features may not work.");
}
export const DIRECTUS_TOKEN = directusToken || '';

// Dedicated collection names for Medlead
export const COLLECTIONS = {
  settings: 'medlead_settings',
  blogCategories: 'medlead_blog_categories',
  posts: 'medlead_posts',
  categories: 'medlead_categories',
  products: 'medlead_products',
  emailTemplates: 'medlead_email_templates',
  emailLog: 'medlead_email_log',
  subscribers: 'medlead_subscribers',
  analyticsSettings: 'medlead_analytics_settings',
  navigationItems: 'medlead_navigation_items',
  banners: 'medlead_banners',
  redirects: 'medlead_redirects',
  formSubmissions: 'medlead_form_submissions',
  pages: 'medlead_pages',
} as const;

// Multi-site configuration (IDs must match Directus sites collection)
export const SITE_MAP: Record<string, { id: number; locale: string; currency: string }> = {
  'vorlagen.de': { id: 2, locale: 'de', currency: 'EUR' },
  'www.vorlagen.de': { id: 2, locale: 'de', currency: 'EUR' },
  'wonder.legal': { id: 3, locale: 'en', currency: 'USD' },
  'www.wonder.legal': { id: 3, locale: 'en', currency: 'USD' },
  'listenportal.de': { id: 4, locale: 'de', currency: 'EUR' },
  'www.listenportal.de': { id: 4, locale: 'de', currency: 'EUR' },
  'branchenlisten.de': { id: 5, locale: 'de', currency: 'EUR' },
  'www.branchenlisten.de': { id: 5, locale: 'de', currency: 'EUR' },
  'artzdata.de': { id: 6, locale: 'en', currency: 'EUR' },
  'www.artzdata.de': { id: 6, locale: 'en', currency: 'EUR' },
  'medlead.io': { id: 20, locale: 'en', currency: 'USD' },
  'www.medlead.io': { id: 20, locale: 'en', currency: 'USD' },
  'localhost': { id: 20, locale: 'en', currency: 'USD' },
};

// Current site ID for this application (medlead.io)
export const CURRENT_SITE_ID = 20;

// Get current site based on hostname
export function getCurrentSite() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return SITE_MAP[hostname] || SITE_MAP['medlead.io'];
  }
  return SITE_MAP['medlead.io'];
}

// Get site ID for server-side
export function getSiteId(hostname?: string) {
  if (hostname && SITE_MAP[hostname]) {
    return SITE_MAP[hostname].id;
  }
  return CURRENT_SITE_ID;
}
