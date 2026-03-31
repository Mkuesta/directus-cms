export { createPost, createDirectusPost, resetPostCounter } from './posts.js';
export { createProduct, createDirectusProduct, resetProductCounter } from './products.js';
export { createBlogCategory, createDirectusBlogCategory, resetCategoryCounter } from './categories.js';
export { createSiteSettings, createDirectusSiteSettings } from './settings.js';
export { createBanner, createDirectusBanner, resetBannerCounter } from './banners.js';
export { createMenuItem, createDirectusNavigationItem, resetNavigationCounter } from './navigation.js';
export { createRedirect, createDirectusRedirect, resetRedirectCounter } from './redirects.js';
export { createPage, createDirectusPage, resetPageCounter } from './pages.js';
export { createOrder, createDirectusOrder, resetOrderCounter } from './orders.js';
export { createUserProfile, createDirectusUserProfile, resetProfileCounter } from './user-profiles.js';
export { createEmailTemplate, createDirectusEmailTemplate, resetEmailTemplateCounter } from './email-templates.js';
export { createSubscriber, createDirectusSubscriber, resetSubscriberCounter } from './subscribers.js';
export { createNotificationTemplate, createDirectusNotificationTemplate, resetNotificationTemplateCounter } from './notification-templates.js';

import { resetPostCounter } from './posts.js';
import { resetProductCounter } from './products.js';
import { resetCategoryCounter } from './categories.js';
import { resetBannerCounter } from './banners.js';
import { resetNavigationCounter } from './navigation.js';
import { resetRedirectCounter } from './redirects.js';
import { resetPageCounter } from './pages.js';
import { resetOrderCounter } from './orders.js';
import { resetProfileCounter } from './user-profiles.js';
import { resetEmailTemplateCounter } from './email-templates.js';
import { resetSubscriberCounter } from './subscribers.js';
import { resetNotificationTemplateCounter } from './notification-templates.js';

/**
 * Reset all fixture ID counters back to 1.
 * Call this in beforeEach() to prevent cross-test ID pollution.
 */
export function resetFixtureCounters(): void {
  resetPostCounter();
  resetProductCounter();
  resetCategoryCounter();
  resetBannerCounter();
  resetNavigationCounter();
  resetRedirectCounter();
  resetPageCounter();
  resetOrderCounter();
  resetProfileCounter();
  resetEmailTemplateCounter();
  resetSubscriberCounter();
  resetNotificationTemplateCounter();
}
