import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createPreviewClient } from '@mkuesta/preview';
import { DIRECTUS_URL, COLLECTIONS } from './directus/config';

// Preview/scheduling requires an admin token with WRITE access
const adminToken = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN || '';

const adminDirectus = adminToken
  ? createDirectus(DIRECTUS_URL).with(staticToken(adminToken)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const preview = createPreviewClient({
  directus: adminDirectus,
  directusUrl: DIRECTUS_URL,
  collections: {
    posts: COLLECTIONS.posts,
    products: COLLECTIONS.products,
    pages: COLLECTIONS.pages,
  },
  previewSecret: process.env.PREVIEW_SECRET || '',
  // Do NOT set siteId if collections don't have a 'site' column
});
