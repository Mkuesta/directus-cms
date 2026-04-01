import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createBannerClient } from '@mkuesta/banners';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const banners = createBannerClient({
  directus,
  collections: {
    banners: COLLECTIONS.banners,
  },
  directusUrl: DIRECTUS_URL,
  siteId: CURRENT_SITE_ID,
});
