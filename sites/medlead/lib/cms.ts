import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createCmsClient } from '@mkuesta/core';
import { createProductClient } from '@mkuesta/products';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

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
  siteName: 'MedLead',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io',
  directusUrl: DIRECTUS_URL,
  route: 'resources',
  // No siteId — medlead_posts doesn't have a site column
  urls: {
    post: (slug) => `/resources/${slug}`,
    category: () => null,
    index: () => '/resources',
  },
});

export const productCms = createProductClient({
  directus,
  collections: {
    products: COLLECTIONS.products,
    categories: COLLECTIONS.categories,
    settings: COLLECTIONS.settings,
  },
  siteName: 'MedLead',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io',
  directusUrl: DIRECTUS_URL,
  // No siteId — medlead_products.site is a plain integer, not a relation
  currency: 'USD',
  productRoute: 'data/products',
  categoryRoute: 'category',
  listingRoute: 'products',
  fieldMapping: {
    products: {
      title: 'name',           // medlead uses 'name', package expects 'title'
      featured: 'is_featured', // medlead uses 'is_featured', package expects 'featured'
    },
  },
});
