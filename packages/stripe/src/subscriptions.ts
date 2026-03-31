import type { StripeConfig, Subscription } from './types.js';
import { getSupabaseClient, getSiteId } from './supabase.js';

function transformSubscription(raw: any): Subscription {
  return {
    id: raw.id,
    siteId: raw.site_id,
    customerId: raw.customer_id,
    stripeSubscriptionId: raw.stripe_subscription_id,
    stripePriceId: raw.stripe_price_id,
    planName: raw.plan_name,
    status: raw.status,
    currentPeriodStart: raw.current_period_start,
    currentPeriodEnd: raw.current_period_end,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    canceledAt: raw.canceled_at,
    metadata: raw.metadata || {},
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Create or update a subscription record. Upserts on stripe_subscription_id.
 */
export async function createSubscription(
  config: StripeConfig,
  data: {
    stripeSubscriptionId: string;
    stripePriceId?: string;
    planName?: string;
    status: string;
    customerId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, any>;
  },
): Promise<Subscription> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  const { data: result, error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        site_id: siteId,
        customer_id: data.customerId || null,
        stripe_subscription_id: data.stripeSubscriptionId,
        stripe_price_id: data.stripePriceId || null,
        plan_name: data.planName || null,
        status: data.status,
        current_period_start: data.currentPeriodStart || null,
        current_period_end: data.currentPeriodEnd || null,
        cancel_at_period_end: data.cancelAtPeriodEnd ?? false,
        metadata: data.metadata || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' },
    )
    .select('*')
    .single();

  if (error || !result) {
    throw new Error(`Failed to upsert subscription: ${error?.message}`);
  }

  return transformSubscription(result);
}

/**
 * Update a subscription's status.
 */
export async function updateSubscriptionStatus(
  config: StripeConfig,
  stripeSubscriptionId: string,
  status: string,
  extra?: { canceledAt?: string; cancelAtPeriodEnd?: boolean },
): Promise<Subscription | null> {
  const supabase = getSupabaseClient(config);

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (extra?.canceledAt !== undefined) updateData.canceled_at = extra.canceledAt;
  if (extra?.cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = extra.cancelAtPeriodEnd;

  const { data } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .select('*')
    .single();

  return data ? transformSubscription(data) : null;
}

/**
 * Get a subscription by Stripe subscription ID.
 */
export async function getSubscriptionByStripeId(
  config: StripeConfig,
  stripeSubscriptionId: string,
): Promise<Subscription | null> {
  const supabase = getSupabaseClient(config);

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  return data ? transformSubscription(data) : null;
}

/**
 * Get the active subscription for a customer (by email).
 */
export async function getCustomerSubscription(
  config: StripeConfig,
  email: string,
): Promise<Subscription | null> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  // Join through customers table
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('site_id', siteId)
    .eq('email', email)
    .single();

  if (!customer) return null;

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('site_id', siteId)
    .eq('customer_id', customer.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data ? transformSubscription(data) : null;
}

/**
 * Get all subscriptions for a customer email.
 */
export async function getSubscriptions(
  config: StripeConfig,
  email: string,
): Promise<Subscription[]> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('site_id', siteId)
    .eq('email', email)
    .single();

  if (!customer) return [];

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('site_id', siteId)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return (data || []).map(transformSubscription);
}
