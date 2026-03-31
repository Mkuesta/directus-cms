export interface MockDirectusConfig {
  /** Map of collection names to their mock data */
  data?: Record<string, any[]>;
  /** Map of singleton collection names to their mock data */
  singletons?: Record<string, any>;
  /** Whether request() should reject by default */
  shouldFail?: boolean;
  /** Custom error to throw */
  error?: Error;
  /** Custom resolver for routing queries to collection data */
  resolver?: (query: any) => any;
}

export interface MockDirectusClient {
  /** Simulates Directus SDK request(); resolves/rejects based on MockDirectusConfig */
  request: (query: any) => Promise<any>;
  /** Reference to the mock configuration driving this client's behavior */
  _config: MockDirectusConfig;
  /** Recorded history of all request() calls with timestamps for test assertions */
  _calls: Array<{ query: any; timestamp: number }>;
  /** Reset call history and restore the client to its initial state */
  _reset: () => void;
}

export interface MockCmsConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real CMS client config shape */
  collections: {
    /** Posts collection name (e.g. 'mysite_posts') */
    posts: string;
    /** Settings singleton collection name (e.g. 'mysite_settings') */
    settings: string;
    /** Blog categories collection name (e.g. 'mysite_blog_categories') */
    blogCategories: string;
    /** Product categories collection name (e.g. 'mysite_categories') */
    categories: string;
    /** Products collection name (e.g. 'mysite_products') */
    products: string;
  };
  /** Site display name used in metadata and structured data */
  siteName: string;
  /** Base URL of the site (e.g. "https://example.com") */
  baseUrl: string;
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
  /** Base route prefix for blog/post URLs (e.g. "/blog") */
  route: string;
}

export interface MockProductConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real product client config shape */
  collections: {
    /** Products collection name (e.g. 'mysite_products') */
    products: string;
    /** Product categories collection name (e.g. 'mysite_categories') */
    categories: string;
    /** Settings singleton collection name (e.g. 'mysite_settings') */
    settings: string;
  };
  /** Site display name used in product metadata */
  siteName: string;
  /** Base URL of the site (e.g. "https://example.com") */
  baseUrl: string;
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
  /** Numeric site identifier for multi-tenant product filtering */
  siteId: number;
  /** Currency code used for product pricing (e.g. "USD", "EUR") */
  currency: string;
  /** URL route prefix for individual product pages (e.g. "/products") */
  productRoute: string;
  /** URL route prefix for category listing pages (e.g. "/category") */
  categoryRoute: string;
  /** URL route prefix for the product listing/index page (e.g. "/shop") */
  listingRoute: string;
}

export interface MockAnalyticsConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real analytics client config shape */
  collections: {
    /** Analytics settings singleton collection name (e.g. 'mysite_analytics') */
    settings: string;
  };
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
}

export interface MockNavigationConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real navigation client config shape */
  collections: {
    /** Navigation items collection name (e.g. 'mysite_navigation') */
    items: string;
  };
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
}

export interface MockBannerConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real banner client config shape */
  collections: {
    /** Banners collection name (e.g. 'mysite_banners') */
    banners: string;
  };
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
}

export interface MockRedirectConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real redirect client config shape */
  collections: {
    /** Redirects collection name (e.g. 'mysite_redirects') */
    redirects: string;
  };
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
}

export interface MockI18nConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real i18n client config shape */
  collections: {
    /** Translations collection name (e.g. 'mysite_translations') */
    translations: string;
  };
  /** Base URL of the Directus instance (e.g. "https://cms.example.com") */
  directusUrl: string;
  /** Default locale code used as the fallback language (e.g. "en") */
  defaultLocale: string;
  /** List of supported locale codes (e.g. ["en", "fr", "de"]) */
  locales: string[];
}

export interface MockFormConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real form client config shape */
  collections: {
    /** Form submissions collection name (e.g. 'mysite_submissions') */
    submissions: string;
  };
  /** Site display name used in form submission metadata */
  siteName: string;
}

export interface MockStripeConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real Stripe client config shape */
  collections: {
    /** Orders collection name (e.g. 'mysite_orders') */
    orders: string;
    /** Products collection name for sync (e.g. 'mysite_products') */
    products: string;
  };
  /** Stripe secret key (test mode) */
  stripeSecretKey: string;
  /** Stripe webhook signing secret */
  stripeWebhookSecret: string;
  /** Stripe publishable key */
  publishableKey: string;
  /** Checkout success redirect URL */
  successUrl: string;
  /** Checkout cancel redirect URL */
  cancelUrl: string;
  /** Currency code (e.g. "eur") */
  currency: string;
  /** Multi-tenant site ID */
  siteId: number;
}

export interface MockAuthConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real auth client config shape */
  collections: {
    /** User profiles collection name (e.g. 'mysite_user_profiles') */
    userProfiles: string;
  };
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anon key */
  supabaseAnonKey: string;
  /** Supabase service role key */
  supabaseServiceRoleKey: string;
  /** Multi-tenant site ID */
  siteId: number;
}

export interface MockEmailConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real email client config shape */
  collections: {
    /** Email templates collection name (e.g. 'mysite_email_templates') */
    templates: string;
    /** Email log collection name (e.g. 'mysite_email_log') */
    log: string;
  };
  /** Resend API key */
  resendApiKey: string;
  /** Sender email address */
  fromEmail: string;
  /** Site display name */
  siteName: string;
}

export interface MockNewsletterConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real newsletter client config shape */
  collections: {
    /** Subscribers collection name (e.g. 'mysite_subscribers') */
    subscribers: string;
  };
  /** Site display name */
  siteName: string;
  /** Enable double opt-in (default true) */
  doubleOptIn?: boolean;
  /** URL users click to confirm their subscription */
  confirmationUrl?: string;
}

export interface MockNotificationConfig {
  /** Mock Directus client instance for simulating API calls */
  directus: MockDirectusClient;
  /** Collection name mappings matching the real notification client config shape */
  collections: {
    /** Notification templates collection name (e.g. 'mysite_notification_templates') */
    templates: string;
  };
  /** Multi-tenant site ID */
  siteId?: number;
  /** Default auto-dismiss duration in ms */
  defaultDuration?: number;
}
