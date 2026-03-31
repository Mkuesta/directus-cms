import { readItems } from '@directus/sdk';
import type { I18nConfig, DirectusTranslation, AlternateLink } from './types';
import { getLocaleInfo as getLocaleInfoFromData } from './locale-data';

const _cache = new WeakMap<object, { data: DirectusTranslation[]; expires: number }>();
const CACHE_TTL = 60_000;

async function fetchAll(config: I18nConfig): Promise<DirectusTranslation[]> {
  const cached = _cache.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;

  const filter: Record<string, any> = {};
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.translations as any, {
      fields: ['id', 'key', 'locale', 'value', 'namespace', 'site'],
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: -1,
    } as any)
  ) as unknown as DirectusTranslation[];

  _cache.set(config.directus, { data: items, expires: Date.now() + CACHE_TTL });
  return items;
}

export async function t(
  config: I18nConfig,
  key: string,
  locale?: string,
  namespace?: string,
): Promise<string> {
  const targetLocale = locale ?? config.defaultLocale;
  const fallback = config.fallbackLocale ?? config.defaultLocale;
  const all = await fetchAll(config);

  // Try exact locale match
  const match = all.find(
    (item) =>
      item.key === key &&
      item.locale === targetLocale &&
      (!namespace || item.namespace === namespace),
  );
  if (match) return match.value;

  // Try fallback locale
  if (targetLocale !== fallback) {
    const fallbackMatch = all.find(
      (item) =>
        item.key === key &&
        item.locale === fallback &&
        (!namespace || item.namespace === namespace),
    );
    if (fallbackMatch) return fallbackMatch.value;
  }

  // Return key as-is
  return key;
}

export async function getTranslations(
  config: I18nConfig,
  locale: string,
  namespace?: string,
): Promise<Record<string, string>> {
  const all = await fetchAll(config);
  const result: Record<string, string> = {};

  for (const item of all) {
    if (item.locale === locale && (!namespace || item.namespace === namespace)) {
      result[item.key] = item.value;
    }
  }

  return result;
}

export async function getAllTranslations(
  config: I18nConfig,
  namespace?: string,
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};

  for (const locale of config.locales) {
    result[locale] = await getTranslations(config, locale, namespace);
  }

  return result;
}

export function getAlternateLinks(
  config: I18nConfig,
  path: string,
  baseUrl: string,
): AlternateLink[] {
  return config.locales.map((locale) => {
    const url =
      locale === config.defaultLocale
        ? `${baseUrl}${path}`
        : `${baseUrl}/${locale}${path}`;
    return { locale, url };
  });
}

export { getLocaleInfoFromData as getLocaleInfo };
