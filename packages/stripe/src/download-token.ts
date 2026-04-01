import type { StripeConfig } from './types.js';

/**
 * Generate a signed JWT download token using jose.
 * Requires `jose` as an optional peer dependency.
 */
export async function generateDownloadToken(
  config: StripeConfig,
  purchaseId: string,
  productSlug: string,
): Promise<string> {
  const downloadConfig = config.features?.downloads;
  if (!downloadConfig) {
    throw new Error('@mkuesta/stripe: features.downloads must be configured to generate download tokens');
  }

  const { SignJWT } = await import('jose');
  const secret = new TextEncoder().encode(downloadConfig.jwtSecret);

  const expiryStr = downloadConfig.tokenExpiry || '30d';
  const token = await new SignJWT({
    purchaseId,
    productSlug,
    siteSlug: config.siteSlug,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiryStr)
    .sign(secret);

  return token;
}

/**
 * Verify a download token and extract its payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyDownloadToken(
  config: StripeConfig,
  token: string,
): Promise<{ purchaseId: string; productSlug: string; siteSlug: string } | null> {
  const downloadConfig = config.features?.downloads;
  if (!downloadConfig) return null;

  try {
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(downloadConfig.jwtSecret);

    const { payload } = await jwtVerify(token, secret);

    return {
      purchaseId: payload.purchaseId as string,
      productSlug: payload.productSlug as string,
      siteSlug: payload.siteSlug as string,
    };
  } catch {
    return null;
  }
}

/**
 * Build a full download URL for a given token.
 */
export function buildDownloadUrl(config: StripeConfig, token: string): string {
  const baseUrl = config.features?.downloads?.downloadBaseUrl;
  if (!baseUrl) throw new Error('@mkuesta/stripe: features.downloads.downloadBaseUrl is required');

  return `${baseUrl}?token=${encodeURIComponent(token)}`;
}
