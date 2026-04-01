# Security Audit Report - Falwo.fr

**Audit Date:** 2026-01-30
**Auditor:** SAST Security Scanner
**Project:** Falwo.fr (Contract Cancellation SaaS)
**Stack:** Next.js 15 + React 19 + TypeScript + Supabase + Stripe

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1 | Requires immediate attention |
| HIGH | 3 | Fix within 1 week |
| MEDIUM | 5 | Fix within 1 month |
| LOW | 4 | Scheduled maintenance |

**Overall Risk Score:** 45/100 (Medium)

---

## Table of Contents

1. [Critical Findings](#critical-findings)
2. [High Severity Findings](#high-severity-findings)
3. [Medium Severity Findings](#medium-severity-findings)
4. [Low Severity Findings](#low-severity-findings)
5. [Security Strengths](#security-strengths)
6. [Implementation Guide](#implementation-guide)
7. [Recommended Security Roadmap](#recommended-security-roadmap)

---

## Critical Findings

### SEC-001: Missing Authentication on Document Generation API

**Location:** `app/api/generate/route.ts:22-24`
**CWE:** CWE-306 (Missing Authentication for Critical Function)
**OWASP:** A01:2021-Broken Access Control
**CVSS Score:** 8.6 (High)

#### Vulnerable Code

```typescript
export async function POST(request: NextRequest) {
  const { orderId } = await request.json();
  // No authentication check - anyone can trigger document generation
```

#### Risk Assessment

- **Attack Vector:** Any attacker with a valid or guessed `orderId` can trigger document generation
- **Impact:**
  - Resource exhaustion (Gotenberg PDF service)
  - Potential access to order details via response
  - Ability to regenerate documents for orders they don't own
  - Cost implications (PDF generation resources)

#### Recommended Fix

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Option 1: Internal API key for webhook calls
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(request: NextRequest) {
  // Verify internal API key for automated calls
  const authHeader = request.headers.get('x-internal-key');
  const isInternalCall = authHeader === INTERNAL_API_KEY;

  // Verify origin for security
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const isValidOrigin = origin?.includes(process.env.NEXT_PUBLIC_BASE_URL || '') ||
                        referer?.includes(process.env.NEXT_PUBLIC_BASE_URL || '');

  if (!isInternalCall && !isValidOrigin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Continue with existing logic...
}
```

```typescript
// Update webhook to use internal key
// app/api/webhooks/stripe/route.ts
const generateResponse = await fetch(`${baseUrl}/api/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-key': process.env.INTERNAL_API_KEY!,
  },
  body: JSON.stringify({ orderId: order.id }),
});
```

---

## High Severity Findings

### SEC-002: IDOR Vulnerability in Order Lookup

**Location:** `app/api/order/[sessionId]/route.ts:23-47`
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
**OWASP:** A01:2021-Broken Access Control
**CVSS Score:** 7.5 (High)

#### Vulnerable Code

```typescript
const { data: order } = await supabaseAdmin
  .from('orders')
  .select(`
    order_number,
    status,
    company_name,
    customer_name,
    customer_email,  // PII exposed
    generated_pdf_path,
    generated_pdf_url,
    ...
  `)
  .eq('stripe_session_id', sessionId)
  .single();
```

#### Risk Assessment

- Stripe session IDs can be leaked via browser history, logs, or shared URLs
- Exposes customer PII (name, email) to anyone with session ID
- Provides 24-hour signed URL access to generated documents

#### Recommended Fix

```typescript
// Option 1: Time-limited access with additional verification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  // Require email verification parameter
  const searchParams = request.nextUrl.searchParams;
  const verifyEmail = searchParams.get('email');

  if (!verifyEmail) {
    return NextResponse.json(
      { error: 'Email verification required' },
      { status: 400 }
    );
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('order_number, status, company_name, customer_email, generated_pdf_path')
    .eq('stripe_session_id', sessionId)
    .eq('customer_email', verifyEmail.toLowerCase()) // Verify ownership
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Return limited data
  return NextResponse.json({
    orderNumber: order.order_number,
    status: order.status,
    companyName: order.company_name,
    pdfReady: !!order.generated_pdf_path,
    // Generate short-lived URL only
    pdfDownloadUrl: order.generated_pdf_path
      ? await getShortLivedUrl(order.generated_pdf_path, 3600) // 1 hour
      : null,
  });
}
```

---

### SEC-003: Missing Input Validation on API Endpoints

**Location:** `app/api/checkout/route.ts:7-22`
**CWE:** CWE-20 (Improper Input Validation)
**OWASP:** A03:2021-Injection
**CVSS Score:** 7.3 (High)

#### Vulnerable Code

```typescript
const body = await request.json();
const {
  packageType,
  providerName,
  customerEmail,
  customerName,
  formData,
  signatureDataUrl,  // No size limit - potential DoS
  // ...
} = body;
```

#### Risk Assessment

- No email format validation
- No size limits on signature data (base64 can be megabytes)
- Arbitrary data stored in `formData` without sanitization
- Type coercion vulnerabilities

#### Recommended Fix

Create a validation schema file:

```typescript
// lib/validations/checkout.ts
import { z } from 'zod';

// Base64 PNG signature - max ~500KB decoded
const MAX_SIGNATURE_SIZE = 700000; // ~500KB base64 encoded

export const CustomerAddressSchema = z.object({
  address: z.string().min(1).max(200),
  postal_code: z.string().regex(/^\d{5}$/, 'Invalid French postal code'),
  city: z.string().min(1).max(100),
  country: z.string().default('France'),
});

export const CancellationAddressSchema = z.object({
  department: z.string().max(100).optional(),
  address: z.string().min(1).max(200),
  postal_code: z.string().min(1).max(20),
  city: z.string().min(1).max(100),
  country: z.string().default('France'),
});

export const FormDataSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  street: z.string().min(1).max(200),
  houseNumber: z.string().max(20).optional(),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
  city: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{8})$/).optional(),
  customerNumber: z.string().max(50).optional(),
  contractType: z.string().max(100).optional(),
  cancellationDate: z.string().datetime().optional().nullable(),
  signatureDataUrl: z.string()
    .max(MAX_SIGNATURE_SIZE, 'Signature too large')
    .regex(/^data:image\/png;base64,/, 'Invalid signature format')
    .optional(),
});

export const CheckoutRequestSchema = z.object({
  packageType: z.enum(['standard', 'security']),
  providerName: z.string().min(1).max(200),
  providerSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  customerEmail: z.string().email().max(254),
  customerName: z.string().min(1).max(200).optional(),
  customerPhone: z.string().max(20).optional(),
  customerAddress: CustomerAddressSchema.optional(),
  formData: FormDataSchema,
  signatureDataUrl: z.string()
    .max(MAX_SIGNATURE_SIZE)
    .regex(/^data:image\/png;base64,/)
    .optional(),
  companyId: z.string().max(100).optional(),
  cancellationAddress: CancellationAddressSchema.optional(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
```

Update the checkout route:

```typescript
// app/api/checkout/route.ts
import { CheckoutRequestSchema } from '@/lib/validations/checkout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = CheckoutRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    // Continue with validated data...
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

---

### SEC-004: PII in Third-Party Metadata

**Location:** `app/api/checkout/route.ts:58-64`
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)
**GDPR:** Article 5 (Data Minimization)
**CVSS Score:** 5.3 (Medium-High)

#### Vulnerable Code

```typescript
metadata: {
  providerName,
  providerSlug,
  packageType,
  customerName,  // PII stored in Stripe
  companyId: companyId || providerSlug,
},
```

#### Risk Assessment

- Customer names stored in Stripe's systems
- May violate GDPR data minimization principles
- Third-party data breach could expose customer PII

#### Recommended Fix

```typescript
// Only store non-PII identifiers
metadata: {
  providerSlug,
  packageType,
  // Reference to your database - retrieve PII when needed
  orderId: order.id,  // Add after order creation
},
```

---

## Medium Severity Findings

### SEC-005: Hardcoded Fallback Values

**Location:** `lib/supabase.ts:5-7`
**CWE:** CWE-798 (Use of Hard-coded Credentials)
**CVSS Score:** 5.0 (Medium)

#### Vulnerable Code

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
```

#### Recommended Fix

```typescript
// lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail fast in non-build environments
if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not set');
  }
}

// For server-side, always require
if (process.env.NODE_ENV === 'production' && !supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required in production');
}
```

---

### SEC-006: Missing Rate Limiting

**Location:** All API routes
**CWE:** CWE-770 (Allocation of Resources Without Limits)
**OWASP:** A04:2021-Insecure Design
**CVSS Score:** 5.3 (Medium)

#### Recommended Fix

Create rate limiting middleware:

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number;  // Time window in ms
  uniqueTokenPerInterval: number;  // Max users per interval
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: (limit: number, token: string): Promise<{ success: boolean; remaining: number }> =>
      new Promise((resolve) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        if (!isRateLimited) {
          tokenCache.set(token, [currentUsage + 1]);
        }

        resolve({
          success: !isRateLimited,
          remaining: Math.max(0, limit - currentUsage - 1),
        });
      }),
  };
}

// Usage in API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success, remaining } = await limiter.check(10, ip); // 10 requests per minute

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': '60',
        }
      }
    );
  }
  // Continue...
}
```

---

### SEC-007: Missing Security Headers

**Location:** `middleware.ts`
**CWE:** CWE-693 (Protection Mechanism Failure)
**OWASP:** A05:2021-Security Misconfiguration
**CVSS Score:** 4.3 (Medium)

#### Current Code

```typescript
export function middleware(_request: NextRequest) {
  return NextResponse.next(); // Does nothing
}
```

#### Recommended Fix

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### SEC-008: Verbose Error Logging

**Location:** Multiple API routes
**CWE:** CWE-209 (Information Exposure Through Error Messages)
**CVSS Score:** 3.7 (Low-Medium)

#### Vulnerable Code

```typescript
console.error('Stripe checkout error:', error);
console.error('Failed to create order in database:', orderError);
```

#### Recommended Fix

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Don't log stack traces in production
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    };
  }
  return { error: String(error) };
}

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level: 'error',
    message,
    context: {
      ...context,
      ...(error && { error: sanitizeError(error) }),
    },
    timestamp: new Date().toISOString(),
  };

  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to your logging service (e.g., Sentry, LogRocket, etc.)
    console.error(JSON.stringify(entry));
  } else {
    console.error(entry);
  }
}

// Usage
logError('Stripe checkout failed', error, { sessionId: session.id });
```

---

### SEC-009: Missing CSRF Protection

**Location:** All POST API routes
**CWE:** CWE-352 (Cross-Site Request Forgery)
**OWASP:** A01:2021-Broken Access Control
**CVSS Score:** 4.3 (Medium)

#### Recommended Fix

```typescript
// lib/csrf.ts
import { cookies } from 'next/headers';
import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString('hex');
const CSRF_COOKIE_NAME = '__csrf';

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex');
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
  return `${token}.${signature}`;
}

export function validateCsrfToken(token: string): boolean {
  const [value, signature] = token.split('.');
  if (!value || !signature) return false;

  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(value)
    .digest('hex');

  return signature === expectedSignature;
}

// Middleware integration
export async function verifyCsrf(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const csrfHeader = request.headers.get('x-csrf-token');

  if (!csrfCookie || !csrfHeader) return false;
  return csrfCookie === csrfHeader && validateCsrfToken(csrfHeader);
}
```

---

## Low Severity Findings

### SEC-010: Long-Lived Signed URLs

**Location:** `app/api/order/[sessionId]/route.ts:61`
**CVSS Score:** 2.4 (Low)

```typescript
.createSignedUrl(order.generated_pdf_path, 60 * 60 * 24); // 24 hours
```

**Recommendation:** Reduce to 1-2 hours for sensitive documents.

---

### SEC-011: Development IP in Production Config

**Location:** `next.config.ts:28-29`
**CVSS Score:** 2.0 (Low)

```typescript
{ protocol: 'http' as const, hostname: '209.38.216.215' },
```

**Recommendation:** Ensure development entries are properly gated.

---

### SEC-012: Unused Middleware Configuration

**Location:** `middleware.ts`
**CVSS Score:** 1.0 (Informational)

The middleware is configured but doesn't implement any security controls.

---

### SEC-013: Missing Subresource Integrity

**CVSS Score:** 2.0 (Low)

External scripts (Stripe) should use SRI hashes when possible.

---

## Security Strengths

| Area | Implementation | Status |
|------|----------------|--------|
| Stripe Webhook Verification | `stripe.webhooks.constructEvent()` | Properly implemented |
| XSS Prevention | DOMPurify sanitization | Properly implemented |
| SQL Injection | Supabase SDK parameterization | Protected |
| Secret Management | `.env` files in `.gitignore` | Properly configured |
| SVG Security | CSP for images in next.config | Implemented |
| Command Injection | No shell execution | Not applicable |
| Audit Logging | Comprehensive audit trail | Implemented |
| Type Safety | Full TypeScript | Implemented |

---

## Implementation Guide

### Phase 1: Critical & High Priority (Week 1)

1. **Add authentication to `/api/generate`**
   - Create `INTERNAL_API_KEY` environment variable
   - Update webhook to include key
   - Add origin verification

2. **Implement Zod validation**
   - Create `lib/validations/` directory
   - Add schemas for all API inputs
   - Update all API routes

3. **Fix IDOR in order lookup**
   - Add email verification parameter
   - Reduce exposed fields

### Phase 2: Medium Priority (Week 2-4)

4. **Add security headers in middleware**
   - CSP, X-Frame-Options, etc.

5. **Implement rate limiting**
   - Add to checkout and generate endpoints

6. **Remove PII from Stripe metadata**

7. **Add structured logging**

### Phase 3: Hardening (Month 2)

8. **CSRF protection**
9. **Reduce signed URL expiration**
10. **Security monitoring/alerting**

---

## Recommended Security Roadmap

### Immediate Actions
- [ ] SEC-001: Add authentication to generate endpoint
- [ ] SEC-003: Implement input validation
- [ ] SEC-002: Fix IDOR vulnerability

### Short-term (30 days)
- [ ] SEC-006: Add rate limiting
- [ ] SEC-007: Implement security headers
- [ ] SEC-008: Add structured logging
- [ ] SEC-004: Remove PII from Stripe metadata

### Medium-term (90 days)
- [ ] SEC-009: CSRF protection
- [ ] SEC-005: Remove hardcoded fallbacks
- [ ] Implement security monitoring (Sentry, etc.)
- [ ] Add dependency vulnerability scanning to CI/CD

### Long-term
- [ ] Web Application Firewall (WAF)
- [ ] Penetration testing
- [ ] Security awareness training
- [ ] Regular security audits

---

## Environment Variables to Add

```bash
# Add to .env.example and .env.local

# Security
INTERNAL_API_KEY=          # Generate with: openssl rand -hex 32
CSRF_SECRET=               # Generate with: openssl rand -hex 32

# Optional: Logging service
SENTRY_DSN=
```

---

## Testing Security Fixes

```bash
# Test rate limiting
for i in {1..20}; do curl -X POST http://localhost:3000/api/checkout; done

# Test CSRF
curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d '{"orderId":"test"}'
# Should return 401 without proper headers

# Test input validation
curl -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"packageType":"invalid"}'
# Should return 400 with validation errors
```

---

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Stripe Security Guide](https://stripe.com/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

*This document should be reviewed and updated after each security audit or significant code change.*
