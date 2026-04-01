import { createSeoClient } from '@mkuesta/seo';
import { SITE_NAME, BASE_URL } from './directus/config';

export const seo = createSeoClient({
  baseUrl: BASE_URL,
  siteName: SITE_NAME,
  organization: {
    name: SITE_NAME,
    url: BASE_URL,
    // logo: `${BASE_URL}/logo.png`,  // TODO: add your logo
    // email: 'contact@example.com',
    // telephone: '+1-800-000-0000',
  },
});
