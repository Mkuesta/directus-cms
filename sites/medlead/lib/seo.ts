import { createSeoClient } from '@mkuesta/seo';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io';

export const seo = createSeoClient({
  baseUrl,
  siteName: 'MedLead',
  organization: {
    name: 'MedLead',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Fuel Your Growth with High-Precision Medical Leads. Verified healthcare professional databases for targeted marketing campaigns.',
    telephone: '1-888-664-9690',
  },
});
