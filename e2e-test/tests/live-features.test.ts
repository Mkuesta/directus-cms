/**
 * Live feature integration tests — verifies the 5 new packages + cache
 * against a live Directus instance at cms.drlogist.com with prefix "test_".
 *
 * Requires: DIRECTUS_ADMIN_TOKEN env var (or .env file).
 *
 * Run:  cd e2e-test && npx vitest run tests/live-features.test.ts --reporter=verbose
 */
import { describe, it, expect, beforeAll } from 'vitest';
// Import SDK from a sibling package that has it installed
import { createDirectus, rest, staticToken } from '../../directus-cms-core/node_modules/@directus/sdk/dist/index.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://cms.drlogist.com';
const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const PREFIX = 'test';
const PREVIEW_SECRET = 'e2e-test-preview-secret-key';
const WEBHOOK_SECRET = 'e2e-test-webhook-secret-key';

// ---------------------------------------------------------------------------
// Directus client
// ---------------------------------------------------------------------------
function makeClient(token?: string) {
  const client = (createDirectus as any)(DIRECTUS_URL).with((rest as any)());
  if (token) return client.with((staticToken as any)(token));
  return client;
}

const publicClient = makeClient();
const adminClient = makeClient(ADMIN_TOKEN);

// ============================================================================
// 1. SEARCH TESTS
// ============================================================================
describe('Search — live Directus queries', () => {
  let searchClient: any;

  beforeAll(async () => {
    const { createSearchClient } = await import('../../directus-cms-search/src/index.js');
    searchClient = createSearchClient({
      directus: publicClient as any,
      directusUrl: DIRECTUS_URL,
      collections: [
        {
          collection: `${PREFIX}_posts`,
          type: 'post',
          searchFields: ['title', 'content', 'excerpt'],
          resultFields: ['id', 'title', 'slug', 'excerpt', 'status'],
          titleField: 'title',
          slugField: 'slug',
          excerptField: 'excerpt',
          baseFilter: { status: { _eq: 'published' } },
          urlPrefix: '/blog',
        },
        {
          collection: `${PREFIX}_pages`,
          type: 'page',
          searchFields: ['title', 'content'],
          resultFields: ['id', 'title', 'slug', 'status'],
          titleField: 'title',
          slugField: 'slug',
          baseFilter: { status: { _eq: 'published' } },
          urlPrefix: '/',
        },
      ],
    });
  });

  it('search("Directus") returns posts containing "Directus"', async () => {
    const res = await searchClient.search('Directus');
    expect(res.total).toBeGreaterThan(0);
    expect(res.results[0].title).toBeDefined();
    expect(res.results[0].url).toMatch(/^\//);
    expect(res.results[0].score).toBeGreaterThan(0);
  });

  it('search("Getting Started") matches post with that title', async () => {
    const res = await searchClient.search('Getting Started');
    expect(res.total).toBeGreaterThan(0);
    const titles = res.results.map((r: any) => r.title);
    expect(titles).toContain('Getting Started');
  });

  it('search with empty string returns empty results', async () => {
    const res = await searchClient.search('');
    expect(res.total).toBe(0);
    expect(res.results).toHaveLength(0);
  });

  it('search with type filter narrows to pages only', async () => {
    const res = await searchClient.search('About', { types: ['page'] });
    for (const r of res.results) {
      expect(r.type).toBe('page');
    }
  });

  it('search with pagination (limit + offset)', async () => {
    const full = await searchClient.search('content');
    const page = await searchClient.search('content', { limit: 2, offset: 0 });
    expect(page.results.length).toBeLessThanOrEqual(2);
    if (full.total > 2) {
      const page2 = await searchClient.search('content', { limit: 2, offset: 2 });
      expect(page2.results[0]?.id).not.toBe(page.results[0]?.id);
    }
  });

  it('search with SQL wildcards (%) does not expand', async () => {
    const res = await searchClient.search('%admin%');
    // Should not match everything — wildcards are escaped
    expect(res.total).toBeLessThan(100);
  });

  it('searchByType("post", "tips") returns only posts', async () => {
    const results = await searchClient.searchByType('post', 'tips');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.type).toBe('post');
    }
  });

  it('results are sorted by score descending', async () => {
    const res = await searchClient.search('Directus');
    for (let i = 1; i < res.results.length; i++) {
      expect(res.results[i - 1].score).toBeGreaterThanOrEqual(res.results[i].score);
    }
  });
});

// ============================================================================
// 2. TAGS TESTS
// ============================================================================
describe('Tags — live Directus queries', () => {
  let tagClient: any;

  beforeAll(async () => {
    const { createTagClient } = await import('../../directus-cms-tags/src/index.js');
    tagClient = createTagClient({
      directus: publicClient as any,
      directusUrl: DIRECTUS_URL,
      collections: { posts: `${PREFIX}_posts` },
    });
  });

  it('getAllTags returns unique sorted tags', async () => {
    const tags = await tagClient.getAllTags();
    expect(tags.length).toBeGreaterThan(0);

    // Should be unique
    const unique = [...new Set(tags)];
    expect(tags).toEqual(unique);

    // Should be sorted
    const sorted = [...tags].sort((a: string, b: string) => a.localeCompare(b));
    expect(tags).toEqual(sorted);
  });

  it('getPostsByTag("directus") returns posts with that tag', async () => {
    const posts = await tagClient.getPostsByTag('directus');
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.tags).toContain('directus');
      expect(post.title).toBeDefined();
      expect(post.slug).toBeDefined();
    }
  });

  it('getPostsByTag with limit caps results', async () => {
    const posts = await tagClient.getPostsByTag('directus', 1);
    expect(posts.length).toBeLessThanOrEqual(1);
  });

  it('getRelatedByTags finds related posts, excludes current', async () => {
    const related = await tagClient.getRelatedByTags(
      ['directus', 'cms'],
      'building-with-directus',
      5,
    );
    for (const post of related) {
      expect(post.slug).not.toBe('building-with-directus');
    }
  });

  it('getTagCounts returns tag/count pairs sorted by frequency', async () => {
    const counts = await tagClient.getTagCounts();
    expect(counts.length).toBeGreaterThan(0);
    for (const tc of counts) {
      expect(tc.tag).toBeDefined();
      expect(tc.count).toBeGreaterThan(0);
    }
    // Should be sorted by count descending
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i - 1].count).toBeGreaterThanOrEqual(counts[i].count);
    }
  });

  it('getPostsByTag for non-existent tag returns empty', async () => {
    const posts = await tagClient.getPostsByTag('zzz-nonexistent-tag-xyz');
    expect(posts).toHaveLength(0);
  });
});

// ============================================================================
// 3. PREVIEW TESTS
// ============================================================================
describe('Preview — draft content + HMAC tokens', () => {
  let previewClient: any;

  beforeAll(async () => {
    if (!ADMIN_TOKEN) throw new Error('DIRECTUS_ADMIN_TOKEN required for preview tests');
    const { createPreviewClient } = await import('../../directus-cms-preview/src/index.js');
    previewClient = createPreviewClient({
      directus: adminClient as any,
      directusUrl: DIRECTUS_URL,
      collections: {
        posts: `${PREFIX}_posts`,
        pages: `${PREFIX}_pages`,
      },
      previewSecret: PREVIEW_SECRET,
      tokenExpiry: 3600,
    });
  });

  it('getPreviewPost fetches a published post by slug', async () => {
    const post = await previewClient.getPreviewPost('getting-started');
    expect(post).not.toBeNull();
    expect(post.title).toBe('Getting Started');
    expect(post.status).toBe('published');
  });

  it('getPreviewPost fetches a draft post (admin token bypasses status filter)', async () => {
    const post = await previewClient.getPreviewPost('draft-post-example');
    expect(post).not.toBeNull();
    expect(post.title).toBe('Draft Post Example');
    expect(post.status).toBe('draft');
  });

  it('getPreviewPage fetches a draft page', async () => {
    const page = await previewClient.getPreviewPage('services');
    expect(page).not.toBeNull();
    expect(page.title).toBe('Services');
    expect(page.status).toBe('draft');
  });

  it('getScheduledContent returns only past-due scheduled items (none currently due)', async () => {
    // getScheduledContent finds items where scheduled_publish_date <= now
    // Post id=10 is scheduled for 2026-04-01 (future), so it won't appear
    const scheduled = await previewClient.getScheduledContent();
    expect(Array.isArray(scheduled)).toBe(true);
    for (const item of scheduled) {
      expect(item.status).toBe('scheduled');
      // If any past-due items exist, they should have a valid date
      expect(new Date(item.scheduledPublishDate).getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  it('scheduled post exists with future publish date (visible via preview)', async () => {
    const post = await previewClient.getPreviewPost('upcoming-feature-announcement');
    expect(post).not.toBeNull();
    expect(post.status).toBe('scheduled');
    expect(post.scheduledPublishDate).toBeDefined();
    expect(new Date(post.scheduledPublishDate!).getTime()).toBeGreaterThan(Date.now());
  });

  it('generatePreviewUrl produces a valid signed URL', async () => {
    const url = await previewClient.generatePreviewUrl('/blog/getting-started');
    expect(url).toMatch(/^\/api\/preview\?path=/);
    expect(url).toContain('token=');
  });

  it('HMAC token roundtrip: generate → verify succeeds', async () => {
    const { generatePreviewToken, verifyPreviewToken } = await import(
      '../../directus-cms-preview/src/index.js'
    );
    const expiresAt = Date.now() + 60_000;
    const token = await generatePreviewToken(PREVIEW_SECRET, '/blog/test', expiresAt);
    const valid = await verifyPreviewToken(PREVIEW_SECRET, '/blog/test', token);
    expect(valid).toBe(true);
  });

  it('expired token fails verification', async () => {
    const { generatePreviewToken, verifyPreviewToken } = await import(
      '../../directus-cms-preview/src/index.js'
    );
    const expiresAt = Date.now() - 1000; // already expired
    const token = await generatePreviewToken(PREVIEW_SECRET, '/blog/test', expiresAt);
    const valid = await verifyPreviewToken(PREVIEW_SECRET, '/blog/test', token);
    expect(valid).toBe(false);
  });

  it('wrong secret fails verification', async () => {
    const { generatePreviewToken, verifyPreviewToken } = await import(
      '../../directus-cms-preview/src/index.js'
    );
    const expiresAt = Date.now() + 60_000;
    const token = await generatePreviewToken(PREVIEW_SECRET, '/blog/test', expiresAt);
    const valid = await verifyPreviewToken('wrong-secret', '/blog/test', token);
    expect(valid).toBe(false);
  });

  it('getPreviewPost returns null for non-existent slug', async () => {
    const post = await previewClient.getPreviewPost('this-slug-does-not-exist-xyz');
    expect(post).toBeNull();
  });
});

// ============================================================================
// 4. SEO TESTS
// ============================================================================
describe('SEO — schema generators + meta tags with live data', () => {
  let seoClient: any;

  beforeAll(async () => {
    const { createSeoClient } = await import('../../directus-cms-seo/src/index.js');
    seoClient = createSeoClient({
      baseUrl: 'https://e2e-test.example.com',
      siteName: 'E2E Test Site',
      organization: {
        name: 'E2E Test Org',
        url: 'https://e2e-test.example.com',
        logo: 'https://e2e-test.example.com/logo.png',
        email: 'test@example.com',
        telephone: '+1-555-0100',
      },
      twitterHandle: '@e2etest',
      trailingSlash: false,
    });
  });

  it('generateFAQPage with live faqs_json data', async () => {
    // Fetch post with faqs_json from live Directus
    const res = await fetch(
      `${DIRECTUS_URL}/items/${PREFIX}_posts?filter[slug][_eq]=getting-started&fields=faqs_json`,
    );
    const data = await res.json();
    const faqsJson = JSON.parse(data.data[0].faqs_json);

    const faq = seoClient.generateFAQPage({ questions: faqsJson });
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(2);
    expect(faq.mainEntity[0]['@type']).toBe('Question');
    expect(faq.mainEntity[0].name).toBe('How long does setup take?');
    expect(faq.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });

  it('generateHowTo with live howto_json data', async () => {
    const res = await fetch(
      `${DIRECTUS_URL}/items/${PREFIX}_posts?filter[slug][_eq]=how-to-setup-product-categories&fields=howto_json`,
    );
    const data = await res.json();
    const howtoJson = JSON.parse(data.data[0].howto_json);

    const howto = seoClient.generateHowTo(howtoJson);
    expect(howto['@type']).toBe('HowTo');
    expect(howto.name).toBe('Set Up Product Categories');
    expect(howto.step).toHaveLength(4);
    expect(howto.step[0]['@type']).toBe('HowToStep');
    expect(howto.step[0].name).toBe('Plan Your Category Hierarchy');
  });

  it('generateOrganization returns valid Schema.org', () => {
    const org = seoClient.generateOrganization();
    expect(org['@type']).toBe('Organization');
    expect(org.name).toBe('E2E Test Org');
    expect(org.url).toBe('https://e2e-test.example.com');
    expect(org.logo).toBeDefined();
    expect(org.email).toBe('test@example.com');
  });

  it('generateWebSite with search action', () => {
    const site = seoClient.generateWebSite('/search?q={search_term_string}');
    expect(site['@type']).toBe('WebSite');
    expect(site.name).toBe('E2E Test Site');
    expect(site.potentialAction).toBeDefined();
    expect(site.potentialAction['@type']).toBe('SearchAction');
  });

  it('generateBreadcrumbList from path segments', () => {
    const breadcrumbs = seoClient.generateBreadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: 'Getting Started', url: '/blog/getting-started' },
    ]);
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[2].name).toBe('Getting Started');
  });

  it('generateMetaTags produces OpenGraph + Twitter Card', () => {
    const meta = seoClient.generateMetaTags({
      title: 'E2E Test Page',
      description: 'Testing meta tag generation',
      canonicalPath: '/blog/test',
      ogType: 'article',
    });
    expect(meta.title).toBe('E2E Test Page');
    expect(meta.description).toBe('Testing meta tag generation');
    expect(meta.alternates?.canonical).toBe('https://e2e-test.example.com/blog/test');
    expect(meta.openGraph?.title).toBe('E2E Test Page');
    expect(meta.openGraph?.siteName).toBe('E2E Test Site');
    expect(meta.twitter?.card).toBe('summary_large_image');
    expect(meta.twitter?.creator).toBe('@e2etest');
  });

  it('generateCanonicalUrl strips trailing slash when trailingSlash=false', () => {
    const url = seoClient.generateCanonicalUrl('/blog/test/');
    expect(url).toBe('https://e2e-test.example.com/blog/test');
  });

  it('generateLocalBusiness with opening hours', () => {
    const biz = seoClient.generateLocalBusiness({
      name: 'Test Shop',
      address: {
        streetAddress: '123 Test St',
        addressLocality: 'Test City',
        addressRegion: 'TC',
        postalCode: '12345',
        addressCountry: 'US',
      },
      openingHours: ['Mo-Fr 09:00-17:00', 'Sa 10:00-14:00'],
      priceRange: '$$',
    });
    expect(biz['@type']).toBe('LocalBusiness');
    expect(biz.name).toBe('Test Shop');
    expect(biz.openingHours).toEqual(['Mo-Fr 09:00-17:00', 'Sa 10:00-14:00']);
    expect(biz.priceRange).toBe('$$');
  });
});

// ============================================================================
// 5. WEBHOOK TESTS (unit-level with live crypto)
// ============================================================================
describe('Webhooks — HMAC signing + handler behavior', () => {
  it('verifySignature roundtrip: sign payload → verify succeeds', async () => {
    const { verifySignature } = await import('../../directus-cms-webhooks/src/signature.js');

    // Sign a payload manually
    const payload = JSON.stringify({ event: 'items.create', collection: 'test_posts' });
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const valid = await verifySignature(payload, sigHex, WEBHOOK_SECRET);
    expect(valid).toBe(true);
  });

  it('verifySignature rejects tampered payload', async () => {
    const { verifySignature } = await import('../../directus-cms-webhooks/src/signature.js');

    const payload = JSON.stringify({ event: 'items.create', collection: 'test_posts' });
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Tamper with payload
    const tampered = JSON.stringify({ event: 'items.delete', collection: 'test_posts' });
    const valid = await verifySignature(tampered, sigHex, WEBHOOK_SECRET);
    expect(valid).toBe(false);
  });

  it('webhook handler rejects unsigned requests (Fix 2)', async () => {
    const { createWebhookHandler } = await import('../../directus-cms-webhooks/src/handler.js');

    const handler = createWebhookHandler({
      secret: WEBHOOK_SECRET,
      mappings: [
        {
          collection: `${PREFIX}_posts`,
          actions: [{ type: 'revalidateTag', tag: 'posts' }],
        },
      ],
    });

    const request = new Request('https://example.com/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'items.create', collection: `${PREFIX}_posts` }),
    });

    const response = await handler(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Missing signature');
  });

  it('webhook handler accepts properly signed requests', async () => {
    const { createWebhookHandler } = await import('../../directus-cms-webhooks/src/handler.js');

    const handler = createWebhookHandler({
      secret: WEBHOOK_SECRET,
      mappings: [
        {
          collection: `${PREFIX}_posts`,
          actions: [{ type: 'revalidateTag', tag: 'posts' }],
        },
      ],
    });

    const payload = JSON.stringify({
      event: 'items.create',
      collection: `${PREFIX}_posts`,
      payload: { id: 1 },
    });

    // Sign
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const request = new Request('https://example.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Directus-Signature': sigHex,
      },
      body: payload,
    });

    const response = await handler(request);
    expect(response.status).toBe(200);
  });

  it('defaultCollectionMappings generates correct prefixed collections', async () => {
    const { defaultCollectionMappings } = await import(
      '../../directus-cms-webhooks/src/collection-map.js'
    );
    const mappings = defaultCollectionMappings(PREFIX);
    expect(mappings.length).toBe(9);

    const collections = mappings.map((m: any) => m.collection);
    expect(collections).toContain(`${PREFIX}_posts`);
    expect(collections).toContain(`${PREFIX}_pages`);
    expect(collections).toContain(`${PREFIX}_products`);
    expect(collections).toContain(`${PREFIX}_settings`);
    expect(collections).toContain(`${PREFIX}_redirects`);

    // Each mapping has at least one action
    for (const mapping of mappings) {
      expect(mapping.actions.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// 6. CACHE TESTS
// ============================================================================
describe('Cache — WeakMap TTL + SWR with live fetchers', () => {
  it('withCache caches result and returns same value on second call', async () => {
    const { createCache, withCache } = await import('../../directus-cms-cache/src/index.js');
    const cache = createCache<any>({ ttl: 5000 });
    const key = {};
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      const res = await fetch(`${DIRECTUS_URL}/items/${PREFIX}_posts?limit=1&fields=id,title`);
      return res.json();
    };

    const result1 = await withCache(cache, key, fetcher);
    const result2 = await withCache(cache, key, fetcher);

    expect(fetchCount).toBe(1); // Only fetched once
    expect(result1).toEqual(result2);
    expect(result1.data).toHaveLength(1);
  });

  it('cache.has() returns true for cached value, getEntry returns entry', async () => {
    const { createCache } = await import('../../directus-cms-cache/src/index.js');
    const cache = createCache<string>({ ttl: 5000 });
    const key = {};

    expect(cache.has(key)).toBe(false);
    expect(cache.getEntry(key)).toBeNull();

    cache.set(key, 'hello');
    expect(cache.has(key)).toBe(true);
    expect(cache.get(key)).toBe('hello');

    const entry = cache.getEntry(key);
    expect(entry).not.toBeNull();
    expect(entry!.data).toBe('hello');
    expect(entry!.expiresAt).toBeGreaterThan(Date.now());
  });

  it('withCache distinguishes cached null from cache miss (Fix 7)', async () => {
    const { createCache, withCache } = await import('../../directus-cms-cache/src/index.js');
    const cache = createCache<null>({ ttl: 5000 });
    const key = {};
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      return null;
    };

    const result1 = await withCache(cache, key, fetcher);
    const result2 = await withCache(cache, key, fetcher);

    expect(result1).toBeNull();
    expect(result2).toBeNull();
    expect(fetchCount).toBe(1); // Cached null, didn't re-fetch
  });

  it('withCacheSWR returns cached data and triggers background refresh when near expiry', async () => {
    const { createCache, withCacheSWR } = await import('../../directus-cms-cache/src/index.js');
    // TTL of 2s — entry stays valid but staleThreshold triggers refresh
    const cache = createCache<any>({ ttl: 2000 });
    const key = {};
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      return { count: fetchCount };
    };

    // Prime the cache
    const result1 = await withCacheSWR(cache, key, fetcher);
    expect(result1.count).toBe(1);
    expect(fetchCount).toBe(1);

    // Entry is still valid (2s TTL), remaining ~2000ms.
    // staleThreshold=3000 means "refresh if remaining <= 3000ms" → triggers refresh
    const result2 = await withCacheSWR(cache, key, fetcher, 3000);
    // Returns the cached value immediately (entry not expired)
    expect(result2.count).toBe(1);

    // Give background fetch time to complete
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchCount).toBe(2); // Background refresh fired
  });

  it('withCacheSWR does NOT refresh when entry is far from expiry', async () => {
    const { createCache, withCacheSWR } = await import('../../directus-cms-cache/src/index.js');
    const cache = createCache<any>({ ttl: 10_000 }); // 10s TTL
    const key = {};
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      return { count: fetchCount };
    };

    // Prime the cache
    await withCacheSWR(cache, key, fetcher);
    expect(fetchCount).toBe(1);

    // staleThreshold=100ms, remaining ~10s → should NOT trigger refresh
    const result2 = await withCacheSWR(cache, key, fetcher, 100);
    expect(result2.count).toBe(1);

    await new Promise((r) => setTimeout(r, 50));
    expect(fetchCount).toBe(1); // No background refresh
  });

  it('cache.invalidate() removes entry', async () => {
    const { createCache } = await import('../../directus-cms-cache/src/index.js');
    const cache = createCache<string>({ ttl: 5000 });
    const key = {};

    cache.set(key, 'data');
    expect(cache.has(key)).toBe(true);

    cache.invalidate(key);
    expect(cache.has(key)).toBe(false);
    expect(cache.get(key)).toBeNull();
  });
});

// ============================================================================
// 7. CROSS-FEATURE INTEGRATION
// ============================================================================
describe('Cross-feature integration', () => {
  it('search finds posts that tags can also retrieve by tag', async () => {
    const { createSearchClient } = await import('../../directus-cms-search/src/index.js');
    const { createTagClient } = await import('../../directus-cms-tags/src/index.js');

    const searchClient = createSearchClient({
      directus: publicClient as any,
      directusUrl: DIRECTUS_URL,
      collections: [
        {
          collection: `${PREFIX}_posts`,
          type: 'post',
          searchFields: ['title', 'content'],
          resultFields: ['id', 'title', 'slug'],
          titleField: 'title',
          slugField: 'slug',
          baseFilter: { status: { _eq: 'published' } },
          urlPrefix: '/blog',
        },
      ],
    });

    const tagClient = createTagClient({
      directus: publicClient as any,
      directusUrl: DIRECTUS_URL,
      collections: { posts: `${PREFIX}_posts` },
    });

    // Search for "directus"
    const searchRes = await searchClient.search('Directus');
    const searchSlugs = searchRes.results.map((r: any) => r.slug);

    // Get posts by "directus" tag
    const taggedPosts = await tagClient.getPostsByTag('directus');
    const tagSlugs = taggedPosts.map((p: any) => p.slug);

    // The "Building with Directus" post should appear in both
    expect(searchSlugs).toContain('building-with-directus');
    expect(tagSlugs).toContain('building-with-directus');
  });

  it('preview can fetch draft content that search (public) cannot see', async () => {
    if (!ADMIN_TOKEN) return;

    const { createSearchClient } = await import('../../directus-cms-search/src/index.js');
    const { createPreviewClient } = await import('../../directus-cms-preview/src/index.js');

    const searchClient = createSearchClient({
      directus: publicClient as any,
      directusUrl: DIRECTUS_URL,
      collections: [
        {
          collection: `${PREFIX}_posts`,
          type: 'post',
          searchFields: ['title'],
          resultFields: ['id', 'title', 'slug'],
          titleField: 'title',
          slugField: 'slug',
          baseFilter: { status: { _eq: 'published' } },
          urlPrefix: '/blog',
        },
      ],
    });

    const previewClient = createPreviewClient({
      directus: adminClient as any,
      directusUrl: DIRECTUS_URL,
      collections: { posts: `${PREFIX}_posts` },
      previewSecret: PREVIEW_SECRET,
    });

    // Draft post should not appear in search
    const searchRes = await searchClient.search('Draft Post Example');
    const searchSlugs = searchRes.results.map((r: any) => r.slug);
    expect(searchSlugs).not.toContain('draft-post-example');

    // But preview can fetch it
    const draft = await previewClient.getPreviewPost('draft-post-example');
    expect(draft).not.toBeNull();
    expect(draft.status).toBe('draft');
  });

  it('SEO generates valid FAQPage from live post faqs_json', async () => {
    const { createSeoClient } = await import('../../directus-cms-seo/src/index.js');
    const seoClient = createSeoClient({
      baseUrl: 'https://e2e-test.example.com',
      siteName: 'E2E Test',
    });

    // Fetch real FAQs from live post
    const res = await fetch(
      `${DIRECTUS_URL}/items/${PREFIX}_posts?filter[slug][_eq]=how-to-setup-product-categories&fields=faqs_json,howto_json`,
    );
    const data = await res.json();
    const post = data.data[0];

    // Generate FAQPage
    const faqs = JSON.parse(post.faqs_json);
    const faqSchema = seoClient.generateFAQPage({ questions: faqs });
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(faqSchema.mainEntity).toHaveLength(2);

    // Generate HowTo
    const howto = JSON.parse(post.howto_json);
    const howtoSchema = seoClient.generateHowTo(howto);
    expect(howtoSchema['@type']).toBe('HowTo');
    expect(howtoSchema.step).toHaveLength(4);
  });
});
