import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createPreviewClient } from '@mkuesta/preview';
import { DIRECTUS_URL, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

// Preview requires an admin token that can read draft (unpublished) content
const adminToken = process.env.DIRECTUS_ADMIN_TOKEN || process.env.DIRECTUS_TOKEN || '';
const previewSecret = process.env.PREVIEW_SECRET || '';

const adminDirectus = adminToken
  ? createDirectus(DIRECTUS_URL).with(staticToken(adminToken)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const preview = createPreviewClient({
  directus: adminDirectus,
  directusUrl: DIRECTUS_URL,
  collections: {
    posts: COLLECTIONS.posts,
    products: COLLECTIONS.products,
  },
  previewSecret,
  siteId: CURRENT_SITE_ID,
  defaultRedirect: '/blog',
});
