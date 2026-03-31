import type { NewsletterConfig } from './types';

// LIMITATION: In-memory rate limiting — ineffective on serverless (Vercel/Lambda).
// State is not shared across instances and resets on cold start.
// For production serverless, use Upstash Redis or Vercel Edge Config instead.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkHoneypot(config: NewsletterConfig, honeypotValue: string | undefined): boolean {
  if (!(config.honeypotEnabled ?? true)) return true;
  // If honeypot field has a value, it's a bot
  return !honeypotValue;
}

export function checkRateLimit(config: NewsletterConfig, ip: string | undefined): boolean {
  if (!ip) return true;

  const limit = config.rateLimit ?? 5;
  const window = config.rateLimitWindow ?? 60_000;
  const now = Date.now();
  const key = ip;

  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > window) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }

  entry.count++;
  if (entry.count > limit) return false;
  return true;
}
