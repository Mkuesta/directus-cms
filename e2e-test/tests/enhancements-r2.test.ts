import { describe, it, expect, vi } from 'vitest';

// ---------------------------------------------------------------------------
// forms — notification callback
// ---------------------------------------------------------------------------
import { submitForm } from '../../directus-cms-forms/src/submissions.js';
import type { FormConfig, SubmitFormOptions } from '../../directus-cms-forms/src/types.js';

function createMockFormConfig(overrides?: Partial<FormConfig>): FormConfig {
  return {
    directus: {
      request: vi.fn().mockResolvedValue({ id: 1 }),
    } as any,
    collections: { submissions: 'test_submissions' },
    ...overrides,
  };
}

describe('forms — notification callback', () => {
  it('calls sendNotification after successful submission', async () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const config = createMockFormConfig({
      notifications: { notifyEmails: ['admin@test.com'], sendNotification },
    });
    const opts: SubmitFormOptions = { form: 'contact', data: { name: 'Test' } };

    const result = await submitForm(config, opts);

    expect(result.success).toBe(true);
    expect(sendNotification).toHaveBeenCalledWith({
      form: 'contact',
      data: { name: 'Test' },
      notifyEmails: ['admin@test.com'],
    });
  });

  it('does not call notification when spam is detected', async () => {
    const sendNotification = vi.fn();
    const config = createMockFormConfig({
      honeypotEnabled: true,
      notifications: { notifyEmails: ['admin@test.com'], sendNotification },
    });
    const opts: SubmitFormOptions = { form: 'contact', data: {}, honeypotValue: 'bot-value' };

    const result = await submitForm(config, opts);

    expect(result.success).toBe(false);
    expect(result.error).toBe('spam_detected');
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('does not fail if notification callback throws', async () => {
    const sendNotification = vi.fn().mockRejectedValue(new Error('email failed'));
    const config = createMockFormConfig({
      notifications: { notifyEmails: ['admin@test.com'], sendNotification },
    });
    const opts: SubmitFormOptions = { form: 'contact', data: { name: 'Test' } };

    const result = await submitForm(config, opts);

    expect(result.success).toBe(true);
    expect(sendNotification).toHaveBeenCalled();
  });

  it('skips notification when no notifications config', async () => {
    const config = createMockFormConfig();
    const opts: SubmitFormOptions = { form: 'contact', data: { name: 'Test' } };

    const result = await submitForm(config, opts);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sitemap — Next.js helper
// ---------------------------------------------------------------------------
import { generateNextSitemap } from '../../directus-cms-sitemap/src/nextjs.js';
import type { SitemapConfig } from '../../directus-cms-sitemap/src/types.js';

describe('sitemap — generateNextSitemap', () => {
  it('converts lastModified strings to Date objects', async () => {
    const config: SitemapConfig = {
      baseUrl: 'https://example.com',
      staticPages: [
        { path: '/', lastModified: '2024-01-15T00:00:00Z', priority: 1.0 },
        { path: '/about', lastModified: '2024-02-01', changeFrequency: 'monthly' },
      ],
    };

    const entries = await generateNextSitemap(config);

    expect(entries).toHaveLength(2);
    expect(entries[0].lastModified).toBeInstanceOf(Date);
    expect(entries[1].lastModified).toBeInstanceOf(Date);
    expect(entries[0].priority).toBe(1.0);
    expect(entries[1].changeFrequency).toBe('monthly');
  });

  it('handles entries without lastModified', async () => {
    const config: SitemapConfig = {
      baseUrl: 'https://example.com',
      staticPages: [{ path: '/' }],
    };

    const entries = await generateNextSitemap(config);

    expect(entries).toHaveLength(1);
    expect(entries[0].lastModified).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// media — Next.js Image props + loader
// ---------------------------------------------------------------------------
import { getNextImageProps, createDirectusLoader } from '../../directus-cms-media/src/images.js';
import type { MediaConfig } from '../../directus-cms-media/src/types.js';

function createMockMediaConfig(): MediaConfig {
  return {
    directus: {} as any,
    collections: {},
    directusUrl: 'https://cms.example.com',
  };
}

describe('media — getNextImageProps', () => {
  it('returns correct shape with placeholder blur', () => {
    const config = createMockMediaConfig();
    const props = getNextImageProps(config, 'abc-123', { alt: 'My image', width: 800, height: 600 });

    expect(props.placeholder).toBe('blur');
    expect(props.alt).toBe('My image');
    expect(props.src).toContain('https://cms.example.com/assets/abc-123');
    expect(props.blurDataURL).toContain('width=20');
    expect(props.width).toBe(800);
    expect(props.height).toBe(600);
  });

  it('defaults alt to empty string', () => {
    const config = createMockMediaConfig();
    const props = getNextImageProps(config, 'abc-123');
    expect(props.alt).toBe('');
  });

  it('includes quality in src when specified', () => {
    const config = createMockMediaConfig();
    const props = getNextImageProps(config, 'abc-123', { quality: 90 });
    expect(props.src).toContain('quality=90');
  });
});

describe('media — createDirectusLoader', () => {
  it('builds valid Directus asset URL', () => {
    const loader = createDirectusLoader('https://cms.example.com');
    const url = loader({ src: 'image-id', width: 640, quality: 80 });
    expect(url).toBe('https://cms.example.com/assets/image-id?width=640&quality=80');
  });

  it('defaults quality to 75 when not provided', () => {
    const loader = createDirectusLoader('https://cms.example.com');
    const url = loader({ src: 'image-id', width: 1024 });
    expect(url).toBe('https://cms.example.com/assets/image-id?width=1024&quality=75');
  });
});

// ---------------------------------------------------------------------------
// auth — middleware redirect behavior
// ---------------------------------------------------------------------------
import { createAuthMiddleware } from '../../directus-cms-auth/src/middleware.js';
import type { AuthConfig } from '../../directus-cms-auth/src/types.js';

function createMockAuthConfig(): AuthConfig {
  return {
    directus: {} as any,
    collections: { userProfiles: 'test_profiles' },
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'anon-key',
  };
}

describe('auth — middleware', () => {
  it('backward compat: accepts string[] argument', async () => {
    const config = createMockAuthConfig();
    const middleware = createAuthMiddleware(config, ['/dashboard']);

    // Unprotected path → pass through
    const req = new Request('https://example.com/public');
    const result = await middleware(req);
    expect(result).toBeNull();
  });

  it('redirects unauthenticated user to login with redirect param', async () => {
    const config = createMockAuthConfig();
    const middleware = createAuthMiddleware(config, {
      protectedPaths: ['/dashboard'],
    });

    const req = new Request('https://example.com/dashboard/settings');
    const result = await middleware(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(302);
    const location = result!.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('redirect=%2Fdashboard%2Fsettings');
  });

  it('returns 401 JSON when onUnauthenticated is unauthorized', async () => {
    const config = createMockAuthConfig();
    const middleware = createAuthMiddleware(config, {
      protectedPaths: ['/api/protected'],
      onUnauthenticated: 'unauthorized',
    });

    const req = new Request('https://example.com/api/protected');
    const result = await middleware(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it('passes through non-matching paths with publicOnlyPaths config', async () => {
    const config = createMockAuthConfig();
    const middleware = createAuthMiddleware(config, {
      protectedPaths: ['/dashboard'],
      publicOnlyPaths: ['/login', '/register'],
      defaultRedirect: '/dashboard',
    });

    // A path that matches neither protected nor publicOnly
    const req = new Request('https://example.com/about');
    const result = await middleware(req);
    expect(result).toBeNull();
  });

  it('uses custom loginPath', async () => {
    const config = createMockAuthConfig();
    const middleware = createAuthMiddleware(config, {
      protectedPaths: ['/account'],
      loginPath: '/auth/signin',
    });

    const req = new Request('https://example.com/account');
    const result = await middleware(req);

    expect(result!.headers.get('location')).toContain('/auth/signin');
  });
});
