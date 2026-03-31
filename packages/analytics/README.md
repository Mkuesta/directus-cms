# @directus-cms/analytics

Analytics and cookie consent configuration from Directus for Next.js sites. Manage GTM, GA4, Facebook Pixel, Hotjar, Clarity IDs and cookie consent settings from Directus — change tracking per site without code changes.

## Setup

### 1. Directus Collection (`{prefix}_analytics_settings`) — Singleton

| Field | Type | Description |
|-------|------|-------------|
| `gtm_id` | String | Google Tag Manager ID (e.g. `GTM-XXXXXX`) |
| `ga4_id` | String | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`) |
| `google_ads_id` | String | Google Ads conversion ID |
| `facebook_pixel_id` | String | Facebook Pixel ID |
| `hotjar_id` | String | Hotjar site ID |
| `clarity_id` | String | Microsoft Clarity project ID |
| `custom_head_scripts` | Text | Custom scripts for `<head>` |
| `custom_body_scripts` | Text | Custom scripts for `<body>` |
| `cookie_consent_enabled` | Boolean | Show cookie consent banner |
| `cookie_consent_message` | Text | Consent banner message |
| `cookie_consent_accept_text` | String | Accept button text |
| `cookie_consent_decline_text` | String | Decline button text |
| `cookie_consent_policy_url` | String | Link to privacy policy |

### 2. Config

```ts
// lib/analytics.ts
import { createAnalyticsClient } from '@directus-cms/analytics';
import { directus, COLLECTION_PREFIX } from './cms';

export const analytics = createAnalyticsClient({
  directus,
  collections: { settings: `${COLLECTION_PREFIX}_analytics_settings` },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
```

### 3. Usage in Layout

```tsx
// app/layout.tsx
import { analytics } from '@/lib/analytics';
import { GtmScript, GtmNoScript } from '@directus-cms/analytics/components';

export default async function RootLayout({ children }) {
  const tracking = await analytics.getTrackingConfig();

  return (
    <html>
      <head>
        {tracking.gtmId && <GtmScript gtmId={tracking.gtmId} />}
      </head>
      <body>
        {tracking.gtmId && <GtmNoScript gtmId={tracking.gtmId} />}
        {children}
      </body>
    </html>
  );
}
```

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `GtmScript` | `gtmId` | GTM script for `<head>` |
| `GtmNoScript` | `gtmId` | GTM noscript iframe for `<body>` |
| `Ga4Script` | `ga4Id` | Standalone GA4 (when not using GTM) |

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `getTrackingConfig()` | `Promise<TrackingConfig>` | All tracking IDs |
| `getConsentConfig()` | `Promise<ConsentConfig>` | Cookie consent settings |
| `getAnalyticsSettings()` | `Promise<DirectusAnalyticsSettings>` | Raw settings |
