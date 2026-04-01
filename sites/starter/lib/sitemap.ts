import { createSitemapClient } from '@mkuesta/sitemap';
import { cms, productCms } from './cms';
import { BASE_URL, BLOG_ROUTE, PRODUCT_ROUTE } from './directus/config';

export const sitemapClient = createSitemapClient({
  baseUrl: BASE_URL,
  cms,
  products: productCms,
  staticPages: [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: `/${BLOG_ROUTE}`, changeFrequency: 'weekly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
    // TODO: add your static pages
  ],
  hideSitemap: true, // Don't expose sitemap URL in robots.txt
  defaultChangeFrequency: 'weekly',
  defaultPriority: 0.6,
});
