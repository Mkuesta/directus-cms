import type { SitemapConfig, SitemapEntry } from './types';

export function getStaticEntries(config: SitemapConfig): SitemapEntry[] {
  const pages = config.staticPages ?? [{ path: '/' }];

  const baseUrl = config.baseUrl.trim();
  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency ?? config.defaultChangeFrequency ?? 'monthly',
    priority: page.priority ?? 1.0,
  }));
}
