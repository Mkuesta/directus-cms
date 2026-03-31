import type { StripeConfig } from './types.js';
import { getSupabaseClient, getSiteId, hasSupabase } from './supabase.js';

/**
 * Log an audit event. Fire-and-forget — never throws.
 */
export async function logAuditEvent(
  config: StripeConfig,
  eventType: string,
  eventData: Record<string, any> = {},
  extra?: { customerId?: string; ipAddress?: string; userAgent?: string },
): Promise<void> {
  if (!config.features?.auditLog || !hasSupabase(config)) return;

  try {
    const supabase = getSupabaseClient(config);
    const siteId = await getSiteId(config);

    await supabase.from('audit_log').insert({
      site_id: siteId,
      customer_id: extra?.customerId || null,
      event_type: eventType,
      event_data: eventData,
      ip_address: extra?.ipAddress || null,
      user_agent: extra?.userAgent || null,
    });
  } catch {
    // Fire-and-forget — audit failures must never block the main flow
  }
}
