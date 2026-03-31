import type { I18nConfig, SitemapEntry } from './types';

export function applyI18nAlternates(
  entry: SitemapEntry,
  i18n: I18nConfig,
  baseUrl: string,
): SitemapEntry {
  const strategy = i18n.strategy ?? 'prefix';
  const path = entry.url.startsWith(baseUrl)
    ? entry.url.slice(baseUrl.length)
    : entry.url;

  const languages: Record<string, string> = {};

  for (const locale of i18n.locales) {
    if (strategy === 'subdomain') {
      const url = new URL(baseUrl);
      languages[locale] = `${url.protocol}//${locale}.${url.host}${path}`;
    } else {
      // prefix strategy
      if (locale === i18n.defaultLocale) {
        languages[locale] = `${baseUrl}${path}`;
      } else {
        languages[locale] = `${baseUrl}/${locale}${path}`;
      }
    }
  }

  // x-default points to the default locale version
  if (strategy === 'subdomain') {
    const url = new URL(baseUrl);
    languages['x-default'] = `${url.protocol}//${i18n.defaultLocale}.${url.host}${path}`;
  } else {
    languages['x-default'] = `${baseUrl}${path}`;
  }

  return {
    ...entry,
    alternates: { languages },
  };
}

export function applyI18nToEntries(
  entries: SitemapEntry[],
  i18n: I18nConfig | undefined,
  baseUrl: string,
): SitemapEntry[] {
  if (!i18n) return entries;
  return entries.map((entry) => applyI18nAlternates(entry, i18n, baseUrl));
}
