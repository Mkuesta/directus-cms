import { createSitemapClient } from '@mkuesta/sitemap';
import { cms, productCms } from './cms';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io').trim();

export const sitemapClient = createSitemapClient({
  baseUrl,
  cms,
  products: productCms,
  staticPages: [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/a-propos', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/data', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/resources', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/email-lists', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/list-builder', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/solutions', changeFrequency: 'monthly', priority: 0.6 },
  ],
  defaultChangeFrequency: 'weekly',
  defaultPriority: 0.6,
});
