import type {
  MockCmsConfig,
  MockProductConfig,
  MockAnalyticsConfig,
  MockNavigationConfig,
  MockBannerConfig,
  MockRedirectConfig,
  MockI18nConfig,
  MockFormConfig,
  MockStripeConfig,
  MockAuthConfig,
  MockEmailConfig,
  MockNewsletterConfig,
  MockNotificationConfig,
} from './types.js';
import { createMockDirectus } from './mock-directus.js';

const PREFIX = 'test';

export function createMockCmsConfig(overrides?: Partial<MockCmsConfig>): MockCmsConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      posts: `${PREFIX}_posts`,
      settings: `${PREFIX}_settings`,
      blogCategories: `${PREFIX}_blog_categories`,
      categories: `${PREFIX}_categories`,
      products: `${PREFIX}_products`,
    },
    siteName: 'Test Site',
    baseUrl: 'https://test.example.com',
    directusUrl: 'https://cms.test.example.com',
    route: 'blog',
    ...overrides,
  };
}

export function createMockProductConfig(overrides?: Partial<MockProductConfig>): MockProductConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      products: `${PREFIX}_products`,
      categories: `${PREFIX}_categories`,
      settings: `${PREFIX}_settings`,
    },
    siteName: 'Test Site',
    baseUrl: 'https://test.example.com',
    directusUrl: 'https://cms.test.example.com',
    siteId: 1,
    currency: 'EUR',
    productRoute: 'product',
    categoryRoute: 'category',
    listingRoute: 'products',
    ...overrides,
  };
}

export function createMockAnalyticsConfig(overrides?: Partial<MockAnalyticsConfig>): MockAnalyticsConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      settings: `${PREFIX}_analytics_settings`,
    },
    directusUrl: 'https://cms.test.example.com',
    ...overrides,
  };
}

export function createMockNavigationConfig(overrides?: Partial<MockNavigationConfig>): MockNavigationConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      items: `${PREFIX}_navigation_items`,
    },
    directusUrl: 'https://cms.test.example.com',
    ...overrides,
  };
}

export function createMockBannerConfig(overrides?: Partial<MockBannerConfig>): MockBannerConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      banners: `${PREFIX}_banners`,
    },
    directusUrl: 'https://cms.test.example.com',
    ...overrides,
  };
}

export function createMockRedirectConfig(overrides?: Partial<MockRedirectConfig>): MockRedirectConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      redirects: `${PREFIX}_redirects`,
    },
    directusUrl: 'https://cms.test.example.com',
    ...overrides,
  };
}

export function createMockI18nConfig(overrides?: Partial<MockI18nConfig>): MockI18nConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      translations: `${PREFIX}_translations`,
    },
    directusUrl: 'https://cms.test.example.com',
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr'],
    ...overrides,
  };
}

export function createMockFormConfig(overrides?: Partial<MockFormConfig>): MockFormConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      submissions: `${PREFIX}_form_submissions`,
    },
    siteName: 'Test Site',
    ...overrides,
  };
}

export function createMockStripeConfig(overrides?: Partial<MockStripeConfig>): MockStripeConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      orders: `${PREFIX}_orders`,
      products: `${PREFIX}_products`,
    },
    stripeSecretKey: 'sk_test_mock',
    stripeWebhookSecret: 'whsec_mock',
    publishableKey: 'pk_test_mock',
    successUrl: 'https://test.example.com/checkout/success',
    cancelUrl: 'https://test.example.com/checkout/cancel',
    currency: 'eur',
    siteId: 1,
    ...overrides,
  };
}

export function createMockAuthConfig(overrides?: Partial<MockAuthConfig>): MockAuthConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      userProfiles: `${PREFIX}_user_profiles`,
    },
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'mock-anon-key',
    supabaseServiceRoleKey: 'mock-service-role-key',
    siteId: 1,
    ...overrides,
  };
}

export function createMockEmailConfig(overrides?: Partial<MockEmailConfig>): MockEmailConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      templates: `${PREFIX}_email_templates`,
      log: `${PREFIX}_email_log`,
    },
    resendApiKey: 're_mock_key',
    fromEmail: 'test@example.com',
    siteName: 'Test Site',
    ...overrides,
  };
}

export function createMockNewsletterConfig(overrides?: Partial<MockNewsletterConfig>): MockNewsletterConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      subscribers: `${PREFIX}_subscribers`,
    },
    siteName: 'Test Site',
    doubleOptIn: true,
    confirmationUrl: 'https://test.example.com/api/newsletter',
    ...overrides,
  };
}

export function createMockNotificationConfig(overrides?: Partial<MockNotificationConfig>): MockNotificationConfig {
  return {
    directus: createMockDirectus(),
    collections: {
      templates: `${PREFIX}_notification_templates`,
    },
    siteId: 1,
    defaultDuration: 5000,
    ...overrides,
  };
}
