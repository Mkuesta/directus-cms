import type { AnalyticsConfig, AnalyticsClient } from './types';
import { getTrackingConfig, getConsentConfig, getAnalyticsSettings } from './analytics';

export function createAnalyticsClient(config: AnalyticsConfig): AnalyticsClient {
  return {
    config,
    getTrackingConfig: () => getTrackingConfig(config),
    getConsentConfig: () => getConsentConfig(config),
    getAnalyticsSettings: () => getAnalyticsSettings(config),
  };
}

export type {
  AnalyticsConfig,
  AnalyticsCollections,
  AnalyticsClient,
  DirectusAnalyticsSettings,
  TrackingConfig,
  ConsentConfig,
} from './types';

export { getTrackingConfig, getConsentConfig, getAnalyticsSettings } from './analytics';
