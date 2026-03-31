import type { PageConfig, PageClient } from './types';
import { getPage, getPages, getPageTree } from './pages';
import { getPageMetadata } from './page-metadata';
import { getPageStaticParams } from './page-static-params';

/**
 * Creates a page client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const pages = createPageClient({ directus, collections: { pages: 'my_pages' }, ... });
 *   const page = await pages.getPage('about');
 */
export function createPageClient(config: PageConfig): PageClient {
  return {
    config,
    getPage: (slug) => getPage(config, slug),
    getPages: () => getPages(config),
    getPageTree: () => getPageTree(config),
    getPageMetadata: (slug) => getPageMetadata(config, slug),
    getPageStaticParams: () => getPageStaticParams(config),
  };
}

// Re-export all types
export type {
  PageConfig,
  PageCollections,
  PageClient,
  DirectusPage,
  Page,
  PageMetadata,
} from './types';

// Re-export standalone functions
export { getPage, getPages, getPageTree } from './pages';
export { getPageMetadata } from './page-metadata';
export { getPageStaticParams } from './page-static-params';
