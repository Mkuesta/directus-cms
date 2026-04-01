import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createEmailClient } from '@mkuesta/email';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from './directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

export const email = createEmailClient({
  directus,
  collections: {
    templates: COLLECTIONS.emailTemplates,
    log: COLLECTIONS.emailLog,
  },
  resendApiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.EMAIL_FROM || 'noreply@medlead.io',
  fromName: 'MedLead',
  siteId: CURRENT_SITE_ID,
  siteName: 'MedLead',
  enableLogging: true,
});
