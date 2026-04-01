import { NextRequest } from 'next/server';

/**
 * Internal API key for server-to-server communication
 * Used by webhooks to call internal endpoints securely
 */
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * Verify that a request is from an internal source (webhook, etc.)
 */
export function verifyInternalRequest(request: NextRequest): boolean {
  // Check for internal API key header
  const apiKey = request.headers.get('x-internal-key');
  if (apiKey && INTERNAL_API_KEY && apiKey === INTERNAL_API_KEY) {
    return true;
  }

  return false;
}

/**
 * Verify that a request originates from our own domain
 */
export function verifyOrigin(request: NextRequest): boolean {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests from our own domain
  if (origin && baseUrl && origin.startsWith(baseUrl)) {
    return true;
  }

  if (referer && baseUrl && referer.startsWith(baseUrl)) {
    return true;
  }

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    if (origin?.includes('localhost') || referer?.includes('localhost')) {
      return true;
    }
  }

  return false;
}

/**
 * Check if request is authorized (internal OR same-origin)
 */
export function isAuthorizedRequest(request: NextRequest): boolean {
  return verifyInternalRequest(request) || verifyOrigin(request);
}

/**
 * Verify Stripe webhook signature is present
 * (Actual verification is done by Stripe SDK)
 */
export function hasStripeSignature(request: NextRequest): boolean {
  return !!request.headers.get('stripe-signature');
}

/**
 * Generate security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * Content Security Policy for the application
 */
export function getCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://static.hotjar.com https://www.clarity.ms",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co https://cms.drlogist.com https://www.google-analytics.com https://analytics.google.com https://*.hotjar.com https://*.hotjar.io https://www.clarity.ms",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  return directives.join('; ');
}
