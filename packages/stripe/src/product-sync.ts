import Stripe from 'stripe';
import { readItem } from '@directus/sdk';
import type { StripeConfig } from './types.js';
import { getStripe } from './stripe-instance.js';

const _syncCache = new WeakMap<object, Map<number, { stripeProductId: string; stripePriceId: string; ts: number }>>();
const CACHE_TTL = 60_000;

export async function syncProductToStripe(
  config: StripeConfig,
  productId: number,
): Promise<{ stripeProductId: string; stripePriceId: string }> {
  if (!config.directus || !config.collections) {
    throw new Error('@mkuesta/stripe: directus client and collections are required for syncProductToStripe');
  }

  const directus = config.directus;
  const collections = config.collections;

  // Check cache
  const cacheMap = _syncCache.get(directus);
  if (cacheMap) {
    const cached = cacheMap.get(productId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return { stripeProductId: cached.stripeProductId, stripePriceId: cached.stripePriceId };
    }
  }

  if (!collections.products) {
    throw new Error('products collection is required for syncProductToStripe');
  }

  const product = await directus.request(
    readItem(collections.products, productId, {
      fields: ['id', 'title', 'description', 'price', 'sku', 'image'],
    }),
  ) as { id: number; title: string; description?: string; price: number; sku?: string; image?: string };

  const stripe = getStripe(config.stripeSecretKey);
  const currency = config.currency || 'eur';

  // Search for existing Stripe product by metadata
  const existingProducts = await stripe.products.search({
    query: `metadata["directus_id"]:"${productId}"`,
  });

  let stripeProduct: Stripe.Product;
  if (existingProducts.data.length > 0) {
    stripeProduct = await stripe.products.update(existingProducts.data[0].id, {
      name: product.title,
      description: product.description || undefined,
    });
  } else {
    stripeProduct = await stripe.products.create({
      name: product.title,
      description: product.description || undefined,
      metadata: { directus_id: String(productId) },
    });
  }

  // Create or update price
  const price = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: Math.round(product.price * 100),
    currency,
  });

  const result = { stripeProductId: stripeProduct.id, stripePriceId: price.id };

  // Cache the result
  let map = _syncCache.get(directus);
  if (!map) {
    map = new Map();
    _syncCache.set(directus, map);
  }
  map.set(productId, { ...result, ts: Date.now() });

  return result;
}
