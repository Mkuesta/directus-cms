import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createAnalyticsClient } from '@mkuesta/analytics';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const analytics = createAnalyticsClient({
  directus,
  collections: {
    settings: COLLECTIONS.analyticsSettings,
  },
  directusUrl: DIRECTUS_URL,
  siteId: CURRENT_SITE_ID,
});
