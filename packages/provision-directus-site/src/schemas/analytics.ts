import type { CollectionSchema } from '../types.js';

export function analyticsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_analytics_settings`;
  return {
    collection,
    singleton: true,
    group: 'config',
    fields: [
      { field: 'gtm_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Google Tag Manager container ID. Paste the ID from your GTM account. Example: GTM-XXXXXX' } },
      { field: 'ga4_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Google Analytics 4 measurement ID. Found in GA4 Admin → Data Streams. Example: G-XXXXXXXXXX' } },
      { field: 'google_ads_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Google Ads conversion tracking ID. Found in Google Ads → Tools → Conversions. Example: AW-XXXXXXXXX' } },
      { field: 'facebook_pixel_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Facebook/Meta Pixel ID for ad tracking. Found in Meta Events Manager. Example: 1234567890123456' } },
      { field: 'hotjar_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Hotjar site ID for heatmaps and session recordings. Found in Hotjar → Sites & Organizations. Example: 1234567' } },
      { field: 'clarity_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Microsoft Clarity project ID for behavior analytics. Found in your Clarity dashboard. Example: abc1def2gh' } },
      { field: 'custom_head_scripts', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-code', options: { language: 'html' }, note: 'Custom HTML/JS injected into the <head> of every page. Use for third-party scripts that must load early. Paste the full <script> tag.' } },
      { field: 'custom_body_scripts', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-code', options: { language: 'html' }, note: 'Custom HTML/JS injected before the closing </body> tag. Use for tracking pixels or chat widgets. Paste the full <script> tag.' } },
      { field: 'cookie_consent_enabled', type: 'boolean', schema: { is_nullable: true, default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Toggle cookie consent banner on or off. Enable if your site must comply with GDPR/cookie laws.' } },
      { field: 'cookie_consent_message', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Text displayed in the cookie consent banner. Keep it short and clear. Example: We use cookies to improve your experience.' } },
      { field: 'cookie_consent_accept_text', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Label for the accept button in the cookie banner. Example: Accept or Got it' } },
      { field: 'cookie_consent_decline_text', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Label for the decline button in the cookie banner. Example: Decline or No thanks' } },
      { field: 'cookie_consent_policy_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'URL to your cookie/privacy policy page. Linked from the consent banner. Example: /privacy-policy' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
  };
}
