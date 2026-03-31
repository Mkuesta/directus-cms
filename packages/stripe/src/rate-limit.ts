/**
 * In-memory rate limiter per IP address.
 * Returns structured results with remaining count and reset time.
 * Includes periodic cleanup of expired entries to prevent memory leaks.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  /** Whether the request should be blocked */
  blocked: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Timestamp (ms) when the window resets */
  resetAt: number;
}

const _store = new Map<string, RateLimitEntry>();
let _lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000; // 60 seconds

/**
 * Default rate limit presets for common operations.
 */
export const DEFAULT_RATE_LIMITS = {
  checkout: { limit: 10, windowMs: 60_000 },
  download: { limit: 20, windowMs: 60_000 },
  orderLookup: { limit: 20, windowMs: 60_000 },
} as const;

/**
 * Lazily clean up expired entries from the rate limit store.
 * Runs at most once every CLEANUP_INTERVAL (60s).
 */
function cleanupExpired(): void {
  const now = Date.now();
  if (now - _lastCleanup < CLEANUP_INTERVAL) return;
  _lastCleanup = now;

  for (const [key, entry] of _store) {
    if (now >= entry.resetAt) {
      _store.delete(key);
    }
  }
}

/**
 * Check if a request is rate-limited.
 * Returns a structured result with blocked status, remaining count, and reset time.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const entry = _store.get(identifier);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    _store.set(identifier, { count: 1, resetAt });
    return { blocked: false, remaining: maxRequests - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  if (entry.count > maxRequests) {
    return { blocked: true, remaining: 0, resetAt: entry.resetAt };
  }

  return { blocked: false, remaining, resetAt: entry.resetAt };
}

/**
 * Create a 429 Too Many Requests response with Retry-After header.
 */
export function rateLimitResponse(resetAt: number): Response {
  const retryAfterSecs = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfterSecs),
    },
  });
}

/**
 * Extract a client identifier from a Request for rate limiting.
 * Uses x-forwarded-for, x-real-ip, or falls back to a generic key.
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}
