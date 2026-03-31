import type { I18nConfig, I18nClient } from './types';
import { t, getTranslations, getAllTranslations, getAlternateLinks, getLocaleInfo } from './translations';
import { getLocaleInfo as getLocaleInfoFromData } from './locale-data';

export function createI18nClient(config: I18nConfig): I18nClient {
  return {
    config,
    t: (key, locale, namespace) => t(config, key, locale, namespace),
    getTranslations: (locale, namespace) => getTranslations(config, locale, namespace),
    getAllTranslations: (namespace) => getAllTranslations(config, namespace),
    getAlternateLinks: (path, baseUrl) => getAlternateLinks(config, path, baseUrl),
    getLocaleInfo: (locale) => getLocaleInfoFromData(locale),
    getLocales: () => config.locales.map((locale) => getLocaleInfoFromData(locale)),
  };
}

export type {
  I18nConfig,
  I18nCollections,
  I18nClient,
  DirectusTranslation,
  Translation,
  LocaleInfo,
  AlternateLink,
} from './types';

export { t, getTranslations, getAllTranslations, getAlternateLinks } from './translations';
export { getLocaleInfo } from './locale-data';
