import type { RestClient } from '@directus/sdk';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface CurrencyConfig {
  /** Default currency code (default: 'usd') */
  defaultCurrency: string;
  /** Supported currency codes */
  supported: string[];
  /** Exchange rate API URL (default: frankfurter.app) */
  exchangeRateApiUrl?: string;
  /** Cache TTL for exchange rates in ms (default: 3_600_000 = 1h) */
  exchangeRateCacheTtl?: number;
}

export interface DownloadConfig {
  /** Secret key for signing download JWTs */
  jwtSecret: string;
  /** Token expiry (default: '30d') */
  tokenExpiry?: string;
  /** Max downloads per purchase (default: 10) */
  maxDownloads?: number;
  /** Base URL for download links (e.g. 'https://example.com/api/download') */
  downloadBaseUrl: string;
}

export interface StripeFeatures {
  currencies?: CurrencyConfig;
  downloads?: DownloadConfig;
  subscriptions?: boolean;
  invoices?: boolean;
  auditLog?: boolean;
}

export interface StripeCollections {
  orders: string;
  /** Optional separate collection for order line items (relational, instead of JSON in orders) */
  orderItems?: string;
  products?: string;
}

export interface StripeConfig {
  // Stripe
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  publishableKey: string;
  successUrl: string;
  cancelUrl: string;

  // Supabase (for transactional data)
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  siteSlug?: string;

  // Directus (for product catalog + legacy orders)
  directus?: RestClient<any>;
  directusUrl?: string;
  collections?: StripeCollections;

  // Legacy compat: top-level currency and siteId
  currency?: string;
  siteId?: number;
  siteName?: string;

  // Features (opt-in)
  features?: StripeFeatures;

  // Rate limiting
  rateLimit?: number;
  rateLimitWindow?: number;

  // Callbacks
  onOrderStatusChange?: (orderId: number, status: OrderStatus, order: Order) => void | Promise<void>;
  onPurchaseComplete?: (purchase: Purchase, order: CheckoutOrder) => void | Promise<void>;
  onSubscriptionChange?: (subscription: Subscription, event: string) => void | Promise<void>;
}

// ---------------------------------------------------------------------------
// Directus types (legacy order support)
// ---------------------------------------------------------------------------

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface DirectusOrder {
  id: number;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  customer_email: string;
  customer_name: string | null;
  status: OrderStatus;
  line_items: DirectusLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  site: number | null;
  metadata: Record<string, any> | null;
  date_created: string | null;
  date_updated: string | null;
}

export interface DirectusLineItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  product_id?: number;
  product_slug?: string;
  file_url?: string;
}

/** Row in the {prefix}_order_items collection (relational, optional) */
export interface DirectusOrderItem {
  id: number;
  order: number;
  product_slug: string;
  product_title: string;
  product_price: number;
  quantity: number;
  file_url?: string;
  download_url?: string;
  date_created?: string;
}

export interface Order {
  id: number;
  stripeSessionId: string;
  stripePaymentIntent: string | null;
  customerEmail: string;
  customerName: string | null;
  status: OrderStatus;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  metadata: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  productId?: number;
  productSlug?: string;
  fileUrl?: string;
}

/** Transformed order item (from relational {prefix}_order_items collection) */
export interface OrderItem {
  id: number;
  orderId: number;
  productSlug: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
  fileUrl?: string;
  downloadUrl?: string;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// Supabase types (new transactional data)
// ---------------------------------------------------------------------------

export interface Customer {
  id: string;
  siteId: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  siteId: string;
  customerId: string | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  productSlug: string;
  productName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  status: string;
  downloadCount: number;
  maxDownloads: number;
  downloadExpiresAt: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseResult {
  purchase: Purchase;
  isNew: boolean;
}

export interface Subscription {
  id: string;
  siteId: string;
  customerId: string | null;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  planName: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  siteId: string;
  customerId: string | null;
  subscriptionId: string | null;
  stripeInvoiceId: string;
  invoiceNumber: string | null;
  amountDue: number | null;
  amountPaid: number | null;
  currency: string | null;
  status: string | null;
  invoicePdfUrl: string | null;
  hostedInvoiceUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  siteId: string;
  customerId: string | null;
  eventType: string;
  eventData: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Billing + checkout types
// ---------------------------------------------------------------------------

export interface BillingDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string;
  company?: string;
}

export interface CheckoutItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  productId?: number;
  productSlug?: string;
}

export interface CreateCheckoutOptions {
  items: CheckoutItem[];
  customerEmail?: string;
  metadata?: Record<string, string>;
  billingDetails?: BillingDetails;
  currency?: string;
  mode?: 'payment' | 'subscription';
  priceId?: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

export interface CheckoutOrder {
  sessionId: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  items: CheckoutItem[];
  billingDetails?: BillingDetails;
  downloadUrls?: Record<string, string>;
}

export interface GetOrdersOptions {
  status?: OrderStatus;
  customerEmail?: string;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Cart types
// ---------------------------------------------------------------------------

export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  productSlug?: string;
  metadata?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Exchange rates
// ---------------------------------------------------------------------------

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

export type { RateLimitResult } from './rate-limit.js';

// ---------------------------------------------------------------------------
// Client interface
// ---------------------------------------------------------------------------

export interface StripeClient {
  config: StripeConfig;

  // Checkout
  createCheckoutSession(options: CreateCheckoutOptions): Promise<CheckoutResult>;
  getCheckoutSessionStatus(sessionId: string): Promise<{ status: string; paymentStatus: string }>;

  // Directus orders (legacy)
  getOrder(id: number): Promise<Order | null>;
  getOrderBySessionId(sessionId: string): Promise<Order | null>;
  getOrders(options?: GetOrdersOptions): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Product sync
  syncProductToStripe(productId: number): Promise<{ stripeProductId: string; stripePriceId: string }>;

  // Webhook/API handlers
  handleStripeWebhook(request: Request): Promise<Response>;
  createCheckoutApiHandler(): (request: Request) => Promise<Response>;
  createStripeWebhookHandler(): (request: Request) => Promise<Response>;

  // Supabase-based purchases (available when supabaseUrl is configured)
  getPurchaseBySessionId?(sessionId: string): Promise<Purchase | null>;
  getPurchases?(email: string): Promise<Purchase[]>;

  // Customers (available when supabaseUrl is configured)
  getOrCreateCustomer?(email: string, name?: string): Promise<Customer>;

  // Subscriptions (available when features.subscriptions is enabled)
  getCustomerSubscription?(email: string): Promise<Subscription | null>;
  getSubscriptions?(email: string): Promise<Subscription[]>;

  // Invoices (available when features.invoices is enabled)
  getInvoices?(email: string): Promise<Invoice[]>;

  // Downloads (available when features.downloads is configured)
  generateDownloadToken?(purchaseId: string, productSlug: string): Promise<string>;
  createDownloadApiHandler?(): (request: Request) => Promise<Response>;
  createDownloadBySessionHandler?(): (request: Request) => Promise<Response>;

  // Exchange rates (available when features.currencies is configured)
  getExchangeRates?(base?: string): Promise<ExchangeRates>;
  convertCents?(amountCents: number, from: string, to: string): Promise<number>;
  createExchangeRateApiHandler?(): (request: Request) => Promise<Response>;
}
