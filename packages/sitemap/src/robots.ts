import type { SitemapConfig, RobotsConfig } from './types';

async function resolveSitemapPath(config: SitemapConfig): Promise<string> {
  // Explicit config takes priority
  if (config.sitemapPath) return config.sitemapPath;

  // Try to read from Directus settings
  if (config.cms) {
    try {
      const settings = await config.cms.getSettings();
      if (settings.sitemapPath) return settings.sitemapPath;
    } catch {
      // Fall through to default
    }
  }

  return 'sitemap.xml';
}

export async function generateRobots(config: SitemapConfig): Promise<RobotsConfig> {
  const disallow = ['/admin/', '/api/', ...(config.robotsDisallow ?? [])];

  const sitemaps: string[] = [];
  if (!config.hideSitemap) {
    const path = await resolveSitemapPath(config);
    sitemaps.push(`${config.baseUrl.trim()}/${path}`);
  }
  if (config.additionalSitemaps) {
    sitemaps.push(...config.additionalSitemaps);
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow,
      },
    ],
    sitemap: sitemaps,
  };
}
