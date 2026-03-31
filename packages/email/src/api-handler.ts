import type { EmailConfig, SendEmailOptions } from './types.js';
import { sendEmail } from './send.js';

// ── Rate limiting ───────────────────────────────────────────────────────────
// LIMITATION: In-memory rate limiting — ineffective on serverless (Vercel/Lambda).
// For production serverless, use Upstash Redis or Vercel Edge Config instead.
const emailAttempts = new Map<string, { count: number; resetAt: number }>();
const EMAIL_RATE_LIMIT = 10;
const EMAIL_RATE_WINDOW_MS = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of emailAttempts) {
    if (entry.resetAt <= now) emailAttempts.delete(ip);
  }
}, 60_000).unref?.();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
}

export interface EmailApiHandlerOptions {
  /** Secret key that must be sent in the Authorization header (Bearer <key>).
   *  Falls back to EMAIL_API_KEY env var if not provided. */
  apiKey?: string;
}

export function createEmailApiHandler(config: EmailConfig, options?: EmailApiHandlerOptions) {
  const apiKey = options?.apiKey || process.env.EMAIL_API_KEY;
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Auth check ────────────────────────────────────────────────────────
    if (apiKey) {
      const authHeader = request.headers.get('authorization') || '';
      const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      if (!bearer || bearer !== apiKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // SECURITY: Deny all requests when no API key is configured
      console.error('[email-api] No apiKey configured. Set EMAIL_API_KEY env var. Rejecting request.');
      return new Response(JSON.stringify({ error: 'Email API not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Rate limit ────────────────────────────────────────────────────────
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = emailAttempts.get(ip);
    if (entry && entry.resetAt > now) {
      if (entry.count >= EMAIL_RATE_LIMIT) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return new Response(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
        });
      }
      entry.count++;
    } else {
      emailAttempts.set(ip, { count: 1, resetAt: now + EMAIL_RATE_WINDOW_MS });
    }

    try {
      const body = await request.json();
      const { to, subject, templateSlug, variables, html, text, replyTo } = body as Record<string, any>;

      if (!to) {
        return new Response(JSON.stringify({ error: 'Missing "to" field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!templateSlug && !html && !text) {
        return new Response(JSON.stringify({ error: 'Must provide templateSlug, html, or text' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const options: SendEmailOptions = { to, subject, templateSlug, variables, html, text, replyTo };
      const result = await sendEmail(config, options);

      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
