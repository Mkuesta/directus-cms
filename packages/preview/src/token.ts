const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' };

async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    ALGORITHM,
    false,
    ['sign', 'verify'],
  );
}

/**
 * Generate an HMAC-signed preview token.
 */
export async function generateToken(
  secret: string,
  path: string,
  expiresAt: number,
): Promise<string> {
  const key = await getKey(secret);
  const message = `${path}:${expiresAt}`;
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(ALGORITHM, key, encoder.encode(message));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${sigHex}:${expiresAt}`;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Verify a preview token's HMAC signature and expiry.
 * Uses crypto.subtle.verify for constant-time comparison.
 */
export async function verifyToken(
  secret: string,
  path: string,
  token: string,
): Promise<boolean> {
  const parts = token.split(':');
  if (parts.length < 2) return false;

  const expiresAt = parseInt(parts[parts.length - 1], 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const sigHex = parts.slice(0, -1).join(':');
  if (sigHex.length % 2 !== 0) return false;

  try {
    const key = await getKey(secret);
    const message = `${path}:${expiresAt}`;
    const encoder = new TextEncoder();
    const sigBytes = hexToBytes(sigHex);
    return crypto.subtle.verify(ALGORITHM, key, sigBytes.buffer as ArrayBuffer, encoder.encode(message));
  } catch {
    return false;
  }
}
