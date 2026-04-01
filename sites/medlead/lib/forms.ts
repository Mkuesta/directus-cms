import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createFormClient } from '@mkuesta/forms';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const forms = createFormClient({
  directus,
  collections: {
    submissions: COLLECTIONS.formSubmissions,
  },
  siteId: CURRENT_SITE_ID,
  siteName: 'MedLead',
  honeypotField: '_hp_field',
  rateLimit: 5,
  rateLimitWindow: 60_000,
});
