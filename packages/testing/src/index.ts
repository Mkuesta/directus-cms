// Mock client
export { createMockDirectus } from './mock-directus.js';

// Config factories
export {
  createMockCmsConfig,
  createMockProductConfig,
  createMockAnalyticsConfig,
  createMockNavigationConfig,
  createMockBannerConfig,
  createMockRedirectConfig,
  createMockI18nConfig,
  createMockFormConfig,
  createMockStripeConfig,
  createMockAuthConfig,
  createMockEmailConfig,
  createMockNewsletterConfig,
  createMockNotificationConfig,
} from './mock-configs.js';

// Fixtures
export {
  createPost,
  createDirectusPost,
  createProduct,
  createDirectusProduct,
  createBlogCategory,
  createDirectusBlogCategory,
  createSiteSettings,
  createDirectusSiteSettings,
  createBanner,
  createDirectusBanner,
  createMenuItem,
  createDirectusNavigationItem,
  createRedirect,
  createDirectusRedirect,
  createPage,
  createDirectusPage,
  createOrder,
  createDirectusOrder,
  createUserProfile,
  createDirectusUserProfile,
  createEmailTemplate,
  createDirectusEmailTemplate,
  createSubscriber,
  createDirectusSubscriber,
  createNotificationTemplate,
  createDirectusNotificationTemplate,
  resetFixtureCounters,
} from './fixtures/index.js';

// Assertions
export { expectJsonLd, expectJsonLdFromElement } from './assertions.js';

// Cleanup
export { createTmpDir, removeTmpDir } from './cleanup.js';

// Types
export type {
  MockDirectusConfig,
  MockDirectusClient,
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
