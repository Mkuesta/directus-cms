import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createPageClient } from '@mkuesta/pages';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const pages = createPageClient({
  directus,
  collections: {
    pages: COLLECTIONS.pages,
  },
  siteId: CURRENT_SITE_ID,
  siteName: 'MedLead',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io',
  directusUrl: DIRECTUS_URL,
});
