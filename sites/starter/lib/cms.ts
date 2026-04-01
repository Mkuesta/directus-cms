import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createCmsClient } from '@mkuesta/core';
import { createProductClient } from '@mkuesta/products';
import {
  DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, SITE_NAME, BASE_URL,
  SITE_ID, BLOG_ROUTE, PRODUCT_ROUTE,
} from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const cms = createCmsClient({
  directus,
  collections: {
    posts: COLLECTIONS.posts,
    settings: COLLECTIONS.settings,
    blogCategories: COLLECTIONS.blogCategories,
    categories: COLLECTIONS.categories,
    products: COLLECTIONS.products,
  },
  siteName: SITE_NAME,
  baseUrl: BASE_URL,
  directusUrl: DIRECTUS_URL,
  route: BLOG_ROUTE,
  ...(SITE_ID != null ? { siteId: SITE_ID } : {}),
  urls: {
    post: (slug) => `/${BLOG_ROUTE}/${slug}`,
    category: () => null,
    index: () => `/${BLOG_ROUTE}`,
  },
});

export const productCms = createProductClient({
  directus,
  collections: {
    products: COLLECTIONS.products,
    categories: COLLECTIONS.categories,
    settings: COLLECTIONS.settings,
  },
  siteName: SITE_NAME,
  baseUrl: BASE_URL,
  directusUrl: DIRECTUS_URL,
  ...(SITE_ID != null ? { siteId: SITE_ID } : {}),
  currency: 'USD',
  productRoute: PRODUCT_ROUTE,
  categoryRoute: 'category',
  listingRoute: PRODUCT_ROUTE,
});
