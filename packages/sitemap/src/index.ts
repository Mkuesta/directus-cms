import type { SitemapConfig, SitemapClient } from './types';
import { getBlogEntries } from './blog-entries';
import { getProductEntries } from './product-entries';
import { getStaticEntries } from './static-entries';
import { generateSitemap, generateSitemapSegment, generateSitemapIndex } from './sitemap';
import { generateRobots } from './robots';
import { generateNextSitemap } from './nextjs';
import { generateSitemapXml } from './xml';

/**
 * Creates a sitemap client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const sitemapClient = createSitemapClient({ baseUrl, cms, products, ... });
 *   const entries = await sitemapClient.generateSitemap();
 */
export function createSitemapClient(config: SitemapConfig): SitemapClient {
  return {
    generateSitemap: () => generateSitemap(config),
    generateNextSitemap: () => generateNextSitemap(config),
    generateSitemapSegment: (id) => generateSitemapSegment(config, id),
    generateSitemapIndex: () => generateSitemapIndex(config),
    generateSitemapXml: () => generateSitemapXml(config),
    generateRobots: () => generateRobots(config),
    getBlogEntries: () => getBlogEntries(config),
    getProductEntries: () => getProductEntries(config),
    getStaticEntries: () => getStaticEntries(config),
  };
}

// Re-export all types
export type {
  SitemapConfig,
  SitemapClient,
  SitemapEntry,
  NextSitemapEntry,
  ContentTypeDefaults,
  StaticPageEntry,
  ChangeFrequency,
  I18nConfig,
  RobotsConfig,
} from './types';

// Re-export standalone functions
export { getBlogEntries } from './blog-entries';
export { getProductEntries } from './product-entries';
export { getStaticEntries } from './static-entries';
export { generateSitemap, generateSitemapSegment, generateSitemapIndex } from './sitemap';
export { generateRobots } from './robots';
export { applyI18nAlternates, applyI18nToEntries } from './i18n';
export { generateNextSitemap } from './nextjs';
export { generateSitemapXml, entriesToXml } from './xml';
