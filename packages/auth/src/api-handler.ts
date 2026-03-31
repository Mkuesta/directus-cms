import { createClient } from '@supabase/supabase-js';
import type { AuthConfig } from './types.js';
import { getProfile, createProfile } from './profiles.js';

function buildCookieHeader(
  name: string,
  value: string,
  maxAge: number,
  config: AuthConfig,
): string {
  const opts = config.cookieOptions ?? {};
  const secure = opts.secure !== false;
  const sameSite = opts.sameSite ?? 'lax';
  const path = opts.path ?? '/';

  let cookie = `${name}=${value}; HttpOnly; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  if (secure) cookie += '; Secure';
  if (opts.domain) cookie += `; Domain=${opts.domain}`;
  return cookie;
}

function clearCookieHeader(name: string, config: AuthConfig): string {
  const path = config.cookieOptions?.path ?? '/';
  let cookie = `${name}=; HttpOnly; Path=${path}; Max-Age=0`;
  if (config.cookieOptions?.secure !== false) cookie += '; Secure';
  if (config.cookieOptions?.domain) cookie += `; Domain=${config.cookieOptions.domain}`;
  return cookie;
}

export function createAuthCallbackHandler(config: AuthConfig) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // GET /auth/session — return session from cookies
    if (pathname.endsWith('/auth/session') && request.method === 'GET') {
      return handleSessionRoute(request, config);
    }

    // POST /auth/signout — revoke session and clear cookies
    if (pathname.endsWith('/auth/signout') && request.method === 'POST') {
      return handleSignOutRoute(request, config);
    }

    const code = url.searchParams.get('code');

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return new Response(JSON.stringify({ error: error?.message || 'Failed to exchange code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ensure Directus profile exists
    const existingProfile = await getProfile(config, data.user.id);
    if (!existingProfile) {
      await createProfile(config, {
        supabaseUid: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.full_name || null,
      });
    }

    // Set tokens in httpOnly cookies instead of URL params
    // Validate redirect is same-origin to prevent open redirect
    const redirectUrl = config.authCallbackUrl ?? '/';
    const redirectTarget = new URL(redirectUrl, url.origin);
    if (redirectTarget.origin !== url.origin) {
      return new Response(JSON.stringify({ error: 'Invalid redirect URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = new Headers();
    headers.append('Location', redirectTarget.toString());
    headers.append('Set-Cookie', buildCookieHeader('sb-access-token', data.session.access_token, 3600, config));
    headers.append('Set-Cookie', buildCookieHeader('sb-refresh-token', data.session.refresh_token, 604800, config));

    return new Response(null, { status: 302, headers });
  };
}

function parseCookies(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    }),
  );
}

async function handleSignOutRoute(request: Request, config: AuthConfig): Promise<Response> {
  const cookies = parseCookies(request);
  const accessToken = cookies['sb-access-token'];

  // Revoke session with Supabase if we have a token
  if (accessToken) {
    try {
      const supabase = config.supabaseServiceRoleKey
        ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey)
        : createClient(config.supabaseUrl, config.supabaseAnonKey);

      if (config.supabaseServiceRoleKey) {
        await supabase.auth.admin.signOut(accessToken);
      }
    } catch {
      // Best-effort revocation — still clear cookies
    }
  }

  // Clear auth cookies
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', clearCookieHeader('sb-access-token', config));
  headers.append('Set-Cookie', clearCookieHeader('sb-refresh-token', config));

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}

async function handleSessionRoute(request: Request, config: AuthConfig): Promise<Response> {
  const cookies = parseCookies(request);
  const accessToken = cookies['sb-access-token'];
  if (!accessToken) {
    return new Response(JSON.stringify({ session: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return new Response(JSON.stringify({ session: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      session: {
        user: { id: data.user.id, email: data.user.email },
        expiresAt: null,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}
