import type { SitemapConfig, SitemapEntry } from './types';
import { getBlogEntries } from './blog-entries';
import { getProductEntries } from './product-entries';
import { getStaticEntries } from './static-entries';
import { applyI18nToEntries } from './i18n';

async function getAllEntries(config: SitemapConfig): Promise<SitemapEntry[]> {
  const [staticEntries, blogEntries, productEntries] = await Promise.all([
    Promise.resolve(getStaticEntries(config)),
    getBlogEntries(config),
    getProductEntries(config),
  ]);

  const merged = [...staticEntries, ...blogEntries, ...productEntries];

  // Dedupe by URL (first occurrence wins)
  const seen = new Set<string>();
  const deduped: SitemapEntry[] = [];
  for (const entry of merged) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      deduped.push(entry);
    }
  }

  return applyI18nToEntries(deduped, config.i18n, config.baseUrl.trim());
}

export async function generateSitemap(config: SitemapConfig): Promise<SitemapEntry[]> {
  return getAllEntries(config);
}

export async function generateSitemapSegment(
  config: SitemapConfig,
  id: number,
): Promise<SitemapEntry[]> {
  const maxUrls = config.maxUrlsPerSitemap ?? 50000;
  const all = await getAllEntries(config);
  const start = id * maxUrls;
  return all.slice(start, start + maxUrls);
}

export async function generateSitemapIndex(
  config: SitemapConfig,
): Promise<{ id: number }[]> {
  const maxUrls = config.maxUrlsPerSitemap ?? 50000;
  const all = await getAllEntries(config);
  const segments = Math.ceil(all.length / maxUrls);
  return Array.from({ length: segments }, (_, i) => ({ id: i }));
}
