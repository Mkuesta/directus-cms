import type { RestClient } from '@directus/sdk';

export interface I18nCollections {
  /** Directus collection for translations (e.g. "translations") */
  translations: string;
}

export interface I18nConfig {
  directus: RestClient<any>;
  collections: I18nCollections;
  directusUrl: string;
  /** Default locale (e.g. "en", "de") */
  defaultLocale: string;
  /** All supported locales */
  locales: string[];
  /** Fallback locale when translation is missing (defaults to defaultLocale) */
  fallbackLocale?: string;
  /** Multi-tenant site ID */
  siteId?: number;
}

export interface DirectusTranslation {
  id: number;
  key: string;
  locale: string;
  value: string;
  namespace?: string;
  site?: number | null;
}

export interface Translation {
  key: string;
  value: string;
  namespace?: string;
}

export interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export interface AlternateLink {
  locale: string;
  url: string;
}

export interface I18nClient {
  config: I18nConfig;
  /** Get a single translation by key */
  t(key: string, locale?: string, namespace?: string): Promise<string>;
  /** Get all translations for a locale */
  getTranslations(locale: string, namespace?: string): Promise<Record<string, string>>;
  /** Get translations for all locales at once */
  getAllTranslations(namespace?: string): Promise<Record<string, Record<string, string>>>;
  /** Build alternate links for a path across all locales */
  getAlternateLinks(path: string, baseUrl: string): AlternateLink[];
  /** Get locale info (name, direction, etc.) */
  getLocaleInfo(locale: string): LocaleInfo;
  /** Get all supported locales with info */
  getLocales(): LocaleInfo[];
}
