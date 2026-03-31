import Stripe from 'stripe';
import { readItems, updateItem } from '@directus/sdk';
import type { StripeConfig, OrderStatus, DirectusOrder, CheckoutItem } from './types.js';
import { getStripe } from './stripe-instance.js';
import { hasSupabase } from './supabase.js';
import { getOrCreateCustomer } from './customers.js';
import { createPurchase } from './purchases.js';
import { createSubscription, updateSubscriptionStatus, getSubscriptionByStripeId } from './subscriptions.js';
import { saveInvoice } from './invoices.js';
import { generateDownloadToken, buildDownloadUrl } from './download-token.js';
import { logAuditEvent } from './audit.js';
import { createOrderItems } from './order-items.js';

export function createStripeWebhookHandler(config: StripeConfig) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stripe = getStripe(config.stripeSecretKey);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, config.stripeWebhookSecret);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ---------- Fix 5: Always return 200 to Stripe ----------
    // Returning 500 causes Stripe to retry for up to 3 days.
    // Permanent failures should not be retried. Log the error instead.
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(config, stripe, event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(config, event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(config, event.data.object as Stripe.Charge);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          if (config.features?.subscriptions && hasSupabase(config)) {
            await handleSubscriptionUpdate(config, event.data.object as Stripe.Subscription, event.type);
          }
          break;

        case 'customer.subscription.deleted':
          if (config.features?.subscriptions && hasSupabase(config)) {
            await handleSubscriptionDeleted(config, event.data.object as Stripe.Subscription);
          }
          break;

        case 'invoice.paid':
        case 'invoice.payment_failed':
          if (config.features?.invoices && hasSupabase(config)) {
            await handleInvoiceEvent(config, event.data.object as Stripe.Invoice, event.type);
          }
          break;
      }
    } catch (err) {
      // Log but still return 200 — do not cause Stripe retries on permanent failures
      await logAuditEvent(config, 'webhook.error', {
        eventType: event.type,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

// ---------------------------------------------------------------------------
// Helpers: parse items from metadata
// ---------------------------------------------------------------------------

interface MetaItem {
  name: string;
  slug: string;
  quantity: number;
  priceCents: number;
}

function parseItemsFromMetadata(metadata: Record<string, string> | null): MetaItem[] {
  if (!metadata?.items_json) return [];
  try {
    return JSON.parse(metadata.items_json) as MetaItem[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  config: StripeConfig,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const paymentIntent = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || null;
  const email = session.customer_details?.email || '';
  const name = session.customer_details?.name || undefined;

  // ---------- Fix 2: Multi-item support ----------
  const metaItems = parseItemsFromMetadata(session.metadata as Record<string, string> | null);

  // 1. Update Directus order (legacy)
  if (config.directus && config.collections?.orders) {
    await updateDirectusOrderStatus(config, session.id, 'paid', {
      stripe_payment_intent: paymentIntent,
      customer_email: email || undefined,
      customer_name: name,
      total: session.amount_total ? session.amount_total / 100 : undefined,
      tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : undefined,
    });

    // Create relational order items if the collection is configured
    if (config.collections.orderItems && metaItems.length > 0) {
      // Resolve the Directus order ID by session
      const { getOrderBySessionId } = await import('./orders.js');
      const order = await getOrderBySessionId(config, session.id);
      if (order) {
        await createOrderItems(config, order.id, metaItems.map((i) => ({
          productSlug: i.slug,
          productTitle: i.name,
          productPrice: i.priceCents / 100,
          quantity: i.quantity,
        })));
      }
    }
  }

  // 2. Create Supabase purchase + download tokens
  if (hasSupabase(config) && email) {
    const customer = await getOrCreateCustomer(config, email, name);

    const itemCount = metaItems.length || 1;

    // Primary product slug (backward compat)
    const productSlug = session.metadata?.product_slug || metaItems[0]?.slug || 'unknown';
    const productName = session.metadata?.product_name || metaItems[0]?.name || 'Purchase';

    // max_downloads scales with item count (like AFO: 10 per item)
    const baseMaxDownloads = config.features?.downloads?.maxDownloads ?? 10;
    const maxDownloads = baseMaxDownloads * itemCount;

    // ---------- Fix 3: createPurchase returns { purchase, isNew } ----------
    const { purchase, isNew } = await createPurchase(config, {
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntent || undefined,
      productSlug,
      productName,
      customerEmail: email,
      amountCents: session.amount_total || 0,
      currency: session.currency || 'usd',
      customerId: customer.id,
      maxDownloads,
      metadata: {
        ...(session.metadata ? { ...session.metadata } : {}),
        items: metaItems,
      },
    });

    // Only process email/tokens on first webhook delivery (isNew)
    if (isNew) {
      // Generate download tokens per item
      const downloadUrls: Record<string, string> = {};
      if (config.features?.downloads) {
        const slugsToTokenize = metaItems.length > 0
          ? metaItems.filter((i) => i.slug).map((i) => i.slug)
          : productSlug !== 'unknown' ? [productSlug] : [];

        for (const slug of slugsToTokenize) {
          const token = await generateDownloadToken(config, purchase.id, slug);
          downloadUrls[slug] = buildDownloadUrl(config, token);
        }
      }

      // Audit log
      await logAuditEvent(config, 'purchase.completed', {
        purchaseId: purchase.id,
        sessionId: session.id,
        productSlug,
        itemCount,
        amountCents: session.amount_total,
        currency: session.currency,
      }, { customerId: customer.id });

      // Fire callback with download URLs
      if (config.onPurchaseComplete) {
        const checkoutItems: CheckoutItem[] = metaItems.length > 0
          ? metaItems.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.priceCents / 100,
              productSlug: i.slug,
            }))
          : [{ name: productName, quantity: 1, unitPrice: (session.amount_total || 0) / 100, productSlug }];

        await config.onPurchaseComplete(purchase, {
          sessionId: session.id,
          customerEmail: email,
          amountCents: session.amount_total || 0,
          currency: session.currency || 'usd',
          items: checkoutItems,
          billingDetails: session.metadata?.billing_details
            ? JSON.parse(session.metadata.billing_details)
            : undefined,
          downloadUrls,
        });
      }
    }
  }
}

async function handlePaymentFailed(config: StripeConfig, intent: Stripe.PaymentIntent): Promise<void> {
  if (config.directus && config.collections?.orders) {
    const orders = await config.directus.request(
      readItems(config.collections.orders, {
        filter: { stripe_payment_intent: { _eq: intent.id } },
        fields: ['id'],
        limit: 1,
      }),
    ) as DirectusOrder[];

    if (orders.length) {
      await setDirectusOrderStatus(config, orders[0].id, 'failed');
    }
  }

  await logAuditEvent(config, 'payment.failed', {
    paymentIntentId: intent.id,
    error: intent.last_payment_error?.message,
  });
}

async function handleChargeRefunded(config: StripeConfig, charge: Stripe.Charge): Promise<void> {
  if (config.directus && config.collections?.orders) {
    const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (pi) {
      const orders = await config.directus.request(
        readItems(config.collections.orders, {
          filter: { stripe_payment_intent: { _eq: pi } },
          fields: ['id'],
          limit: 1,
        }),
      ) as DirectusOrder[];

      if (orders.length) {
        await setDirectusOrderStatus(config, orders[0].id, 'refunded');
      }
    }
  }

  await logAuditEvent(config, 'charge.refunded', {
    chargeId: charge.id,
    paymentIntentId: typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id,
    amountRefunded: charge.amount_refunded,
  });
}

async function handleSubscriptionUpdate(
  config: StripeConfig,
  sub: Stripe.Subscription,
  eventType: string,
): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  const priceId = sub.items.data[0]?.price?.id;

  let internalCustomerId: string | undefined;
  if (customerId) {
    const { getCustomerByStripeId } = await import('./customers.js');
    const customer = await getCustomerByStripeId(config, customerId);
    internalCustomerId = customer?.id;
  }

  const subscription = await createSubscription(config, {
    stripeSubscriptionId: sub.id,
    stripePriceId: priceId,
    planName: sub.items.data[0]?.price?.nickname || undefined,
    status: sub.status,
    customerId: internalCustomerId,
    currentPeriodStart: sub.current_period_start
      ? new Date(sub.current_period_start * 1000).toISOString()
      : undefined,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : undefined,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    metadata: sub.metadata ? { ...sub.metadata } : {},
  });

  await logAuditEvent(config, eventType, {
    subscriptionId: subscription.id,
    stripeSubscriptionId: sub.id,
    status: sub.status,
  }, { customerId: internalCustomerId });

  if (config.onSubscriptionChange) {
    await config.onSubscriptionChange(subscription, eventType);
  }
}

async function handleSubscriptionDeleted(config: StripeConfig, sub: Stripe.Subscription): Promise<void> {
  const subscription = await updateSubscriptionStatus(config, sub.id, 'canceled', {
    canceledAt: new Date().toISOString(),
  });

  await logAuditEvent(config, 'customer.subscription.deleted', {
    stripeSubscriptionId: sub.id,
  });

  if (subscription && config.onSubscriptionChange) {
    await config.onSubscriptionChange(subscription, 'customer.subscription.deleted');
  }
}

async function handleInvoiceEvent(
  config: StripeConfig,
  invoice: Stripe.Invoice,
  eventType: string,
): Promise<void> {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as any)?.id;

  let internalCustomerId: string | undefined;
  if (customerId) {
    const { getCustomerByStripeId } = await import('./customers.js');
    const customer = await getCustomerByStripeId(config, customerId);
    internalCustomerId = customer?.id;
  }

  let internalSubId: string | undefined;
  const stripeSub = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as any)?.id;
  if (stripeSub) {
    const sub = await getSubscriptionByStripeId(config, stripeSub);
    internalSubId = sub?.id;
  }

  await saveInvoice(config, {
    stripeInvoiceId: invoice.id,
    customerId: internalCustomerId,
    subscriptionId: internalSubId,
    invoiceNumber: invoice.number || undefined,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || undefined,
    invoicePdfUrl: invoice.invoice_pdf || undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    periodStart: invoice.period_start
      ? new Date(invoice.period_start * 1000).toISOString()
      : undefined,
    periodEnd: invoice.period_end
      ? new Date(invoice.period_end * 1000).toISOString()
      : undefined,
    paidAt: eventType === 'invoice.paid' ? new Date().toISOString() : undefined,
  });

  await logAuditEvent(config, eventType, {
    stripeInvoiceId: invoice.id,
    amountDue: invoice.amount_due,
    status: invoice.status,
  }, { customerId: internalCustomerId });
}

// ---------------------------------------------------------------------------
// Directus order helpers (legacy)
// ---------------------------------------------------------------------------

async function updateDirectusOrderStatus(
  config: StripeConfig,
  sessionId: string,
  status: OrderStatus,
  extra?: Record<string, any>,
): Promise<void> {
  if (!config.directus || !config.collections?.orders) return;

  const items = await config.directus.request(
    readItems(config.collections.orders, {
      filter: { stripe_session_id: { _eq: sessionId } },
      fields: ['id'],
      limit: 1,
    }),
  ) as DirectusOrder[];

  if (!items.length) return;

  const updateData: Record<string, any> = { status, ...extra };
  await config.directus.request(
    updateItem(config.collections.orders, items[0].id, updateData),
  );

  if (config.onOrderStatusChange) {
    const order = await config.directus.request(
      readItems(config.collections.orders, {
        filter: { id: { _eq: items[0].id } },
        fields: ['id', 'stripe_session_id', 'stripe_payment_intent', 'customer_email', 'customer_name', 'status', 'line_items', 'subtotal', 'tax', 'total', 'currency', 'metadata', 'date_created', 'date_updated'],
        limit: 1,
      }),
    ) as DirectusOrder[];
    if (order.length) {
      const transformed = {
        id: order[0].id,
        stripeSessionId: order[0].stripe_session_id,
        stripePaymentIntent: order[0].stripe_payment_intent,
        customerEmail: order[0].customer_email,
        customerName: order[0].customer_name,
        status: order[0].status,
        lineItems: (order[0].line_items || []).map((i) => ({ name: i.name, description: i.description, quantity: i.quantity, unitPrice: i.unit_price, productId: i.product_id })),
        subtotal: order[0].subtotal,
        tax: order[0].tax,
        total: order[0].total,
        currency: order[0].currency,
        metadata: order[0].metadata,
        createdAt: order[0].date_created || undefined,
        updatedAt: order[0].date_updated || undefined,
      };
      await config.onOrderStatusChange(items[0].id, status, transformed);
    }
  }
}

async function setDirectusOrderStatus(config: StripeConfig, orderId: number, status: OrderStatus): Promise<void> {
  if (!config.directus || !config.collections?.orders) return;

  await config.directus.request(
    updateItem(config.collections.orders, orderId, { status }),
  );

  if (config.onOrderStatusChange) {
    const items = await config.directus.request(
      readItems(config.collections.orders, {
        filter: { id: { _eq: orderId } },
        fields: ['id', 'stripe_session_id', 'stripe_payment_intent', 'customer_email', 'customer_name', 'status', 'line_items', 'subtotal', 'tax', 'total', 'currency', 'metadata', 'date_created', 'date_updated'],
        limit: 1,
      }),
    ) as DirectusOrder[];
    if (items.length) {
      const raw = items[0];
      const order = {
        id: raw.id,
        stripeSessionId: raw.stripe_session_id,
        stripePaymentIntent: raw.stripe_payment_intent,
        customerEmail: raw.customer_email,
        customerName: raw.customer_name,
        status: raw.status,
        lineItems: (raw.line_items || []).map((i) => ({ name: i.name, description: i.description, quantity: i.quantity, unitPrice: i.unit_price, productId: i.product_id })),
        subtotal: raw.subtotal,
        tax: raw.tax,
        total: raw.total,
        currency: raw.currency,
        metadata: raw.metadata,
        createdAt: raw.date_created || undefined,
        updatedAt: raw.date_updated || undefined,
      };
      await config.onOrderStatusChange(orderId, status, order);
    }
  }
}
