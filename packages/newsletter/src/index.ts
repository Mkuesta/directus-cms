import type { NewsletterConfig, NewsletterClient } from './types';
import { subscribe, confirmSubscription, unsubscribe, getSubscribers } from './subscribers';
import { createApiHandler } from './api-handler';

/**
 * Creates a newsletter client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const newsletter = createNewsletterClient({
 *     directus,
 *     collections: { subscribers: `${PREFIX}_subscribers` },
 *     doubleOptIn: true,
 *     confirmationUrl: 'https://example.com/api/newsletter',
 *     emailClient: email, // optional, from @directus-cms/email
 *   });
 *   await newsletter.subscribe({ email: 'user@example.com', source: 'homepage' });
 */
export function createNewsletterClient(config: NewsletterConfig): NewsletterClient {
  return {
    config,
    subscribe: (options) => subscribe(config, options),
    confirmSubscription: (token) => confirmSubscription(config, token),
    unsubscribe: (email) => unsubscribe(config, email),
    getSubscribers: (options) => getSubscribers(config, options),
    createApiHandler: () => createApiHandler(config),
  };
}

// Re-export all types
export type {
  NewsletterConfig,
  NewsletterCollections,
  NewsletterClient,
  EmailClientLike,
  DirectusSubscriber,
  Subscriber,
  SubscribeOptions,
  SubscribeResult,
} from './types';

// Re-export standalone functions
export { subscribe, confirmSubscription, unsubscribe, getSubscribers } from './subscribers';
export { createApiHandler } from './api-handler';
export { checkHoneypot, checkRateLimit } from './spam-protection';
