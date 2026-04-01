import type { SitemapConfig, SitemapEntry } from './types';
import { generateSitemap } from './sitemap';

/**
 * Generates a complete sitemap XML string.
 * Use this when serving the sitemap from an API route (e.g. obfuscated URL)
 * instead of the default Next.js app/sitemap.ts convention.
 *
 * Usage in app/api/sitemap/route.ts:
 *   export async function GET() {
 *     const xml = await sitemapClient.generateSitemapXml();
 *     return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
 *   }
 */
export async function generateSitemapXml(config: SitemapConfig): Promise<string> {
  const entries = await generateSitemap(config);
  return entriesToXml(entries);
}

/**
 * Convert sitemap entries to XML string.
 */
export function entriesToXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const parts = [`  <loc>${escapeXml(entry.url)}</loc>`];
    if (entry.lastModified) {
      const date = entry.lastModified instanceof Date
        ? entry.lastModified.toISOString()
        : new Date(entry.lastModified).toISOString();
      parts.push(`  <lastmod>${date}</lastmod>`);
    }
    if (entry.changeFrequency) {
      parts.push(`  <changefreq>${entry.changeFrequency}</changefreq>`);
    }
    if (entry.priority != null) {
      parts.push(`  <priority>${entry.priority}</priority>`);
    }
    // Hreflang alternates
    if (entry.alternates?.languages) {
      for (const [locale, url] of Object.entries(entry.alternates.languages)) {
        parts.push(`  <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(url)}" />`);
      }
    }
    return `<url>\n${parts.join('\n')}\n</url>`;
  });

  const hasAlternates = entries.some((e) => e.alternates?.languages);
  const xmlns = hasAlternates
    ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${xmlns}>\n${urls.join('\n')}\n</urlset>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
