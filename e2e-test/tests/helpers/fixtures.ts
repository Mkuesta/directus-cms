import type { SiteOptions } from '../../../create-directus-site/src/prompts.js';
import type { ProvisionConfig, FeatureFlags } from '../../../provision-directus-site/src/types.js';

export function createCoreOnlySiteOptions(overrides?: Partial<SiteOptions>): SiteOptions {
  return {
    siteName: 'Test Site',
    siteSlug: 'test-site',
    collectionPrefix: 'test_site',
    baseUrl: 'https://test-site.com',
    directusUrl: 'https://cms.example.com',
    blogRoute: 'blog',
    includeProducts: false,
    productRoute: 'product',
    categoryRoute: 'category',
    listingRoute: 'products',
    currency: 'EUR',
    siteId: 1,
    includeAdmin: false,
    includeSitemap: false,
    includeNavigation: false,
    includePages: false,
    includeForms: false,
    includeAnalytics: false,
    includeRedirects: false,
    includeMedia: false,
    includeBanners: false,
    includeSeo: false,
    includeSearch: false,
    includeTags: false,
    includePreview: false,
    includeWebhooks: false,
    includeStripe: false,
    includeAuth: false,
    includeEmail: false,
    includeI18n: false,
    locales: ['en'],
    defaultLocale: 'en',
    ...overrides,
  };
}

export function createFullSiteOptions(overrides?: Partial<SiteOptions>): SiteOptions {
  return {
    siteName: 'Full Site',
    siteSlug: 'full-site',
    collectionPrefix: 'full_site',
    baseUrl: 'https://full-site.com',
    directusUrl: 'https://cms.example.com',
    blogRoute: 'blog',
    includeProducts: true,
    productRoute: 'product',
    categoryRoute: 'category',
    listingRoute: 'products',
    currency: 'EUR',
    siteId: 1,
    includeAdmin: true,
    includeSitemap: true,
    includeNavigation: true,
    includePages: true,
    includeForms: true,
    includeAnalytics: true,
    includeRedirects: true,
    includeMedia: true,
    includeBanners: true,
    includeSeo: true,
    includeSearch: true,
    includeTags: true,
    includePreview: true,
    includeWebhooks: true,
    includeStripe: true,
    includeAuth: true,
    includeEmail: true,
    includeI18n: true,
    locales: ['en', 'de', 'fr'],
    defaultLocale: 'en',
    ...overrides,
  };
}

export function createCoreOnlyFeatures(): FeatureFlags {
  return {
    includeProducts: false,
    includeNavigation: false,
    includePages: false,
    includeForms: false,
    includeAnalytics: false,
    includeRedirects: false,
    includeMedia: false,
    includeBanners: false,
    includeI18n: false,
  };
}

export function createAllFeatures(): FeatureFlags {
  return {
    includeProducts: true,
    includeNavigation: true,
    includePages: true,
    includeForms: true,
    includeAnalytics: true,
    includeRedirects: true,
    includeMedia: true,
    includeBanners: true,
    includeI18n: true,
    includeStripe: true,
    includeAuth: true,
    includeEmail: true,
  };
}

export function createDryRunProvisionConfig(prefix: string, features: FeatureFlags): ProvisionConfig {
  return {
    url: 'https://cms.example.com',
    token: 'test-token',
    prefix,
    seed: false,
    dryRun: true,
    features,
  };
}
