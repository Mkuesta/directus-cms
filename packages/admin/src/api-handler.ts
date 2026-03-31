import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { readItems, readItem, updateItem, readSingleton, updateSingleton } from '@directus/sdk';
import { signToken, verifyToken, sessionCookieOptions, COOKIE_NAME } from './auth';
import type { AdminConfig } from './types';

// ── Login rate limiting ─────────────────────────────────────────────────────
// LIMITATION: In-memory rate limiting — ineffective on serverless (Vercel/Lambda).
// For production serverless, use Upstash Redis or Vercel Edge Config instead.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (entry.resetAt <= now) loginAttempts.delete(ip);
  }
}, 60_000).unref();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
}

function checkLoginRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }
    entry.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  return null;
}

// ── Upload limits ───────────────────────────────────────────────────────────
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
// SECURITY: SVG removed — can contain embedded JavaScript (XSS vector)
const ALLOWED_UPLOAD_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'application/pdf',
]);

// Magic bytes for validating actual file content (not just MIME type)
const FILE_SIGNATURES: Array<{ type: string; bytes: number[] }> = [
  { type: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { type: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47] },
  { type: 'image/gif', bytes: [0x47, 0x49, 0x46] },
  { type: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  { type: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
];

// ── Field whitelists for update handlers ────────────────────────────────────
const ARTICLE_FIELDS = new Set([
  'title', 'slug', 'excerpt', 'content', 'author', 'status', 'published_date',
  'featured_image', 'category', 'tags',
  'seo_title', 'seo_description', 'seo_keywords', 'meta_robots', 'canonical_url',
  'og_title', 'og_description', 'og_image', 'twitter_title', 'twitter_description',
]);

const PRODUCT_FIELDS = new Set([
  'title', 'slug', 'description', 'short_description', 'price', 'compare_at_price',
  'status', 'featured', 'sku', 'publisher', 'file_format', 'file_size', 'file_url',
  'category', 'image', 'seo_article', 'seo_article_title',
]);

const SETTINGS_FIELDS = new Set([
  'site_name', 'site_title', 'site_description',
  'default_author_name', 'default_author_title', 'default_author_url', 'default_author_twitter',
  'twitter_handle', 'linkedin_url', 'organization_description',
  'theme_color', 'site_tagline', 'default_language', 'primary_color', 'secondary_color',
  'homepage_keywords', 'default_meta_robots', 'logo_initials', 'contact_page_path',
  'default_logo', 'default_og_image', 'default_article_image', 'default_author_image',
  'favicon', 'apple_touch_icon',
]);

const SUBSCRIBER_FIELDS = new Set(['status', 'name']);

const NOTIFICATION_TEMPLATE_FIELDS = new Set([
  'slug', 'type', 'title', 'message', 'duration', 'status',
]);

function pickAllowedFields(body: Record<string, unknown>, allowed: Set<string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (allowed.has(key)) result[key] = body[key];
  }
  return result;
}

/**
 * Creates a single catch-all Next.js route handler for all admin API routes.
 *
 * Wire it up in your site:
 *   // app/admin/api/[...path]/route.ts
 *   const handler = createAdminApiHandler(adminConfig);
 *   export const GET = handler;
 *   export const POST = handler;
 *   export const PUT = handler;
 */
export function createAdminApiHandler(config: AdminConfig) {
  return async function handler(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> },
  ): Promise<NextResponse> {
    const { path } = await context.params;
    const route = path.join('/');
    const method = req.method;

    try {
      // ── Auth routes (no session required) ───────────────────────────────
      if (route === 'auth/login' && method === 'POST') return handleLogin(req, config);
      if (route === 'auth/logout' && method === 'POST') return handleLogout();
      if (route === 'auth/check' && method === 'GET') return handleAuthCheck(req, config);

      // ── All other routes require valid session ──────────────────────────
      const token = req.cookies.get(COOKIE_NAME)?.value;
      if (!token || !(await verifyToken(token, config.adminSecret))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // ── Articles ────────────────────────────────────────────────────────
      if (route === 'articles' && method === 'GET') return handleListArticles(config);
      if (route.match(/^articles\/[^/]+$/) && method === 'GET') return handleGetArticle(config, route.split('/')[1]);
      if (route.match(/^articles\/[^/]+$/) && method === 'PUT') return handleUpdateArticle(config, route.split('/')[1], req);

      // ── Products (optional) ─────────────────────────────────────────────
      if (config.collections.products) {
        if (route === 'products' && method === 'GET') return handleListProducts(config);
        if (route.match(/^products\/[^/]+$/) && method === 'GET') return handleGetProduct(config, route.split('/')[1]);
        if (route.match(/^products\/[^/]+$/) && method === 'PUT') return handleUpdateProduct(config, route.split('/')[1], req);
        if (route === 'product-categories' && method === 'GET') return handleListProductCategories(config);
      }

      // ── Settings ────────────────────────────────────────────────────────
      if (route === 'settings' && method === 'GET') return handleGetSettings(config);
      if (route === 'settings' && method === 'PUT') return handleUpdateSettings(config, req);

      // ── Categories (for dropdowns) ──────────────────────────────────────
      if (route === 'categories' && method === 'GET') return handleListCategories(config);

      // ── Newsletter subscribers (optional) ──────────────────────────────
      if (config.collections.subscribers) {
        if (route === 'newsletter/subscribers' && method === 'GET') return handleListSubscribers(config);
        if (route.match(/^newsletter\/subscribers\/\d+$/) && method === 'PUT') return handleUpdateSubscriber(config, route.split('/')[2], req);
      }

      // ── Notification templates (optional) ─────────────────────────────
      if (config.collections.notificationTemplates) {
        if (route === 'notification-templates' && method === 'GET') return handleListNotificationTemplates(config);
        if (route.match(/^notification-templates\/\d+$/) && method === 'PUT') return handleUpdateNotificationTemplate(config, route.split('/')[1], req);
      }

      // ── File upload ─────────────────────────────────────────────────────
      if (route === 'upload' && method === 'POST') return handleUpload(config, req);

      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (err) {
      console.error('[admin-api]', route, err);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}

// ── Auth handlers ──────────────────────────────────────────────────────────

async function handleLogin(req: NextRequest, config: AdminConfig): Promise<NextResponse> {
  const rateLimited = checkLoginRateLimit(req);
  if (rateLimited) return rateLimited;

  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // SECURITY: Hash both to fixed length to prevent timing leak on password length
  const { createHash } = await import('crypto');
  const hashA = createHash('sha256').update(password).digest();
  const hashB = createHash('sha256').update(expected).digest();
  if (!timingSafeEqual(hashA, hashB)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await signToken(config.adminSecret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}

function handleLogout(): NextResponse {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...sessionCookieOptions(0), value: '' });
  return res;
}

async function handleAuthCheck(req: NextRequest, config: AdminConfig): Promise<NextResponse> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token, config.adminSecret))) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

// ── Article handlers ───────────────────────────────────────────────────────

async function handleListArticles(config: AdminConfig): Promise<NextResponse> {
  const filter: Record<string, any> = {};
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.posts as any, {
      fields: ['id', 'title', 'slug', 'status', 'published_date', 'updated_date', 'author', 'category'],
      filter,
      sort: ['-published_date'] as any,
      limit: 200,
    }),
  );
  return NextResponse.json(items);
}

async function handleGetArticle(config: AdminConfig, id: string): Promise<NextResponse> {
  const item = await config.directus.request(
    readItem(config.collections.posts as any, id, {
      fields: ['*'],
    }),
  ) as any;

  // Verify the item belongs to this site in multi-tenant deployments
  if (config.siteId && item?.site != null && String(item.site) !== String(config.siteId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(item);
}

async function handleUpdateArticle(config: AdminConfig, id: string, req: NextRequest): Promise<NextResponse> {
  // Verify ownership before updating
  if (config.siteId) {
    const existing = await config.directus.request(
      readItem(config.collections.posts as any, id, { fields: ['site'] }),
    ) as any;
    if (existing?.site != null && String(existing.site) !== String(config.siteId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  const body = pickAllowedFields(await req.json(), ARTICLE_FIELDS);
  const updated = await config.directus.request(
    updateItem(config.collections.posts as any, id, body),
  );
  return NextResponse.json(updated);
}

// ── Product handlers ───────────────────────────────────────────────────────

async function handleListProducts(config: AdminConfig): Promise<NextResponse> {
  const filter: Record<string, any> = {};
  if (config.siteId) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.products! as any, {
      fields: ['id', 'title', 'slug', 'status', 'price', 'featured', 'updated_at', { category: ['name'] }],
      filter,
      sort: ['-updated_at'] as any,
      limit: 200,
    }),
  );
  return NextResponse.json(items);
}

async function handleGetProduct(config: AdminConfig, id: string): Promise<NextResponse> {
  const item = await config.directus.request(
    readItem(config.collections.products! as any, id, {
      fields: ['*', { category: ['id', 'name', 'slug'] }, { image: ['id'] }, { preview_images: ['id'] }],
    }),
  ) as any;

  if (config.siteId && item?.site != null && String(item.site) !== String(config.siteId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(item);
}

async function handleUpdateProduct(config: AdminConfig, id: string, req: NextRequest): Promise<NextResponse> {
  if (config.siteId) {
    const existing = await config.directus.request(
      readItem(config.collections.products! as any, id, { fields: ['site'] }),
    ) as any;
    if (existing?.site != null && String(existing.site) !== String(config.siteId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  const body = pickAllowedFields(await req.json(), PRODUCT_FIELDS);
  const updated = await config.directus.request(
    updateItem(config.collections.products! as any, id, body),
  );
  return NextResponse.json(updated);
}

async function handleListProductCategories(config: AdminConfig): Promise<NextResponse> {
  const filter: Record<string, any> = {};
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.productCategories! as any, {
      fields: ['id', 'name', 'slug'],
      filter,
      sort: ['name'] as any,
      limit: -1,
    }),
  );
  return NextResponse.json(items);
}

// ── Settings handlers ──────────────────────────────────────────────────────

async function handleGetSettings(config: AdminConfig): Promise<NextResponse> {
  const item = await config.directus.request(
    readSingleton(config.collections.settings as any, {
      fields: ['*'],
    }),
  );
  return NextResponse.json(item);
}

async function handleUpdateSettings(config: AdminConfig, req: NextRequest): Promise<NextResponse> {
  const body = pickAllowedFields(await req.json(), SETTINGS_FIELDS);
  const updated = await config.directus.request(
    updateSingleton(config.collections.settings as any, body),
  );
  return NextResponse.json(updated);
}

// ── Category handlers ──────────────────────────────────────────────────────

async function handleListCategories(config: AdminConfig): Promise<NextResponse> {
  if (!config.collections.blogCategories) {
    return NextResponse.json([]);
  }
  const filter: Record<string, any> = {};
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.blogCategories as any, {
      fields: ['id', 'name', 'slug'],
      filter,
      sort: ['name'] as any,
      limit: -1,
    }),
  );
  return NextResponse.json(items);
}

// ── Newsletter subscriber handlers ────────────────────────────────────────

async function handleListSubscribers(config: AdminConfig): Promise<NextResponse> {
  const filter: Record<string, any> = {};
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.subscribers! as any, {
      fields: ['id', 'email', 'name', 'status', 'source', 'site', 'date_created', 'date_confirmed'],
      filter,
      sort: ['-date_created'] as any,
      limit: 200,
    }),
  );
  return NextResponse.json(items);
}

async function handleUpdateSubscriber(config: AdminConfig, id: string, req: NextRequest): Promise<NextResponse> {
  if (config.siteId) {
    const existing = await config.directus.request(
      readItem(config.collections.subscribers! as any, id, { fields: ['site'] }),
    ) as any;
    if (existing?.site != null && String(existing.site) !== String(config.siteId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  const body = pickAllowedFields(await req.json(), SUBSCRIBER_FIELDS);
  const updated = await config.directus.request(
    updateItem(config.collections.subscribers! as any, id, body),
  );
  return NextResponse.json(updated);
}

// ── Notification template handlers ────────────────────────────────────────

async function handleListNotificationTemplates(config: AdminConfig): Promise<NextResponse> {
  const filter: Record<string, any> = {};
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.notificationTemplates! as any, {
      fields: ['id', 'slug', 'type', 'title', 'message', 'duration', 'status'],
      filter,
      sort: ['slug'] as any,
      limit: 200,
    }),
  );
  return NextResponse.json(items);
}

async function handleUpdateNotificationTemplate(config: AdminConfig, id: string, req: NextRequest): Promise<NextResponse> {
  if (config.siteId) {
    const existing = await config.directus.request(
      readItem(config.collections.notificationTemplates! as any, id, { fields: ['site'] }),
    ) as any;
    if (existing?.site != null && String(existing.site) !== String(config.siteId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  const body = pickAllowedFields(await req.json(), NOTIFICATION_TEMPLATE_FIELDS);
  const updated = await config.directus.request(
    updateItem(config.collections.notificationTemplates! as any, id, body),
  );
  return NextResponse.json(updated);
}

// ── Upload handler ─────────────────────────────────────────────────────────

async function handleUpload(config: AdminConfig, req: NextRequest): Promise<NextResponse> {
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 });
  }

  const formData = await req.formData();

  // Validate file type (MIME) and content (magic bytes)
  const file = formData.get('file');
  if (file instanceof Blob) {
    if (file.type && !ALLOWED_UPLOAD_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 415 });
    }
    // SECURITY: Verify file content matches claimed MIME type via magic bytes
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const matchesSig = FILE_SIGNATURES.some((sig) =>
      sig.bytes.every((b, i) => header[i] === b)
    );
    if (!matchesSig && file.type !== 'image/avif') { // AVIF has complex signatures
      return NextResponse.json({ error: 'File content does not match expected format' }, { status: 415 });
    }
  }

  const response = await fetch(`${config.directusUrl}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.directusToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    console.error('[admin-api] Upload failed:', response.status);
    return NextResponse.json({ error: 'Upload failed' }, { status: response.status });
  }

  const result = await response.json();
  const fileId = result.data?.id;
  return NextResponse.json({
    id: fileId,
    url: `${config.directusUrl}/assets/${fileId}`,
  });
}
