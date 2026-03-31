import type { PreviewConfig } from './types.js';
import { verifyToken } from './token.js';

/**
 * Create a Next.js route handler for enabling preview mode.
 * GET /api/preview?path=/blog/my-post&token=xxx
 */
export function createPreviewApiHandler(config: PreviewConfig) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const token = url.searchParams.get('token');

    if (!path || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing path or token parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Reject absolute URLs / protocol-relative URLs to prevent open redirect
    if (!path.startsWith('/') || path.startsWith('//')) {
      return new Response(
        JSON.stringify({ error: 'Invalid path — must be a relative URL starting with /' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const valid = await verifyToken(config.previewSecret, path, token);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired preview token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Import Next.js draftMode dynamically to avoid issues at build time
    const { draftMode } = await import('next/headers');
    const draft = await draftMode();
    draft.enable();

    // Redirect to the preview path
    return new Response(null, {
      status: 307,
      headers: { Location: path },
    });
  };
}

/**
 * Create a Next.js route handler for exiting preview mode.
 * GET /api/preview/exit
 */
export function createExitPreviewHandler(config: PreviewConfig) {
  return async (_request: Request): Promise<Response> => {
    const { draftMode } = await import('next/headers');
    const draft = await draftMode();
    draft.disable();

    return new Response(null, {
      status: 307,
      headers: { Location: config.defaultRedirect || '/' },
    });
  };
}
