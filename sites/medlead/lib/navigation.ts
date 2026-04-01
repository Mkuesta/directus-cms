import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createNavigationClient } from '@mkuesta/navigation';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const navigation = createNavigationClient({
  directus,
  collections: {
    items: COLLECTIONS.navigationItems,
  },
  directusUrl: DIRECTUS_URL,
  siteId: CURRENT_SITE_ID,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io',
});
