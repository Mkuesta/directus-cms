import type { CollectionSchema, FeatureFlags } from '../types.js';
import { coreSettingsSchema } from './core-settings.js';
import { corePostsSchema } from './core-posts.js';
import { coreBlogCategoriesSchema } from './core-blog-categories.js';
import { productCategoriesSchema } from './product-categories.js';
import { productsSchema } from './products.js';
import { navigationSchema } from './navigation.js';
import { pagesSchema } from './pages.js';
import { formsSchema } from './forms.js';
import { analyticsSchema } from './analytics.js';
import { redirectsSchema } from './redirects.js';
import { galleriesSchema } from './galleries.js';
import { galleryItemsSchema } from './gallery-items.js';
import { bannersSchema } from './banners.js';
import { i18nSchema } from './i18n.js';
import { ordersSchema } from './orders.js';
import { userProfilesSchema } from './user-profiles.js';
import { emailTemplatesSchema } from './email-templates.js';
import { emailLogSchema } from './email-log.js';
import { newsletterSchema } from './newsletter.js';
import { notificationTemplatesSchema } from './notification-templates.js';

export function getSchemas(prefix: string, features: FeatureFlags): CollectionSchema[] {
  // Core schemas are always included
  // Order matters: categories before posts (posts has FK to categories)
  const schemas: CollectionSchema[] = [
    coreSettingsSchema(prefix),
    coreBlogCategoriesSchema(prefix),
    corePostsSchema(prefix),
  ];

  if (features.includeProducts) {
    schemas.push(productCategoriesSchema(prefix));
    schemas.push(productsSchema(prefix));
  }

  if (features.includeNavigation) {
    schemas.push(navigationSchema(prefix));
  }

  if (features.includePages) {
    schemas.push(pagesSchema(prefix));
  }

  if (features.includeForms) {
    schemas.push(formsSchema(prefix));
  }

  if (features.includeAnalytics) {
    schemas.push(analyticsSchema(prefix));
  }

  if (features.includeRedirects) {
    schemas.push(redirectsSchema(prefix));
  }

  if (features.includeMedia) {
    schemas.push(galleriesSchema(prefix));
    schemas.push(galleryItemsSchema(prefix));
  }

  if (features.includeBanners) {
    schemas.push(bannersSchema(prefix));
  }

  if (features.includeI18n) {
    schemas.push(i18nSchema(prefix));
  }

  if (features.includeStripe) {
    schemas.push(ordersSchema(prefix));
  }

  if (features.includeAuth) {
    schemas.push(userProfilesSchema(prefix));
  }

  if (features.includeEmail) {
    schemas.push(emailTemplatesSchema(prefix));
    schemas.push(emailLogSchema(prefix));
  }

  if (features.includeNewsletter) {
    schemas.push(newsletterSchema(prefix));
  }

  if (features.includeNotifications) {
    schemas.push(notificationTemplatesSchema(prefix));
  }

  return schemas;
}
