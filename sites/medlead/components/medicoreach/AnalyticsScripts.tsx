import { analytics } from '@/lib/analytics';
import { GtmScript, Ga4Script, GtmNoScript } from '@mkuesta/analytics/components';

export async function AnalyticsHead() {
  try {
    const config = await analytics.getTrackingConfig();

    return (
      <>
        {config.gtmId && <GtmScript gtmId={config.gtmId} />}
        {config.ga4Id && !config.gtmId && <Ga4Script ga4Id={config.ga4Id} />}
      </>
    );
  } catch {
    // Analytics settings not yet provisioned — render nothing
    return null;
  }
}

export async function AnalyticsBody() {
  try {
    const config = await analytics.getTrackingConfig();

    return (
      <>
        {config.gtmId && <GtmNoScript gtmId={config.gtmId} />}
      </>
    );
  } catch {
    return null;
  }
}
