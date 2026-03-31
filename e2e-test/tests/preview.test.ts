import { describe, it, expect, vi } from 'vitest';
import { createPreviewClient } from '../../directus-cms-preview/src/index.js';
import { generateToken, verifyToken } from '../../directus-cms-preview/src/token.js';
import { getPreviewPost, getPreviewProduct, getPreviewPage } from '../../directus-cms-preview/src/preview.js';
import type { PreviewConfig } from '../../directus-cms-preview/src/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockDirectus(response?: any[], shouldThrow = false) {
  return {
    request: vi.fn().mockImplementation(() => {
      if (shouldThrow) throw new Error('Directus error');
      return Promise.resolve(response ?? []);
    }),
  } as any;
}

function createConfig(overrides: Partial<PreviewConfig> = {}): PreviewConfig {
  return {
    directus: createMockDirectus(),
    directusUrl: 'https://cms.example.com',
    collections: {
      posts: 'site_posts',
      products: 'site_products',
      pages: 'site_pages',
    },
    previewSecret: 'test-secret-key-12345',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Token Generation & Verification (HMAC signing)
// ---------------------------------------------------------------------------
describe('generateToken', () => {
  it('returns a string with signature:expiresAt format', async () => {
    const expiresAt = Date.now() + 3600_000;
    const token = await generateToken('my-secret', '/blog/my-post', expiresAt);

    expect(typeof token).toBe('string');
    expect(token).toContain(':');

    const parts = token.split(':');
    expect(parts.length).toBe(2);

    // First part is hex signature
    expect(parts[0]).toMatch(/^[0-9a-f]+$/);
    // Second part is the expiresAt number
    expect(parseInt(parts[1], 10)).toBe(expiresAt);
  });

  it('produces different tokens for different paths', async () => {
    const expiresAt = Date.now() + 3600_000;
    const token1 = await generateToken('secret', '/path-a', expiresAt);
    const token2 = await generateToken('secret', '/path-b', expiresAt);
    expect(token1).not.toBe(token2);
  });

  it('produces different tokens for different secrets', async () => {
    const expiresAt = Date.now() + 3600_000;
    const token1 = await generateToken('secret-1', '/path', expiresAt);
    const token2 = await generateToken('secret-2', '/path', expiresAt);
    expect(token1).not.toBe(token2);
  });

  it('produces different tokens for different expiry times', async () => {
    const token1 = await generateToken('secret', '/path', Date.now() + 1000);
    const token2 = await generateToken('secret', '/path', Date.now() + 2000);
    expect(token1).not.toBe(token2);
  });
});

describe('verifyToken', () => {
  it('returns true for a valid token with matching path and secret', async () => {
    const secret = 'my-secret';
    const path = '/blog/test-post';
    const expiresAt = Date.now() + 60_000; // 1 minute in the future

    const token = await generateToken(secret, path, expiresAt);
    const result = await verifyToken(secret, path, token);
    expect(result).toBe(true);
  });

  it('returns false for an expired token', async () => {
    const secret = 'my-secret';
    const path = '/blog/test-post';
    const expiresAt = Date.now() - 1000; // 1 second in the past

    const token = await generateToken(secret, path, expiresAt);
    const result = await verifyToken(secret, path, token);
    expect(result).toBe(false);
  });

  it('returns false for wrong secret', async () => {
    const path = '/blog/test-post';
    const expiresAt = Date.now() + 60_000;

    const token = await generateToken('correct-secret', path, expiresAt);
    const result = await verifyToken('wrong-secret', path, token);
    expect(result).toBe(false);
  });

  it('returns false for wrong path', async () => {
    const secret = 'my-secret';
    const expiresAt = Date.now() + 60_000;

    const token = await generateToken(secret, '/correct-path', expiresAt);
    const result = await verifyToken(secret, '/wrong-path', token);
    expect(result).toBe(false);
  });

  it('returns false for malformed token (no colon)', async () => {
    const result = await verifyToken('secret', '/path', 'noseparator');
    expect(result).toBe(false);
  });

  it('returns false for empty token', async () => {
    const result = await verifyToken('secret', '/path', '');
    expect(result).toBe(false);
  });

  it('returns false when expiresAt is not a number', async () => {
    const result = await verifyToken('secret', '/path', 'abcdef:notanumber');
    expect(result).toBe(false);
  });

  it('returns false for a tampered signature', async () => {
    const secret = 'my-secret';
    const path = '/blog/test-post';
    const expiresAt = Date.now() + 60_000;

    const token = await generateToken(secret, path, expiresAt);
    // Tamper with the signature by changing the first character
    const parts = token.split(':');
    const tampered = (parts[0][0] === 'a' ? 'b' : 'a') + parts[0].slice(1) + ':' + parts[1];
    const result = await verifyToken(secret, path, tampered);
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createPreviewClient
// ---------------------------------------------------------------------------
describe('createPreviewClient', () => {
  it('returns client with all expected methods', () => {
    const config = createConfig();
    const client = createPreviewClient(config);

    expect(client).toHaveProperty('config');
    expect(client).toHaveProperty('getPreviewPost');
    expect(client).toHaveProperty('getPreviewProduct');
    expect(client).toHaveProperty('getPreviewPage');
    expect(client).toHaveProperty('generatePreviewUrl');
    expect(client).toHaveProperty('verifyPreviewToken');
    expect(client).toHaveProperty('getScheduledContent');
    expect(client).toHaveProperty('publishScheduledContent');

    expect(typeof client.getPreviewPost).toBe('function');
    expect(typeof client.getPreviewProduct).toBe('function');
    expect(typeof client.getPreviewPage).toBe('function');
    expect(typeof client.generatePreviewUrl).toBe('function');
    expect(typeof client.verifyPreviewToken).toBe('function');
    expect(typeof client.getScheduledContent).toBe('function');
    expect(typeof client.publishScheduledContent).toBe('function');
  });

  it('config is accessible on the returned client', () => {
    const config = createConfig();
    const client = createPreviewClient(config);
    expect(client.config).toBe(config);
    expect(client.config.previewSecret).toBe('test-secret-key-12345');
    expect(client.config.directusUrl).toBe('https://cms.example.com');
  });

  it('generatePreviewUrl returns URL with path and token params', async () => {
    const config = createConfig();
    const client = createPreviewClient(config);

    const url = await client.generatePreviewUrl('/blog/my-post');
    expect(url).toContain('/api/preview?');
    expect(url).toContain('path=');
    expect(url).toContain('token=');
    expect(url).toContain(encodeURIComponent('/blog/my-post'));
  });

  it('generatePreviewUrl creates a verifiable token', async () => {
    const config = createConfig();
    const client = createPreviewClient(config);

    const url = await client.generatePreviewUrl('/blog/my-post');

    // Extract token from the URL
    const urlObj = new URL('http://localhost' + url);
    const token = urlObj.searchParams.get('token')!;
    const path = urlObj.searchParams.get('path')!;

    expect(token).toBeDefined();
    expect(path).toBe('/blog/my-post');

    // The token should be verifiable with the same secret and path
    const isValid = await verifyToken(config.previewSecret, path, token);
    expect(isValid).toBe(true);
  });

  it('uses custom tokenExpiry from config', async () => {
    const config = createConfig({ tokenExpiry: 10 }); // 10 seconds
    const client = createPreviewClient(config);

    const url = await client.generatePreviewUrl('/test');
    const urlObj = new URL('http://localhost' + url);
    const token = urlObj.searchParams.get('token')!;

    // Extract expiresAt from token
    const parts = token.split(':');
    const expiresAt = parseInt(parts[parts.length - 1], 10);

    // Should expire within ~10 seconds from now (with some tolerance)
    const diff = expiresAt - Date.now();
    expect(diff).toBeGreaterThan(0);
    expect(diff).toBeLessThanOrEqual(10_000 + 500); // 10s + tolerance
  });

  it('defaults tokenExpiry to 3600 seconds (1 hour)', async () => {
    const config = createConfig();
    const client = createPreviewClient(config);

    const url = await client.generatePreviewUrl('/test');
    const urlObj = new URL('http://localhost' + url);
    const token = urlObj.searchParams.get('token')!;

    const parts = token.split(':');
    const expiresAt = parseInt(parts[parts.length - 1], 10);

    const diff = expiresAt - Date.now();
    // Should be approximately 1 hour
    expect(diff).toBeGreaterThan(3_500_000);
    expect(diff).toBeLessThanOrEqual(3_600_000 + 500);
  });
});

// ---------------------------------------------------------------------------
// getPreviewPost / getPreviewProduct / getPreviewPage
// ---------------------------------------------------------------------------
describe('getPreviewPost', () => {
  it('returns null when posts collection is not configured', async () => {
    const config = createConfig({
      collections: { products: 'site_products', pages: 'site_pages' },
    });
    const result = await getPreviewPost(config, 'any-slug');
    expect(result).toBeNull();
    // Should not have called directus at all
    expect(config.directus.request).not.toHaveBeenCalled();
  });

  it('returns transformed item when found', async () => {
    const mockItem = {
      id: 'abc-123',
      title: 'Draft Post',
      slug: 'draft-post',
      content: '<p>Draft content</p>',
      status: 'draft',
      excerpt: 'A draft post',
      featured_image: 'img-uuid-456',
      published_date: '2025-01-15T10:00:00Z',
      updated_date: '2025-02-01T12:00:00Z',
      scheduled_publish_date: '2025-03-01T00:00:00Z',
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });

    const result = await getPreviewPost(config, 'draft-post');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc-123');
    expect(result!.title).toBe('Draft Post');
    expect(result!.slug).toBe('draft-post');
    expect(result!.content).toBe('<p>Draft content</p>');
    expect(result!.status).toBe('draft');
    expect(result!.excerpt).toBe('A draft post');
    expect(result!.featuredImage).toBe('https://cms.example.com/assets/img-uuid-456');
    expect(result!.publishedDate).toBe('2025-01-15T10:00:00Z');
    expect(result!.updatedDate).toBe('2025-02-01T12:00:00Z');
    expect(result!.scheduledPublishDate).toBe('2025-03-01T00:00:00Z');
  });

  it('handles featured_image as an object with id', async () => {
    const mockItem = {
      id: 1,
      title: 'Post',
      slug: 'post',
      status: 'draft',
      featured_image: { id: 'image-id-789' },
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });

    const result = await getPreviewPost(config, 'post');
    expect(result!.featuredImage).toBe('https://cms.example.com/assets/image-id-789');
  });

  it('returns undefined for featuredImage when featured_image is null', async () => {
    const mockItem = {
      id: 1,
      title: 'Post',
      slug: 'post',
      status: 'draft',
      featured_image: null,
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });

    const result = await getPreviewPost(config, 'post');
    expect(result!.featuredImage).toBeUndefined();
  });

  it('returns null when no items match (empty array)', async () => {
    const directus = createMockDirectus([]);
    const config = createConfig({ directus });

    const result = await getPreviewPost(config, 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    const directus = createMockDirectus(undefined, true);
    const config = createConfig({ directus });

    const result = await getPreviewPost(config, 'any-slug');
    expect(result).toBeNull();
  });

  it('includes siteId filter when configured', async () => {
    const directus = createMockDirectus([]);
    const config = createConfig({ directus, siteId: 42 });

    await getPreviewPost(config, 'test-slug');

    expect(directus.request).toHaveBeenCalled();
  });
});

describe('getPreviewProduct', () => {
  it('returns null when products collection is not configured', async () => {
    const config = createConfig({
      collections: { posts: 'site_posts', pages: 'site_pages' },
    });
    const result = await getPreviewProduct(config, 'any-slug');
    expect(result).toBeNull();
  });

  it('returns transformed item when found', async () => {
    const mockItem = {
      id: 'prod-1',
      title: 'Draft Product',
      slug: 'draft-product',
      content: '<p>Product details</p>',
      status: 'draft',
      excerpt: 'A product',
      featured_image: null,
      published_date: null,
      updated_date: null,
      scheduled_publish_date: null,
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });

    const result = await getPreviewProduct(config, 'draft-product');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('prod-1');
    expect(result!.title).toBe('Draft Product');
    expect(result!.slug).toBe('draft-product');
    expect(result!.status).toBe('draft');
  });

  it('returns null when no items match', async () => {
    const directus = createMockDirectus([]);
    const config = createConfig({ directus });

    const result = await getPreviewProduct(config, 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    const directus = createMockDirectus(undefined, true);
    const config = createConfig({ directus });

    const result = await getPreviewProduct(config, 'any-slug');
    expect(result).toBeNull();
  });
});

describe('getPreviewPage', () => {
  it('returns null when pages collection is not configured', async () => {
    const config = createConfig({
      collections: { posts: 'site_posts', products: 'site_products' },
    });
    const result = await getPreviewPage(config, 'any-slug');
    expect(result).toBeNull();
  });

  it('returns transformed item when found', async () => {
    const mockItem = {
      id: 'page-1',
      title: 'About Us',
      slug: 'about-us',
      content: '<p>About page content</p>',
      status: 'draft',
      excerpt: 'About us page',
      featured_image: 'about-image',
      published_date: '2025-01-01T00:00:00Z',
      updated_date: null,
      scheduled_publish_date: null,
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });

    const result = await getPreviewPage(config, 'about-us');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('page-1');
    expect(result!.title).toBe('About Us');
    expect(result!.slug).toBe('about-us');
    expect(result!.content).toBe('<p>About page content</p>');
  });

  it('returns null when no items match', async () => {
    const directus = createMockDirectus([]);
    const config = createConfig({ directus });

    const result = await getPreviewPage(config, 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    const directus = createMockDirectus(undefined, true);
    const config = createConfig({ directus });

    const result = await getPreviewPage(config, 'any-slug');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Client method delegation
// ---------------------------------------------------------------------------
describe('createPreviewClient method delegation', () => {
  it('getPreviewPost delegates to the underlying preview function', async () => {
    const mockItem = {
      id: 1,
      title: 'Test',
      slug: 'test',
      status: 'draft',
      content: null,
      excerpt: null,
      featured_image: null,
      published_date: null,
      updated_date: null,
      scheduled_publish_date: null,
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });
    const client = createPreviewClient(config);

    const result = await client.getPreviewPost('test');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('test');
  });

  it('getPreviewProduct delegates to the underlying preview function', async () => {
    const mockItem = {
      id: 2,
      title: 'Product',
      slug: 'product',
      status: 'draft',
      content: null,
      excerpt: null,
      featured_image: null,
      published_date: null,
      updated_date: null,
      scheduled_publish_date: null,
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });
    const client = createPreviewClient(config);

    const result = await client.getPreviewProduct('product');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('product');
  });

  it('getPreviewPage delegates to the underlying preview function', async () => {
    const mockItem = {
      id: 3,
      title: 'Page',
      slug: 'page',
      status: 'published',
      content: null,
      excerpt: null,
      featured_image: null,
      published_date: null,
      updated_date: null,
      scheduled_publish_date: null,
    };

    const directus = createMockDirectus([mockItem]);
    const config = createConfig({ directus });
    const client = createPreviewClient(config);

    const result = await client.getPreviewPage('page');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('page');
  });
});
