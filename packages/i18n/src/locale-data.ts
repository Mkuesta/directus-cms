import type { LocaleInfo } from './types';

const LOCALE_MAP: Record<string, Omit<LocaleInfo, 'code'>> = {
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', direction: 'ltr' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  pl: { name: 'Polish', nativeName: 'Polski', direction: 'ltr' },
  cs: { name: 'Czech', nativeName: 'Čeština', direction: 'ltr' },
  da: { name: 'Danish', nativeName: 'Dansk', direction: 'ltr' },
  sv: { name: 'Swedish', nativeName: 'Svenska', direction: 'ltr' },
  no: { name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr' },
  fi: { name: 'Finnish', nativeName: 'Suomi', direction: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  ko: { name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  zh: { name: 'Chinese', nativeName: '中文', direction: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  he: { name: 'Hebrew', nativeName: 'עברית', direction: 'rtl' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr' },
  ro: { name: 'Romanian', nativeName: 'Română', direction: 'ltr' },
  hu: { name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr' },
  bg: { name: 'Bulgarian', nativeName: 'Български', direction: 'ltr' },
  hr: { name: 'Croatian', nativeName: 'Hrvatski', direction: 'ltr' },
  sk: { name: 'Slovak', nativeName: 'Slovenčina', direction: 'ltr' },
  sl: { name: 'Slovenian', nativeName: 'Slovenščina', direction: 'ltr' },
  th: { name: 'Thai', nativeName: 'ไทย', direction: 'ltr' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr' },
};

export function getLocaleInfo(locale: string): LocaleInfo {
  const base = locale.split('-')[0].split('_')[0].toLowerCase();
  const info = LOCALE_MAP[base];
  if (info) {
    return { code: locale, ...info };
  }
  return { code: locale, name: locale, nativeName: locale, direction: 'ltr' };
}
