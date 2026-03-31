import { readSingleton } from '@directus/sdk';
import type { AnalyticsConfig, DirectusAnalyticsSettings, TrackingConfig, ConsentConfig } from './types';

const _cache = new WeakMap<object, { data: DirectusAnalyticsSettings; expires: number }>();
const CACHE_TTL = 60_000;

export async function getAnalyticsSettings(config: AnalyticsConfig): Promise<DirectusAnalyticsSettings> {
  const cached = _cache.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const raw = await config.directus.request(
      readSingleton(config.collections.settings as any, {
        fields: [
          'gtm_id',
          'ga4_id',
          'google_ads_id',
          'facebook_pixel_id',
          'hotjar_id',
          'clarity_id',
          'custom_head_scripts',
          'custom_body_scripts',
          'cookie_consent_enabled',
          'cookie_consent_message',
          'cookie_consent_accept_text',
          'cookie_consent_decline_text',
          'cookie_consent_policy_url',
        ],
      })
    ) as unknown as DirectusAnalyticsSettings;

    _cache.set(config.directus, { data: raw, expires: Date.now() + CACHE_TTL });
    return raw;
  } catch {
    return {};
  }
}

export async function getTrackingConfig(config: AnalyticsConfig): Promise<TrackingConfig> {
  const settings = await getAnalyticsSettings(config);
  return {
    gtmId: settings.gtm_id,
    ga4Id: settings.ga4_id,
    googleAdsId: settings.google_ads_id,
    facebookPixelId: settings.facebook_pixel_id,
    hotjarId: settings.hotjar_id,
    clarityId: settings.clarity_id,
    customHeadScripts: settings.custom_head_scripts,
    customBodyScripts: settings.custom_body_scripts,
  };
}

export async function getConsentConfig(config: AnalyticsConfig): Promise<ConsentConfig> {
  const settings = await getAnalyticsSettings(config);
  return {
    enabled: settings.cookie_consent_enabled ?? false,
    message: settings.cookie_consent_message,
    acceptText: settings.cookie_consent_accept_text ?? 'Accept',
    declineText: settings.cookie_consent_decline_text ?? 'Decline',
    policyUrl: settings.cookie_consent_policy_url,
  };
}
