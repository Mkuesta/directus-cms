import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createNewsletterClient } from '@mkuesta/newsletter';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';
import { email } from './email';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const newsletter = createNewsletterClient({
  directus,
  collections: {
    subscribers: COLLECTIONS.subscribers,
  },
  siteId: CURRENT_SITE_ID,
  siteName: 'MedLead',
  doubleOptIn: true,
  confirmationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io'}/api/newsletter`,
  emailClient: email,
});
