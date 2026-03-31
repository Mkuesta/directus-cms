import type { NewsletterConfig, SubscribeOptions } from './types';
import { subscribe, confirmSubscription, unsubscribe } from './subscribers';

/**
 * Creates a Next.js API route handler for newsletter operations.
 *
 * Usage:
 *   // app/api/newsletter/route.ts
 *   import { newsletter } from '@/lib/newsletter';
 *   const handler = newsletter.createApiHandler();
 *   export const POST = handler;
 *   export const GET = handler;
 */
export function createApiHandler(config: NewsletterConfig) {
  return async (request: Request): Promise<Response> => {
    // GET: handle confirmation link clicks (e.g. ?action=confirm&token=xxx)
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      const token = url.searchParams.get('token');

      if (action === 'confirm' && token) {
        const result = await confirmSubscription(config, token);
        if (result.success) {
          return new Response(JSON.stringify({ success: true, message: 'Subscription confirmed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const { action } = body as Record<string, any>;

      if (!action || typeof action !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const honeypotField = config.honeypotField ?? '_hp_field';

      switch (action) {
        case 'subscribe': {
          const { email, name, source } = body;
          if (!email || typeof email !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing email' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const options: SubscribeOptions = {
            email,
            name,
            source,
            ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              ?? request.headers.get('x-real-ip')
              ?? undefined,
            honeypotValue: body[honeypotField],
          };

          const result = await subscribe(config, options);

          if (!result.success) {
            const statusCode = result.error === 'rate_limited' ? 429 : 400;
            return new Response(JSON.stringify(result), {
              status: statusCode,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        case 'confirm': {
          const { token } = body;
          if (!token || typeof token !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing token' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const result = await confirmSubscription(config, token);
          if (!result.success) {
            return new Response(JSON.stringify(result), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ success: true, message: 'Subscription confirmed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        case 'unsubscribe': {
          const { email, token } = body;
          if (!email || typeof email !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing email' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          // SECURITY: Require token to prevent unauthorized unsubscription
          if (!token || typeof token !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing unsubscribe token' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const result = await unsubscribe(config, email, token);
          if (!result.success) {
            return new Response(JSON.stringify(result), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ success: true, message: 'Unsubscribed successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        default:
          return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
