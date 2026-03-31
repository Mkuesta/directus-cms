/**
 * Minimal JWT implementation using Web Crypto API (zero external deps).
 * Produces HS256 tokens compatible with any standard JWT verifier.
 */

const COOKIE_NAME = 'admin_session';
const TOKEN_LIFETIME_S = 60 * 60 * 24; // 24 hours

// ── Base64url helpers ────────────────────────────────────────────────────────

function base64url(input: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── HMAC helpers ─────────────────────────────────────────────────────────────

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

// ── JWT sign / verify ────────────────────────────────────────────────────────

export async function signToken(secret: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_S,
    }),
  );
  const data = `${header}.${payload}`;
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${base64url(sig)}`;
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const key = await getHmacKey(secret);
  const data = `${parts[0]}.${parts[1]}`;
  const signature = base64urlDecode(parts[2]);

  const valid = await crypto.subtle.verify('HMAC', key, signature.buffer as ArrayBuffer, new TextEncoder().encode(data));
  if (!valid) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
  } catch {
    return false;
  }

  return true;
}

// ── Cookie helpers (used by api-handler) ─────────────────────────────────────

export function sessionCookieOptions(maxAge = TOKEN_LIFETIME_S) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/admin',
    maxAge,
  };
}

export { COOKIE_NAME };
