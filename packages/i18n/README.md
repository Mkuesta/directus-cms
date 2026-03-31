# @directus-cms/i18n

Multi-language content fetching and locale management from Directus for Next.js sites. Key-value translations with namespace support, locale fallbacks, alternate link generation, and built-in locale metadata for 30+ languages.

## Setup

### 1. Directus Collection (`{prefix}_translations`)

| Field | Type | Description |
|-------|------|-------------|
| `key` | String | Translation key (e.g. `"nav.home"`, `"cta.buy_now"`) |
| `locale` | String | Locale code (e.g. `"en"`, `"de"`, `"fr"`) |
| `value` | Text | Translated string |
| `namespace` | String | Optional grouping (e.g. `"common"`, `"products"`) |
| `site` | Integer | Optional multi-tenant site ID |

### 2. Config

```ts
// lib/i18n.ts
import { createI18nClient } from '@directus-cms/i18n';
import { directus, COLLECTION_PREFIX } from './cms';

export const i18n = createI18nClient({
  directus,
  collections: { translations: `${COLLECTION_PREFIX}_translations` },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  defaultLocale: 'de',
  locales: ['de', 'en', 'fr'],
  fallbackLocale: 'de', // optional, defaults to defaultLocale
});
```

## Usage

### Single Translation

```ts
const label = await i18n.t('nav.home');           // uses default locale
const labelEn = await i18n.t('nav.home', 'en');   // specific locale
const cta = await i18n.t('cta.buy', 'en', 'products'); // with namespace
```

Falls back to `fallbackLocale` if key not found, then returns the key itself.

### All Translations for a Locale

```ts
const de = await i18n.getTranslations('de');
// → { "nav.home": "Startseite", "nav.about": "Über uns", ... }

const productsDe = await i18n.getTranslations('de', 'products');
// → only keys in "products" namespace
```

### All Locales at Once

```ts
const all = await i18n.getAllTranslations();
// → { de: { "nav.home": "Startseite", ... }, en: { "nav.home": "Home", ... } }
```

### Alternate Links (hreflang)

```ts
const links = i18n.getAlternateLinks('/about', 'https://example.com');
// → [
//   { locale: 'de', url: 'https://example.com/about' },
//   { locale: 'en', url: 'https://example.com/en/about' },
//   { locale: 'fr', url: 'https://example.com/fr/about' },
// ]
```

### Locale Info

```ts
const info = i18n.getLocaleInfo('de');
// → { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' }

const all = i18n.getLocales();
// → [{ code: 'de', ... }, { code: 'en', ... }, { code: 'fr', ... }]
```

Built-in metadata for 30+ languages including RTL support (Arabic, Hebrew).

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `t(key, locale?, namespace?)` | `Promise<string>` | Single translation with fallback |
| `getTranslations(locale, namespace?)` | `Promise<Record<string, string>>` | All translations for a locale |
| `getAllTranslations(namespace?)` | `Promise<Record<string, Record<string, string>>>` | All locales |
| `getAlternateLinks(path, baseUrl)` | `AlternateLink[]` | Hreflang links |
| `getLocaleInfo(locale)` | `LocaleInfo` | Locale metadata |
| `getLocales()` | `LocaleInfo[]` | All configured locales with metadata |
