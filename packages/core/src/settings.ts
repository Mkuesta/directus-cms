import { readSingleton } from '@directus/sdk';
import { getDirectusAssetUrl } from './images';
import type { CmsConfig, DirectusSettings, SiteSettings } from './types';

// Settings cache keyed by directus client identity
const _settingsCaches = new WeakMap<object, SiteSettings>();

export async function getSettings(config: CmsConfig): Promise<SiteSettings> {
  const cached = _settingsCaches.get(config.directus);
  if (cached) return cached;

  try {
    const raw = await config.directus.request(
      readSingleton(config.collections.settings as any, {
        fields: [
          '*',
          { default_author_image: ['id'] },
          { default_logo: ['id'] },
          { default_og_image: ['id'] },
          { default_article_image: ['id'] },
          { favicon: ['id'] },
          { apple_touch_icon: ['id'] },
        ],
      })
    );
    const item = raw as unknown as DirectusSettings;
    const settings: SiteSettings = {
      siteName: (item.site_name || config.siteName).trim(),
      siteTitle: item.site_title?.trim(),
      siteDescription: item.site_description?.trim(),
      defaultAuthorName: item.default_author_name,
      defaultAuthorTitle: item.default_author_title,
      defaultAuthorUrl: item.default_author_url,
      defaultAuthorImageUrl: item.default_author_image
        ? getDirectusAssetUrl(config, item.default_author_image.id)
        : undefined,
      logoUrl: item.default_logo
        ? getDirectusAssetUrl(config, item.default_logo.id)
        : undefined,
      ogImageUrl: item.default_og_image
        ? getDirectusAssetUrl(config, item.default_og_image.id)
        : undefined,
      defaultArticleImageUrl: item.default_article_image
        ? getDirectusAssetUrl(config, item.default_article_image.id)
        : undefined,
      faviconUrl: item.favicon
        ? getDirectusAssetUrl(config, item.favicon.id)
        : undefined,
      appleTouchIconUrl: item.apple_touch_icon
        ? getDirectusAssetUrl(config, item.apple_touch_icon.id)
        : undefined,
      twitterHandle: item.twitter_handle,
      linkedinUrl: item.linkedin_url,
      organizationDescription: item.organization_description,
      themeColor: item.theme_color,
      siteTagline: item.site_tagline,
      defaultLanguage: item.default_language || 'en',
      primaryColor: item.primary_color,
      secondaryColor: item.secondary_color,
      homepageKeywords: item.homepage_keywords
        ? item.homepage_keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : undefined,
      defaultMetaRobots: item.default_meta_robots,
      logoInitials: item.logo_initials,
      contactPagePath: item.contact_page_path || '/contact',
      defaultAuthorTwitter: item.default_author_twitter,
      sitemapPath: item.sitemap_path,
    };
    _settingsCaches.set(config.directus, settings);
    setTimeout(() => {
      _settingsCaches.delete(config.directus);
    }, 60_000);
    return settings;
  } catch {
    return { siteName: config.siteName };
  }
}
