import type { StripeConfig, Purchase } from './types.js';
import { verifyDownloadToken } from './download-token.js';
import { getPurchaseBySessionId, incrementDownloadCount, isPurchaseValid } from './purchases.js';
import { getSupabaseClient } from './supabase.js';
import { logAuditEvent } from './audit.js';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from './rate-limit.js';

/**
 * Transform a raw Supabase row into a Purchase for validation.
 */
function rowToPurchase(raw: any): Purchase {
  return {
    id: raw.id,
    siteId: raw.site_id,
    customerId: raw.customer_id,
    stripeSessionId: raw.stripe_session_id,
    stripePaymentIntentId: raw.stripe_payment_intent_id,
    productSlug: raw.product_slug,
    productName: raw.product_name,
    customerEmail: raw.customer_email,
    amountCents: raw.amount_cents,
    currency: raw.currency,
    status: raw.status,
    downloadCount: raw.download_count,
    maxDownloads: raw.max_downloads,
    downloadExpiresAt: raw.download_expires_at,
    metadata: raw.metadata || {},
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Create a Next.js API handler for JWT-based secure file downloads.
 *
 * GET /api/download?token=<jwt>
 */
export function createDownloadApiHandler(
  config: StripeConfig,
  options?: {
    onDownload?: (purchase: { purchaseId: string; productSlug: string; siteSlug: string }) => Promise<Response>;
  },
) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit downloads
    const clientId = getClientIdentifier(request);
    const rateResult = checkRateLimit(`download:${clientId}`, 20, 60_000);
    if (rateResult.blocked) {
      return rateLimitResponse(rateResult.resetAt);
    }

    try {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');

      if (!token) {
        return new Response(JSON.stringify({ error: 'Missing download token' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Verify JWT
      const payload = await verifyDownloadToken(config, token);
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid or expired download token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Look up purchase
      const supabase = getSupabaseClient(config);
      const { data: raw } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', payload.purchaseId)
        .single();

      if (!raw) {
        return new Response(JSON.stringify({ error: 'Purchase not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const purchase = rowToPurchase(raw);
      const validity = isPurchaseValid(purchase);

      if (!validity.valid) {
        return new Response(JSON.stringify({ error: validity.reason }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Increment download count
      await incrementDownloadCount(config, payload.purchaseId);

      await logAuditEvent(config, 'download.accessed', {
        purchaseId: payload.purchaseId,
        productSlug: payload.productSlug,
        downloadCount: purchase.downloadCount + 1,
      });

      // Delegate file serving to consumer callback
      if (options?.onDownload) {
        return await options.onDownload(payload);
      }

      return new Response(
        JSON.stringify({
          purchaseId: payload.purchaseId,
          productSlug: payload.productSlug,
          verified: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: 'Download failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Fix 4: Download by session handler (used by success page polling)
// ---------------------------------------------------------------------------

/**
 * Create a Next.js API handler for session-based downloads.
 * Used by the post-purchase success page to poll for download availability.
 *
 * POST /api/download/by-session  { sessionId, format? }
 */
export function createDownloadBySessionHandler(
  config: StripeConfig,
  options?: {
    onDownload?: (purchase: Purchase, format?: string) => Promise<Response>;
  },
) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit
    const clientId = getClientIdentifier(request);
    const rateResult = checkRateLimit(`download-session:${clientId}`, 20, 60_000);
    if (rateResult.blocked) {
      return rateLimitResponse(rateResult.resetAt);
    }

    try {
      const body = await request.json();
      const { sessionId, customerEmail, format } = body as { sessionId?: string; customerEmail?: string; format?: string };

      if (!sessionId || typeof sessionId !== 'string') {
        return new Response(JSON.stringify({ error: 'sessionId is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // SECURITY: Require customerEmail to verify ownership
      if (!customerEmail || typeof customerEmail !== 'string') {
        return new Response(JSON.stringify({ error: 'customerEmail is required for verification' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Look up purchase by session
      const purchase = await getPurchaseBySessionId(config, sessionId);
      if (!purchase) {
        return new Response(JSON.stringify({ error: 'Purchase not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // SECURITY: Verify email matches the purchase
      if (purchase.customerEmail?.toLowerCase() !== customerEmail.toLowerCase()) {
        return new Response(JSON.stringify({ error: 'Email does not match purchase' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const validity = isPurchaseValid(purchase);
      if (!validity.valid) {
        return new Response(JSON.stringify({ error: validity.reason }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Increment download count
      await incrementDownloadCount(config, purchase.id);

      await logAuditEvent(config, 'download.by-session', {
        purchaseId: purchase.id,
        sessionId,
        productSlug: purchase.productSlug,
        format,
      });

      // Delegate file serving to consumer callback
      if (options?.onDownload) {
        return await options.onDownload(purchase, format);
      }

      return new Response(
        JSON.stringify({
          purchaseId: purchase.id,
          productSlug: purchase.productSlug,
          verified: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: 'Download failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
