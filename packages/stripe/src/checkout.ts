import Stripe from 'stripe';
import { createItem, readItems } from '@directus/sdk';
import type { StripeConfig, CreateCheckoutOptions, CheckoutResult, CheckoutItem, DirectusLineItem } from './types.js';
import { getStripe } from './stripe-instance.js';
import { hasSupabase } from './supabase.js';
import { getOrCreateCustomer, updateCustomerStripeId } from './customers.js';
import { convertCents, getExchangeRates } from './exchange-rates.js';

/**
 * Create a Stripe Checkout session.
 * - Validates prices server-side when Directus products collection is available
 * - Stores items_json in metadata for multi-item support
 * - Supports billing details, multi-currency, subscription mode
 * - Templates {CHECKOUT_SESSION_ID} in success/cancel URLs
 */
export async function createCheckoutSession(
  config: StripeConfig,
  options: CreateCheckoutOptions,
): Promise<CheckoutResult> {
  const stripe = getStripe(config.stripeSecretKey);
  const defaultCurrency = config.features?.currencies?.defaultCurrency || config.currency || 'eur';
  const requestedCurrency = options.currency || defaultCurrency;
  const mode = options.mode || 'payment';

  // ---------- Fix 1: Server-side price validation ----------
  // When Directus products collection is available and items have productSlug,
  // fetch authoritative prices from the catalog instead of trusting client input.
  let resolvedItems = options.items;
  if (config.directus && config.collections?.products) {
    resolvedItems = await resolveProductPrices(config, options.items);
  }

  // ---------- Currency conversion ----------
  let currency = requestedCurrency;
  let exchangeRate: number | undefined;
  let originalPriceCents: number | undefined;

  const needsConversion =
    config.features?.currencies &&
    requestedCurrency.toLowerCase() !== defaultCurrency.toLowerCase();

  // ---------- Build line items ----------
  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

  if (mode === 'subscription' && options.priceId) {
    lineItems = [{ price: options.priceId, quantity: 1 }];
  } else {
    const totalCentsBase = resolvedItems.reduce((s, i) => s + Math.round(i.unitPrice * 100) * i.quantity, 0);

    if (needsConversion) {
      const rates = await getExchangeRates(config, defaultCurrency);
      const targetRate = rates.rates[requestedCurrency.toUpperCase()];
      if (targetRate) {
        exchangeRate = targetRate;
        originalPriceCents = totalCentsBase;
      }
    }

    lineItems = await Promise.all(
      resolvedItems.map(async (item) => {
        let unitAmount = Math.round(item.unitPrice * 100);

        if (needsConversion) {
          unitAmount = await convertCents(config, unitAmount, defaultCurrency, requestedCurrency);
        }

        return {
          price_data: {
            currency,
            product_data: {
              name: item.name,
              description: item.description,
            },
            unit_amount: unitAmount,
            ...(mode === 'subscription' ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: item.quantity,
        };
      }),
    );
  }

  // ---------- Fix 2: Metadata with items_json for multi-item ----------
  const metadata: Record<string, string> = { ...(options.metadata || {}) };
  if (config.siteSlug) metadata.site_slug = config.siteSlug;

  // Always store the first product for backward compat
  const firstWithSlug = resolvedItems.find((i) => i.productSlug);
  if (firstWithSlug) {
    metadata.product_slug = firstWithSlug.productSlug!;
    metadata.product_name = firstWithSlug.name;
  }

  // Store full items array for multi-item purchases
  const itemsForMeta = resolvedItems.map((i) => ({
    name: i.name,
    slug: i.productSlug || '',
    quantity: i.quantity,
    priceCents: Math.round(i.unitPrice * 100),
  }));
  metadata.items_json = JSON.stringify(itemsForMeta);
  metadata.item_count = String(resolvedItems.length);

  if (options.billingDetails) {
    metadata.billing_details = JSON.stringify(options.billingDetails);
  }
  if (exchangeRate !== undefined) {
    metadata.exchange_rate = String(exchangeRate);
  }
  if (originalPriceCents !== undefined) {
    metadata.original_price_cents = String(originalPriceCents);
    metadata.original_currency = defaultCurrency;
  }

  // ---------- Stripe customer ----------
  let stripeCustomerId: string | undefined;
  if (hasSupabase(config) && options.customerEmail) {
    const customer = await getOrCreateCustomer(config, options.customerEmail, options.billingDetails?.name);

    if (customer.stripeCustomerId) {
      stripeCustomerId = customer.stripeCustomerId;
    } else {
      const stripeCustomer = await stripe.customers.create({
        email: options.customerEmail,
        name: options.billingDetails?.name,
        metadata: { site_slug: config.siteSlug || '', customer_id: customer.id },
      });
      stripeCustomerId = stripeCustomer.id;
      await updateCustomerStripeId(config, customer.id, stripeCustomer.id);
    }
  }

  // ---------- Fix 9: Template success/cancel URLs ----------
  // Replace {CHECKOUT_SESSION_ID} placeholder — Stripe also supports its own {CHECKOUT_SESSION_ID}
  const successUrl = config.successUrl.replace(/\{CHECKOUT_SESSION_ID\}/g, '{CHECKOUT_SESSION_ID}');
  const cancelUrl = config.cancelUrl;

  // ---------- Create session ----------
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  };

  if (stripeCustomerId) {
    sessionParams.customer = stripeCustomerId;
  } else if (options.customerEmail) {
    sessionParams.customer_email = options.customerEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  // ---------- Directus pending order (legacy) ----------
  if (config.directus && config.collections?.orders) {
    const directusLineItems: DirectusLineItem[] = resolvedItems.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      product_id: item.productId,
    }));

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    await config.directus.request(
      createItem(config.collections.orders, {
        stripe_session_id: session.id,
        stripe_payment_intent: null,
        customer_email: options.customerEmail || '',
        customer_name: options.billingDetails?.name || null,
        status: 'pending',
        line_items: directusLineItems,
        subtotal,
        tax: 0,
        total: subtotal,
        currency,
        site: config.siteId || null,
        metadata: options.metadata || null,
      }),
    );
  }

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

export async function getCheckoutSessionStatus(
  config: StripeConfig,
  sessionId: string,
): Promise<{ status: string; paymentStatus: string }> {
  const stripe = getStripe(config.stripeSecretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    status: session.status || 'unknown',
    paymentStatus: session.payment_status,
  };
}

// ---------------------------------------------------------------------------
// Fix 1: Server-side price resolution from Directus product catalog
// ---------------------------------------------------------------------------

async function resolveProductPrices(
  config: StripeConfig,
  items: CheckoutItem[],
): Promise<CheckoutItem[]> {
  if (!config.directus || !config.collections?.products) return items;

  const slugs = items.map((i) => i.productSlug).filter(Boolean) as string[];
  if (slugs.length === 0) return items;

  try {
    const products = await config.directus.request(
      readItems(config.collections.products, {
        filter: { slug: { _in: slugs } },
        fields: ['*'],
        limit: slugs.length,
      }),
    ) as Array<{ slug: string; title?: string; name?: string; price?: number; price_cents?: number; status?: string }>;

    const priceMap = new Map<string, number>();
    for (const p of products) {
      // Support both price (dollars) and price_cents (cents) fields
      const priceDollars = p.price_cents ? p.price_cents / 100 : p.price;
      if (priceDollars !== undefined && priceDollars > 0) {
        priceMap.set(p.slug, priceDollars);
      }
    }

    return items.map((item) => {
      if (item.productSlug && priceMap.has(item.productSlug)) {
        // Use authoritative server-side price
        return { ...item, unitPrice: priceMap.get(item.productSlug)! };
      }
      return item;
    });
  } catch (err) {
    // SECURITY: Never fall back to client-provided prices — reject checkout instead
    console.error('[stripe] Server-side price verification failed:', err);
    throw new Error('Unable to verify product prices. Please try again.');
  }
}
