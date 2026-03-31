import { createClient } from '@supabase/supabase-js';
import type { AuthConfig, AuthMiddlewareOptions } from './types.js';

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

function extractToken(request: Request): string | undefined {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  // Fall back to cookie if no Authorization header
  if (!token) {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
    if (match) token = match[1];
  }

  return token || undefined;
}

function normalizeOptions(input: string[] | AuthMiddlewareOptions): AuthMiddlewareOptions {
  if (Array.isArray(input)) {
    return { protectedPaths: input };
  }
  return input;
}

export function createAuthMiddleware(
  config: AuthConfig,
  options: string[] | AuthMiddlewareOptions,
) {
  const opts = normalizeOptions(options);
  const loginPath = opts.loginPath ?? '/login';
  const defaultRedirect = opts.defaultRedirect ?? '/';
  const mode = opts.onUnauthenticated ?? 'redirect';

  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    const isProtected = matchesPath(url.pathname, opts.protectedPaths);
    const isPublicOnly = opts.publicOnlyPaths
      ? matchesPath(url.pathname, opts.publicOnlyPaths)
      : false;

    // If path is neither protected nor public-only, pass through
    if (!isProtected && !isPublicOnly) return null;

    const token = extractToken(request);

    // Validate token if present
    let hasValidSession = false;
    if (token) {
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data, error } = await supabase.auth.getUser(token);
      hasValidSession = !error && !!data.user;
    }

    // Protected path + no valid session → redirect to login or 401
    if (isProtected && !hasValidSession) {
      if (mode === 'unauthorized') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const redirectUrl = new URL(loginPath, url.origin);
      redirectUrl.searchParams.set('redirect', url.pathname);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    // Public-only path + valid session → redirect away (e.g. login page when already logged in)
    if (isPublicOnly && hasValidSession) {
      return Response.redirect(new URL(defaultRedirect, url.origin).toString(), 302);
    }

    return null;
  };
}
