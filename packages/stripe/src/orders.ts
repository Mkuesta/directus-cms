import { readItems, readItem } from '@directus/sdk';
import type { StripeConfig, DirectusOrder, Order, GetOrdersOptions } from './types.js';

function transformOrder(raw: DirectusOrder): Order {
  return {
    id: raw.id,
    stripeSessionId: raw.stripe_session_id,
    stripePaymentIntent: raw.stripe_payment_intent,
    customerEmail: raw.customer_email,
    customerName: raw.customer_name,
    status: raw.status,
    lineItems: (raw.line_items || []).map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      productId: item.product_id,
      productSlug: item.product_slug,
      fileUrl: item.file_url,
    })),
    subtotal: raw.subtotal,
    tax: raw.tax,
    total: raw.total,
    currency: raw.currency,
    metadata: raw.metadata,
    createdAt: raw.date_created || undefined,
    updatedAt: raw.date_updated || undefined,
  };
}

const ORDER_FIELDS = [
  'id', 'stripe_session_id', 'stripe_payment_intent', 'customer_email',
  'customer_name', 'status', 'line_items', 'subtotal', 'tax', 'total',
  'currency', 'site', 'metadata', 'date_created', 'date_updated',
] as const;

function requireDirectus(config: StripeConfig) {
  if (!config.directus || !config.collections) {
    throw new Error('@directus-cms/stripe: directus client and collections are required for order operations');
  }
  return { directus: config.directus, collections: config.collections };
}

export async function getOrder(config: StripeConfig, id: number): Promise<Order | null> {
  try {
    const { directus, collections } = requireDirectus(config);
    const filter: Record<string, any> = { id: { _eq: id } };
    if (config.siteId) filter.site = { _eq: config.siteId };

    const items = await directus.request(
      readItems(collections.orders, {
        filter,
        fields: [...ORDER_FIELDS],
        limit: 1,
      }),
    ) as DirectusOrder[];
    return items.length ? transformOrder(items[0]) : null;
  } catch {
    return null;
  }
}

export async function getOrderBySessionId(config: StripeConfig, sessionId: string): Promise<Order | null> {
  const { directus, collections } = requireDirectus(config);
  const filter: Record<string, any> = { stripe_session_id: { _eq: sessionId } };
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await directus.request(
    readItems(collections.orders, {
      filter,
      fields: [...ORDER_FIELDS],
      limit: 1,
    }),
  ) as DirectusOrder[];

  return items.length ? transformOrder(items[0]) : null;
}

export async function getOrders(config: StripeConfig, options?: GetOrdersOptions): Promise<Order[]> {
  const { directus, collections } = requireDirectus(config);
  const filter: Record<string, any> = {};
  if (config.siteId) filter.site = { _eq: config.siteId };
  if (options?.status) filter.status = { _eq: options.status };
  if (options?.customerEmail) filter.customer_email = { _eq: options.customerEmail };

  const items = await directus.request(
    readItems(collections.orders, {
      filter,
      fields: [...ORDER_FIELDS],
      limit: options?.limit || 100,
      sort: ['-date_created'],
    }),
  ) as DirectusOrder[];

  return items.map(transformOrder);
}
