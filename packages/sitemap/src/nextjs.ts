import type { SitemapConfig, SitemapEntry, NextSitemapEntry } from './types';
import { generateSitemap } from './sitemap';

function toNextEntry(entry: SitemapEntry): NextSitemapEntry {
  const result: NextSitemapEntry = { url: entry.url };

  if (entry.lastModified) {
    result.lastModified =
      entry.lastModified instanceof Date
        ? entry.lastModified
        : new Date(entry.lastModified);
  }

  if (entry.changeFrequency) result.changeFrequency = entry.changeFrequency;
  if (entry.priority != null) result.priority = entry.priority;
  if (entry.alternates) result.alternates = entry.alternates;

  return result;
}

/**
 * Generates sitemap entries in Next.js MetadataRoute.Sitemap format.
 *
 * Usage in app/sitemap.ts:
 *   export default async function sitemap() {
 *     return generateNextSitemap(config);
 *   }
 */
export async function generateNextSitemap(
  config: SitemapConfig,
): Promise<NextSitemapEntry[]> {
  const entries = await generateSitemap(config);
  return entries.map(toNextEntry);
}
