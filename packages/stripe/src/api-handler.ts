import type { StripeConfig, CreateCheckoutOptions } from './types.js';
import { createCheckoutSession } from './checkout.js';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from './rate-limit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create a Next.js API route handler for checkout.
 * Supports rate limiting, billing details, and currency selection.
 *
 * Fix 8: Validates email format, currency against supported list,
 * mode values, and item structure.
 *
 * POST body: { items, customerEmail, metadata, billingDetails, currency, mode, priceId }
 */
export function createCheckoutApiHandler(config: StripeConfig) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    const maxRequests = config.rateLimit ?? 10;
    const windowMs = config.rateLimitWindow ?? 60_000;
    const clientId = getClientIdentifier(request);
    const rateResult = checkRateLimit(`checkout:${clientId}`, maxRequests, windowMs);

    if (rateResult.blocked) {
      return rateLimitResponse(rateResult.resetAt);
    }

    try {
      const body = await request.json();
      const { items, customerEmail, metadata, billingDetails, currency, mode, priceId } = body as Record<string, any>;

      // ---------- Fix 8: Input validation ----------

      // Items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response(JSON.stringify({ error: 'Items array is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      for (const item of items) {
        if (!item.name || typeof item.name !== 'string') {
          return new Response(JSON.stringify({ error: 'Each item must have a name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          return new Response(JSON.stringify({ error: 'Each item must have a positive quantity' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
          return new Response(JSON.stringify({ error: 'Each item must have a positive unitPrice' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Email
      if (customerEmail !== undefined && customerEmail !== null) {
        if (typeof customerEmail !== 'string' || !EMAIL_RE.test(customerEmail)) {
          return new Response(JSON.stringify({ error: 'Invalid email address' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Currency
      if (currency !== undefined) {
        if (typeof currency !== 'string' || currency.length < 3 || currency.length > 3) {
          return new Response(JSON.stringify({ error: 'Currency must be a 3-letter ISO code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (config.features?.currencies?.supported) {
          const supported = config.features.currencies.supported.map((c) => c.toLowerCase());
          if (!supported.includes(currency.toLowerCase())) {
            return new Response(JSON.stringify({ error: `Unsupported currency. Supported: ${supported.join(', ')}` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
      }

      // Mode
      if (mode !== undefined && mode !== 'payment' && mode !== 'subscription') {
        return new Response(JSON.stringify({ error: 'Mode must be "payment" or "subscription"' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Subscription mode requires priceId or items with recurring intent
      if (mode === 'subscription' && !priceId && items.length === 0) {
        return new Response(JSON.stringify({ error: 'Subscription mode requires priceId or items' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const options: CreateCheckoutOptions = {
        items,
        customerEmail,
        metadata,
        billingDetails,
        currency,
        mode,
        priceId,
      };

      const result = await createCheckoutSession(config, options);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error('[stripe-checkout]', err);
      return new Response(JSON.stringify({ error: 'Checkout failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
