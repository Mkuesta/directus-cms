import { readItems, createItem } from '@directus/sdk';
import type { StripeConfig, DirectusOrderItem, OrderItem } from './types.js';

function transformOrderItem(raw: DirectusOrderItem): OrderItem {
  return {
    id: raw.id,
    orderId: raw.order,
    productSlug: raw.product_slug,
    productTitle: raw.product_title,
    productPrice: raw.product_price,
    quantity: raw.quantity,
    fileUrl: raw.file_url || undefined,
    downloadUrl: raw.download_url || undefined,
    createdAt: raw.date_created || undefined,
  };
}

/**
 * Create order items in the relational {prefix}_order_items collection.
 * Only works when config.collections.orderItems is configured.
 */
export async function createOrderItems(
  config: StripeConfig,
  orderId: number,
  items: Array<{
    productSlug: string;
    productTitle: string;
    productPrice: number;
    quantity: number;
    fileUrl?: string;
    downloadUrl?: string;
  }>,
): Promise<OrderItem[]> {
  if (!config.directus || !config.collections?.orderItems) return [];

  const results: OrderItem[] = [];

  for (const item of items) {
    try {
      const created = await config.directus.request(
        createItem(config.collections.orderItems, {
          order: orderId,
          product_slug: item.productSlug,
          product_title: item.productTitle,
          product_price: item.productPrice,
          quantity: item.quantity,
          file_url: item.fileUrl,
          download_url: item.downloadUrl,
        }),
      ) as DirectusOrderItem;
      results.push(transformOrderItem(created));
    } catch (err) {
      console.error(`Failed to create order item for ${item.productSlug}:`, err);
    }
  }

  return results;
}

/**
 * Get order items for a specific order from the relational collection.
 */
export async function getOrderItems(config: StripeConfig, orderId: number): Promise<OrderItem[]> {
  if (!config.directus || !config.collections?.orderItems) return [];

  try {
    const items = await config.directus.request(
      readItems(config.collections.orderItems, {
        filter: { order: { _eq: orderId } },
        fields: ['id', 'order', 'product_slug', 'product_title', 'product_price', 'quantity', 'file_url', 'download_url', 'date_created'],
        sort: ['date_created'],
      }),
    ) as DirectusOrderItem[];

    return items.map(transformOrderItem);
  } catch {
    return [];
  }
}
