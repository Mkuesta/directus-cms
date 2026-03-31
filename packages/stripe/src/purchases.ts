import type { StripeConfig, Purchase, CreatePurchaseResult } from './types.js';
import { getSupabaseClient, getSiteId } from './supabase.js';

function transformPurchase(raw: any): Purchase {
  return {
    id: raw.id,
    siteId: raw.site_id,
    customerId: raw.customer_id,
    stripeSessionId: raw.stripe_session_id,
    stripePaymentIntentId: raw.stripe_payment_intent_id,
    productSlug: raw.product_slug,
    productName: raw.product_name,
    customerEmail: raw.customer_email,
    amountCents: raw.amount_cents,
    currency: raw.currency,
    status: raw.status,
    downloadCount: raw.download_count,
    maxDownloads: raw.max_downloads,
    downloadExpiresAt: raw.download_expires_at,
    metadata: raw.metadata || {},
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Create a purchase record. Idempotent — uses stripe_session_id unique constraint.
 * Returns { purchase, isNew } so callers can skip duplicate processing (e.g. email).
 */
export async function createPurchase(
  config: StripeConfig,
  data: {
    stripeSessionId: string;
    stripePaymentIntentId?: string;
    productSlug: string;
    productName: string;
    customerEmail: string;
    amountCents: number;
    currency: string;
    customerId?: string;
    maxDownloads?: number;
    metadata?: Record<string, any>;
  },
): Promise<CreatePurchaseResult> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  // Query first for idempotency
  const { data: existing } = await supabase
    .from('purchases')
    .select('*')
    .eq('stripe_session_id', data.stripeSessionId)
    .single();

  if (existing) return { purchase: transformPurchase(existing), isNew: false };

  const maxDownloads = data.maxDownloads ?? config.features?.downloads?.maxDownloads ?? 10;
  const downloadExpiresAt = config.features?.downloads
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    : null;

  const { data: created, error } = await supabase
    .from('purchases')
    .insert({
      site_id: siteId,
      customer_id: data.customerId || null,
      stripe_session_id: data.stripeSessionId,
      stripe_payment_intent_id: data.stripePaymentIntentId || null,
      product_slug: data.productSlug,
      product_name: data.productName,
      customer_email: data.customerEmail,
      amount_cents: data.amountCents,
      currency: data.currency,
      status: 'paid',
      max_downloads: maxDownloads,
      download_expires_at: downloadExpiresAt,
      metadata: data.metadata || {},
    })
    .select('*')
    .single();

  if (error || !created) {
    // Might be a race condition — try fetching again
    const { data: retry } = await supabase
      .from('purchases')
      .select('*')
      .eq('stripe_session_id', data.stripeSessionId)
      .single();

    if (retry) return { purchase: transformPurchase(retry), isNew: false };
    throw new Error(`Failed to create purchase: ${error?.message}`);
  }

  return { purchase: transformPurchase(created), isNew: true };
}

/**
 * Get a purchase by Stripe session ID.
 */
export async function getPurchaseBySessionId(
  config: StripeConfig,
  sessionId: string,
): Promise<Purchase | null> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  let query = supabase
    .from('purchases')
    .select('*')
    .eq('stripe_session_id', sessionId);

  if (siteId) query = query.eq('site_id', siteId);

  const { data } = await query.single();

  return data ? transformPurchase(data) : null;
}

/**
 * Get all purchases for a customer email.
 */
export async function getPurchases(
  config: StripeConfig,
  email: string,
): Promise<Purchase[]> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  const { data } = await supabase
    .from('purchases')
    .select('*')
    .eq('site_id', siteId)
    .eq('customer_email', email)
    .order('created_at', { ascending: false });

  return (data || []).map(transformPurchase);
}

/**
 * Increment the download count for a purchase. Returns updated purchase.
 */
export async function incrementDownloadCount(
  config: StripeConfig,
  purchaseId: string,
): Promise<Purchase | null> {
  const supabase = getSupabaseClient(config);

  // Fetch current count
  const { data: current } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', purchaseId)
    .single();

  if (!current) return null;

  const { data: updated } = await supabase
    .from('purchases')
    .update({
      download_count: (current.download_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .select('*')
    .single();

  return updated ? transformPurchase(updated) : null;
}

/**
 * Check if a purchase is valid for downloading.
 */
export function isPurchaseValid(purchase: Purchase): { valid: boolean; reason?: string } {
  if (purchase.status !== 'paid') {
    return { valid: false, reason: 'Purchase is not paid' };
  }

  if (purchase.downloadCount >= purchase.maxDownloads) {
    return { valid: false, reason: 'Download limit exceeded' };
  }

  if (purchase.downloadExpiresAt && new Date(purchase.downloadExpiresAt) < new Date()) {
    return { valid: false, reason: 'Download link has expired' };
  }

  return { valid: true };
}
