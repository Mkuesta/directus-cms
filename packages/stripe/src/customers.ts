import type { StripeConfig, Customer } from './types.js';
import { getSupabaseClient, getSiteId } from './supabase.js';

function transformCustomer(raw: any): Customer {
  return {
    id: raw.id,
    siteId: raw.site_id,
    email: raw.email,
    name: raw.name,
    stripeCustomerId: raw.stripe_customer_id,
    metadata: raw.metadata || {},
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Get or create a customer by email. Upserts on (site_id, email).
 */
export async function getOrCreateCustomer(
  config: StripeConfig,
  email: string,
  name?: string,
): Promise<Customer> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  // Try to find existing
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('site_id', siteId)
    .eq('email', email)
    .single();

  if (existing) {
    // Update name if provided and different
    if (name && name !== existing.name) {
      const { data: updated } = await supabase
        .from('customers')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .single();
      return transformCustomer(updated || existing);
    }
    return transformCustomer(existing);
  }

  // Create new customer
  const { data: created, error } = await supabase
    .from('customers')
    .insert({
      site_id: siteId,
      email,
      name: name || null,
    })
    .select('*')
    .single();

  if (error || !created) {
    throw new Error(`Failed to create customer: ${error?.message}`);
  }

  return transformCustomer(created);
}

/**
 * Find a customer by their Stripe customer ID.
 */
export async function getCustomerByStripeId(
  config: StripeConfig,
  stripeCustomerId: string,
): Promise<Customer | null> {
  const supabase = getSupabaseClient(config);
  const siteId = await getSiteId(config);

  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('site_id', siteId)
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  return data ? transformCustomer(data) : null;
}

/**
 * Update a customer's Stripe customer ID.
 */
export async function updateCustomerStripeId(
  config: StripeConfig,
  customerId: string,
  stripeCustomerId: string,
): Promise<void> {
  const supabase = getSupabaseClient(config);

  await supabase
    .from('customers')
    .update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
    .eq('id', customerId);
}
