import type { RestClient } from '@directus/sdk';

export interface AnalyticsCollections {
  /** Directus collection for analytics settings (singleton) */
  settings: string;
}

export interface AnalyticsConfig {
  directus: RestClient<any>;
  collections: AnalyticsCollections;
  directusUrl: string;
  siteId?: number;
}

export interface DirectusAnalyticsSettings {
  id?: number;
  gtm_id?: string;
  ga4_id?: string;
  google_ads_id?: string;
  facebook_pixel_id?: string;
  hotjar_id?: string;
  clarity_id?: string;
  custom_head_scripts?: string;
  custom_body_scripts?: string;
  cookie_consent_enabled?: boolean;
  cookie_consent_message?: string;
  cookie_consent_accept_text?: string;
  cookie_consent_decline_text?: string;
  cookie_consent_policy_url?: string;
  site?: number | null;
}

export interface TrackingConfig {
  gtmId?: string;
  ga4Id?: string;
  googleAdsId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  clarityId?: string;
  customHeadScripts?: string;
  customBodyScripts?: string;
}

export interface ConsentConfig {
  enabled: boolean;
  message?: string;
  acceptText?: string;
  declineText?: string;
  policyUrl?: string;
}

export interface AnalyticsClient {
  config: AnalyticsConfig;
  /** Get tracking IDs and script config */
  getTrackingConfig(): Promise<TrackingConfig>;
  /** Get cookie consent configuration */
  getConsentConfig(): Promise<ConsentConfig>;
  /** Get the raw settings */
  getAnalyticsSettings(): Promise<DirectusAnalyticsSettings>;
}
