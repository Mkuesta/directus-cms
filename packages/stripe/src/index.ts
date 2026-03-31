import type { StripeConfig, StripeClient } from './types.js';
import { createCheckoutSession, getCheckoutSessionStatus } from './checkout.js';
import { getOrder, getOrderBySessionId, getOrders } from './orders.js';
import { getOrderItems } from './order-items.js';
import { syncProductToStripe } from './product-sync.js';
import { createStripeWebhookHandler } from './webhook-handler.js';
import { createCheckoutApiHandler } from './api-handler.js';
import { hasSupabase } from './supabase.js';
import { getPurchaseBySessionId, getPurchases } from './purchases.js';
import { getOrCreateCustomer } from './customers.js';
import { getCustomerSubscription, getSubscriptions } from './subscriptions.js';
import { getInvoices } from './invoices.js';
import { generateDownloadToken } from './download-token.js';
import { createDownloadApiHandler, createDownloadBySessionHandler } from './download-handler.js';
import { getExchangeRates, convertCents, createExchangeRateApiHandler } from './exchange-rates.js';

export function createStripeClient(config: StripeConfig): StripeClient {
  const useSupabase = hasSupabase(config);

  const client: StripeClient = {
    config,

    // Checkout
    createCheckoutSession: (options) => createCheckoutSession(config, options),
    getCheckoutSessionStatus: (sessionId) => getCheckoutSessionStatus(config, sessionId),

    // Directus orders (legacy — requires config.directus + config.collections)
    getOrder: (id) => getOrder(config, id),
    getOrderBySessionId: (sessionId) => getOrderBySessionId(config, sessionId),
    getOrders: (options) => getOrders(config, options),
    getOrderItems: (orderId) => getOrderItems(config, orderId),

    // Product sync (requires config.directus)
    syncProductToStripe: (productId) => syncProductToStripe(config, productId),

    // Handlers
    handleStripeWebhook: createStripeWebhookHandler(config),
    createCheckoutApiHandler: () => createCheckoutApiHandler(config),
    createStripeWebhookHandler: () => createStripeWebhookHandler(config),
  };

  // Supabase-based purchases
  if (useSupabase) {
    client.getPurchaseBySessionId = (sessionId) => getPurchaseBySessionId(config, sessionId);
    client.getPurchases = (email) => getPurchases(config, email);
    client.getOrCreateCustomer = (email, name?) => getOrCreateCustomer(config, email, name);
  }

  // Subscriptions
  if (useSupabase && config.features?.subscriptions) {
    client.getCustomerSubscription = (email) => getCustomerSubscription(config, email);
    client.getSubscriptions = (email) => getSubscriptions(config, email);
  }

  // Invoices
  if (useSupabase && config.features?.invoices) {
    client.getInvoices = (email) => getInvoices(config, email);
  }

  // Downloads
  if (useSupabase && config.features?.downloads) {
    client.generateDownloadToken = (purchaseId, productSlug) =>
      generateDownloadToken(config, purchaseId, productSlug);
    client.createDownloadApiHandler = () => createDownloadApiHandler(config);
    client.createDownloadBySessionHandler = () => createDownloadBySessionHandler(config);
  }

  // Exchange rates
  if (config.features?.currencies) {
    client.getExchangeRates = (base?) => getExchangeRates(config, base);
    client.convertCents = (amountCents, from, to) => convertCents(config, amountCents, from, to);
    client.createExchangeRateApiHandler = () => createExchangeRateApiHandler(config);
  }

  return client;
}

// Types
export type {
  StripeConfig,
  StripeCollections,
  StripeFeatures,
  CurrencyConfig,
  DownloadConfig,
  StripeClient,
  OrderStatus,
  DirectusOrder,
  DirectusLineItem,
  Order,
  LineItem,
  Customer,
  Purchase,
  CreatePurchaseResult,
  Subscription,
  Invoice,
  AuditEvent,
  BillingDetails,
  CheckoutItem,
  CreateCheckoutOptions,
  CheckoutResult,
  CheckoutOrder,
  GetOrdersOptions,
  CartItem,
  ExchangeRates,
  DirectusOrderItem,
  OrderItem,
} from './types.js';

// Individual function exports
export { createCheckoutSession, getCheckoutSessionStatus } from './checkout.js';
export { getOrder, getOrderBySessionId, getOrders } from './orders.js';
export { createOrderItems, getOrderItems } from './order-items.js';
export { syncProductToStripe } from './product-sync.js';
export { createStripeWebhookHandler } from './webhook-handler.js';
export { createCheckoutApiHandler } from './api-handler.js';
export { createDownloadApiHandler, createDownloadBySessionHandler } from './download-handler.js';
export { getExchangeRates, convertCents, createExchangeRateApiHandler } from './exchange-rates.js';
export { generateDownloadToken, verifyDownloadToken, buildDownloadUrl } from './download-token.js';
export { checkRateLimit, getClientIdentifier, rateLimitResponse, DEFAULT_RATE_LIMITS } from './rate-limit.js';
export type { RateLimitResult } from './rate-limit.js';
export { COUNTRIES } from './countries.js';
export { getOrCreateCustomer, getCustomerByStripeId } from './customers.js';
export { createPurchase, getPurchaseBySessionId, getPurchases, incrementDownloadCount, isPurchaseValid } from './purchases.js';
export { createSubscription, updateSubscriptionStatus, getSubscriptionByStripeId, getCustomerSubscription, getSubscriptions } from './subscriptions.js';
export { saveInvoice, getInvoices } from './invoices.js';
export { logAuditEvent } from './audit.js';
export { hasSupabase, getSupabaseClient, getSiteId, ensureTables } from './supabase.js';
export { getStripe } from './stripe-instance.js';
