import type { RestClient } from '@directus/sdk';

// ── NewsletterCollections: maps logical names to Directus collection names ──

export interface NewsletterCollections {
  /** Directus collection name for subscribers (e.g. "subscribers") */
  subscribers: string;
}

// ── EmailClient interface (optional dep on @mkuesta/email) ─────────────

export interface EmailClientLike {
  sendEmail(options: {
    to: string | string[];
    subject?: string;
    html?: string;
    text?: string;
  }): Promise<{ success: boolean; error?: string }>;
}

// ── NewsletterConfig: passed to createNewsletterClient() ────────────────────

export interface NewsletterConfig {
  /** A Directus SDK client instance (needs write access to subscribers collection) */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: NewsletterCollections;
  /** Multi-tenant site ID (optional, stored with each subscriber) */
  siteId?: number;
  /** Site name (optional, stored with each subscriber) */
  siteName?: string;
  /** Enable honeypot spam protection (default true) */
  honeypotEnabled?: boolean;
  /** Honeypot field name (default "_hp_field") */
  honeypotField?: string;
  /** Rate limit: max subscriptions per IP within window (default 5) */
  rateLimit?: number;
  /** Rate limit window in milliseconds (default 60000 = 1 minute) */
  rateLimitWindow?: number;
  /** Enable double opt-in (default true) */
  doubleOptIn?: boolean;
  /** URL users click to confirm their subscription. Token appended as query param. */
  confirmationUrl?: string;
  /** Optional email client for sending confirmation emails */
  emailClient?: EmailClientLike;
}

// ── Directus raw types ──────────────────────────────────────────────────────

export interface DirectusSubscriber {
  id?: number;
  email: string;
  name?: string | null;
  status: 'pending' | 'active' | 'unsubscribed';
  token: string;
  source?: string | null;
  ip?: string | null;
  site?: number | null;
  site_name?: string | null;
  date_created?: string | null;
  date_confirmed?: string | null;
}

// ── Transformed types (used by consumers) ───────────────────────────────────

export interface Subscriber {
  id: number;
  email: string;
  name?: string;
  status: 'pending' | 'active' | 'unsubscribed';
  source?: string;
  createdAt?: string;
  confirmedAt?: string;
}

export interface SubscribeOptions {
  /** Email address to subscribe */
  email: string;
  /** Subscriber's display name (optional) */
  name?: string;
  /** Where the subscription came from (e.g. "homepage", "blog-sidebar") */
  source?: string;
  /** Honeypot field value (should be empty if legit) */
  honeypotValue?: string;
  /** Visitor IP address (pass from request headers) */
  ip?: string;
}

export interface SubscribeResult {
  success: boolean;
  error?: 'spam_detected' | 'rate_limited' | 'already_subscribed' | 'subscription_failed';
}

// ── NewsletterClient: returned by createNewsletterClient() ──────────────────

export interface NewsletterClient {
  config: NewsletterConfig;
  /** Subscribe an email address */
  subscribe(options: SubscribeOptions): Promise<SubscribeResult>;
  /** Confirm a subscription using a double opt-in token */
  confirmSubscription(token: string): Promise<{ success: boolean; error?: string }>;
  /** Unsubscribe an email address */
  unsubscribe(email: string): Promise<{ success: boolean; error?: string }>;
  /** Get subscribers (for admin/review purposes) */
  getSubscribers(options?: { status?: string; limit?: number }): Promise<Subscriber[]>;
  /** Create a Next.js API route handler for newsletter operations */
  createApiHandler(): (request: Request) => Promise<Response>;
}
