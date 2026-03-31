import { describe, it, expect, vi } from 'vitest';
import { createWebhookHandler } from '../../directus-cms-webhooks/src/handler.js';
import { verifySignature } from '../../directus-cms-webhooks/src/signature.js';
import { defaultCollectionMappings } from '../../directus-cms-webhooks/src/collection-map.js';
import { createWebhookClient } from '../../directus-cms-webhooks/src/index.js';
import type { WebhookConfig, DirectusWebhookPayload } from '../../directus-cms-webhooks/src/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sign a payload string using HMAC-SHA256 and return the hex signature. */
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Create a mock Request object. */
function createRequest(
  method: string,
  body?: string,
  headers?: Record<string, string>,
): Request {
  return new Request('http://localhost/api/webhooks', {
    method,
    body,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** Create a signed POST request. */
async function createSignedRequest(body: string, secret: string): Promise<Request> {
  const signature = await signPayload(body, secret);
  return createRequest('POST', body, { 'X-Directus-Signature': signature });
}

function createPayload(overrides: Partial<DirectusWebhookPayload> = {}): DirectusWebhookPayload {
  return {
    event: 'items.create',
    collection: 'test_posts',
    key: '1',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// verifySignature (HMAC-SHA256)
// ---------------------------------------------------------------------------
describe('verifySignature', () => {
  it('returns true for a valid signature (sign then verify)', async () => {
    const secret = 'webhook-secret';
    const payload = JSON.stringify({ event: 'items.create', collection: 'posts' });
    const signature = await signPayload(payload, secret);

    const result = await verifySignature(payload, signature, secret);
    expect(result).toBe(true);
  });

  it('returns false for an invalid signature', async () => {
    const payload = JSON.stringify({ event: 'items.create', collection: 'posts' });
    const result = await verifySignature(payload, 'deadbeef0123456789abcdef', 'secret');
    expect(result).toBe(false);
  });

  it('returns false for wrong secret', async () => {
    const payload = JSON.stringify({ event: 'items.create', collection: 'posts' });
    const signature = await signPayload(payload, 'correct-secret');

    const result = await verifySignature(payload, signature, 'wrong-secret');
    expect(result).toBe(false);
  });

  it('returns false for tampered payload', async () => {
    const originalPayload = JSON.stringify({ event: 'items.create', collection: 'posts' });
    const secret = 'my-secret';
    const signature = await signPayload(originalPayload, secret);

    const tamperedPayload = JSON.stringify({ event: 'items.delete', collection: 'posts' });
    const result = await verifySignature(tamperedPayload, signature, secret);
    expect(result).toBe(false);
  });

  it('returns false for empty signature', async () => {
    const payload = JSON.stringify({ event: 'items.create' });
    const result = await verifySignature(payload, '', 'secret');
    expect(result).toBe(false);
  });

  it('returns false for non-hex signature', async () => {
    const payload = JSON.stringify({ event: 'items.create' });
    const result = await verifySignature(payload, 'not-a-hex-string!', 'secret');
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// defaultCollectionMappings
// ---------------------------------------------------------------------------
describe('defaultCollectionMappings', () => {
  const prefix = 'mysite';
  const mappings = defaultCollectionMappings(prefix);

  it('returns mappings for all expected collections', () => {
    const collectionNames = mappings.map((m) => m.collection);
    expect(collectionNames).toContain('mysite_posts');
    expect(collectionNames).toContain('mysite_blog_categories');
    expect(collectionNames).toContain('mysite_settings');
    expect(collectionNames).toContain('mysite_products');
    expect(collectionNames).toContain('mysite_categories');
    expect(collectionNames).toContain('mysite_pages');
    expect(collectionNames).toContain('mysite_navigation_items');
    expect(collectionNames).toContain('mysite_banners');
    expect(collectionNames).toContain('mysite_redirects');
  });

  it('each mapping has collection prefixed with the given prefix', () => {
    for (const mapping of mappings) {
      expect(mapping.collection).toMatch(new RegExp(`^${prefix}_`));
    }
  });

  it('each mapping has at least one action', () => {
    for (const mapping of mappings) {
      expect(mapping.actions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('posts mapping includes revalidatePath /blog and revalidateTag posts', () => {
    const postsMapping = mappings.find((m) => m.collection === 'mysite_posts')!;
    expect(postsMapping).toBeDefined();

    const pathActions = postsMapping.actions.filter(
      (a) => a.type === 'revalidatePath' && 'path' in a && a.path === '/blog',
    );
    expect(pathActions.length).toBeGreaterThanOrEqual(1);

    const tagActions = postsMapping.actions.filter(
      (a) => a.type === 'revalidateTag' && 'tag' in a && a.tag === 'posts',
    );
    expect(tagActions.length).toBeGreaterThanOrEqual(1);
  });

  it('posts mapping includes revalidatePath /sitemap.xml', () => {
    const postsMapping = mappings.find((m) => m.collection === 'mysite_posts')!;
    const sitemapAction = postsMapping.actions.find(
      (a) => a.type === 'revalidatePath' && 'path' in a && a.path === '/sitemap.xml',
    );
    expect(sitemapAction).toBeDefined();
  });

  it('products mapping includes revalidatePath /products and revalidateTag products', () => {
    const productsMapping = mappings.find((m) => m.collection === 'mysite_products')!;
    expect(productsMapping).toBeDefined();

    const pathActions = productsMapping.actions.filter(
      (a) => a.type === 'revalidatePath' && 'path' in a && a.path === '/products',
    );
    expect(pathActions.length).toBeGreaterThanOrEqual(1);

    const tagActions = productsMapping.actions.filter(
      (a) => a.type === 'revalidateTag' && 'tag' in a && a.tag === 'products',
    );
    expect(tagActions.length).toBeGreaterThanOrEqual(1);
  });

  it('works with different prefixes', () => {
    const customMappings = defaultCollectionMappings('acme');
    const collectionNames = customMappings.map((m) => m.collection);
    expect(collectionNames).toContain('acme_posts');
    expect(collectionNames).toContain('acme_products');
    expect(collectionNames).toContain('acme_settings');

    for (const mapping of customMappings) {
      expect(mapping.collection).toMatch(/^acme_/);
    }
  });
});

// ---------------------------------------------------------------------------
// createWebhookHandler — HTTP handling
// ---------------------------------------------------------------------------
describe('createWebhookHandler — HTTP handling', () => {
  // Use only custom handler actions to avoid needing next/cache
  function createTestConfig(overrides: Partial<WebhookConfig> = {}): WebhookConfig {
    return {
      secret: 'test-secret',
      mappings: [
        {
          collection: 'test_posts',
          actions: [{ type: 'custom', handler: vi.fn() }],
        },
      ],
      ...overrides,
    };
  }

  it('rejects non-POST with 405', async () => {
    const handler = createWebhookHandler(createTestConfig());
    const request = createRequest('GET');
    const response = await handler(request);

    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error).toBe('Method not allowed');
  });

  it('rejects PUT with 405', async () => {
    const handler = createWebhookHandler(createTestConfig());
    const request = createRequest('PUT', JSON.stringify(createPayload()));
    const response = await handler(request);

    expect(response.status).toBe(405);
  });

  it('rejects empty body with 400', async () => {
    const handler = createWebhookHandler(createTestConfig());
    const request = new Request('http://localhost/api/webhooks', {
      method: 'POST',
      // No body at all
    });
    const response = await handler(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Empty request body');
  });

  it('rejects invalid JSON with 400', async () => {
    const config = createTestConfig();
    const handler = createWebhookHandler(config);
    const badBody = '{not valid json!!!';
    const request = await createSignedRequest(badBody, config.secret);
    const response = await handler(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid JSON payload');
  });

  it('processes valid payload and returns 200 with actionsExecuted count', async () => {
    const customHandler = vi.fn();
    const config = createTestConfig({
      mappings: [
        {
          collection: 'test_posts',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    });

    const handler = createWebhookHandler(config);
    const payload = createPayload();
    const payloadStr = JSON.stringify(payload);
    const request = await createSignedRequest(payloadStr, config.secret);
    const response = await handler(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.actionsExecuted).toBe(1);
    expect(customHandler).toHaveBeenCalledOnce();
  });

  it('returns 200 with 0 actions when no mappings match', async () => {
    const config = createTestConfig({
      mappings: [
        {
          collection: 'other_collection',
          actions: [{ type: 'custom', handler: vi.fn() }],
        },
      ],
    });

    const handler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'test_posts' });
    const payloadStr = JSON.stringify(payload);
    const request = await createSignedRequest(payloadStr, config.secret);
    const response = await handler(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.actionsExecuted).toBe(0);
  });

  it('rejects request with missing signature header', async () => {
    const config = createTestConfig();
    const handler = createWebhookHandler(config);

    const payload = JSON.stringify(createPayload());
    const request = createRequest('POST', payload);
    const response = await handler(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing signature');
  });

  it('rejects request with invalid signature when signature header present', async () => {
    const config = createTestConfig();
    const handler = createWebhookHandler(config);

    const payload = JSON.stringify(createPayload());
    const request = createRequest('POST', payload, {
      'X-Directus-Signature': 'deadbeef00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbcc',
    });
    const response = await handler(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid signature');
  });

  it('accepts request with valid signature header', async () => {
    const secret = 'webhook-secret';
    const customHandler = vi.fn();
    const config = createTestConfig({
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    });

    const handler = createWebhookHandler(config);
    const payloadStr = JSON.stringify(createPayload());
    const signature = await signPayload(payloadStr, secret);

    const request = createRequest('POST', payloadStr, {
      'X-Directus-Signature': signature,
    });
    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(customHandler).toHaveBeenCalledOnce();
  });

  it('calls onInvalidSignature callback when signature is invalid', async () => {
    const onInvalidSignature = vi.fn();
    const config = createTestConfig({ onInvalidSignature });

    const handler = createWebhookHandler(config);
    const payloadStr = JSON.stringify(createPayload());
    const request = createRequest('POST', payloadStr, {
      'X-Directus-Signature': 'deadbeef00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbcc',
    });

    await handler(request);
    expect(onInvalidSignature).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// createWebhookHandler — mapping matching
// ---------------------------------------------------------------------------
describe('createWebhookHandler — mapping matching', () => {
  it('matches exact collection name', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'site_posts',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'site_posts' });
    const payloadStr = JSON.stringify(payload);
    await handler(await createSignedRequest(payloadStr, secret));

    expect(customHandler).toHaveBeenCalledOnce();
    expect(customHandler).toHaveBeenCalledWith(payload);
  });

  it('does not match different collection name', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'site_posts',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'other_posts' });
    const payloadStr = JSON.stringify(payload);
    await handler(await createSignedRequest(payloadStr, secret));

    expect(customHandler).not.toHaveBeenCalled();
  });

  it('matches wildcard prefix (e.g. "mysite_*" matches "mysite_posts")', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'mysite_*',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'mysite_posts' });
    const payloadStr = JSON.stringify(payload);
    await handler(await createSignedRequest(payloadStr, secret));

    expect(customHandler).toHaveBeenCalledOnce();
  });

  it('wildcard prefix matches multiple collection names', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'mysite_*',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);

    // Test with products
    const payload1 = createPayload({ collection: 'mysite_products' });
    await handler(await createSignedRequest(JSON.stringify(payload1), secret));
    expect(customHandler).toHaveBeenCalledTimes(1);

    // Test with settings
    const payload2 = createPayload({ collection: 'mysite_settings' });
    await handler(await createSignedRequest(JSON.stringify(payload2), secret));
    expect(customHandler).toHaveBeenCalledTimes(2);
  });

  it('wildcard does not match collections without the prefix', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'mysite_*',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'othersite_posts' });
    await handler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(customHandler).not.toHaveBeenCalled();
  });

  it('filters by event type when events array is specified', async () => {
    const createHandler = vi.fn();
    const updateHandler = vi.fn();
    const secret = 'secret';

    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          events: ['items.create'],
          actions: [{ type: 'custom', handler: createHandler }],
        },
        {
          collection: 'test_posts',
          events: ['items.update'],
          actions: [{ type: 'custom', handler: updateHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);

    // Send a create event
    const createPayloadData = createPayload({ event: 'items.create' });
    await handler(await createSignedRequest(JSON.stringify(createPayloadData), secret));

    expect(createHandler).toHaveBeenCalledOnce();
    expect(updateHandler).not.toHaveBeenCalled();

    // Send an update event
    const updatePayloadData = createPayload({ event: 'items.update' });
    await handler(await createSignedRequest(JSON.stringify(updatePayloadData), secret));

    expect(createHandler).toHaveBeenCalledOnce(); // Still 1
    expect(updateHandler).toHaveBeenCalledOnce();
  });

  it('matches all events when events array is not specified', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          // No events filter
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);

    await handler(await createSignedRequest(JSON.stringify(createPayload({ event: 'items.create' })), secret));
    await handler(await createSignedRequest(JSON.stringify(createPayload({ event: 'items.update' })), secret));
    await handler(await createSignedRequest(JSON.stringify(createPayload({ event: 'items.delete' })), secret));

    expect(customHandler).toHaveBeenCalledTimes(3);
  });

  it('does not match when event is not in the events filter', async () => {
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          events: ['items.create'],
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload({ event: 'items.delete' });
    await handler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(customHandler).not.toHaveBeenCalled();
  });

  it('calls onWebhook callback with payload and action count', async () => {
    const onWebhook = vi.fn();
    const customHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [
            { type: 'custom', handler: customHandler },
          ],
        },
      ],
      onWebhook,
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload();
    await handler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(onWebhook).toHaveBeenCalledOnce();
    expect(onWebhook).toHaveBeenCalledWith(payload, 1);
  });

  it('calls onWebhook with 0 when no mappings match', async () => {
    const onWebhook = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'unrelated_collection',
          actions: [{ type: 'custom', handler: vi.fn() }],
        },
      ],
      onWebhook,
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'test_posts' });
    await handler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(onWebhook).toHaveBeenCalledWith(payload, 0);
  });

  it('calls custom handler actions with the payload', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [
            { type: 'custom', handler: handler1 },
            { type: 'custom', handler: handler2 },
          ],
        },
      ],
    };

    const webhookHandler = createWebhookHandler(config);
    const payload = createPayload();
    const response = await webhookHandler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.actionsExecuted).toBe(2);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler1).toHaveBeenCalledWith(payload);
    expect(handler2).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledWith(payload);
  });

  it('multiple mappings can match the same payload', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [{ type: 'custom', handler: handler1 }],
        },
        {
          collection: 'test_*',
          actions: [{ type: 'custom', handler: handler2 }],
        },
      ],
    };

    const webhookHandler = createWebhookHandler(config);
    const payload = createPayload({ collection: 'test_posts' });
    const response = await webhookHandler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.actionsExecuted).toBe(2);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('continues executing actions even if one custom handler throws', async () => {
    const failingHandler = vi.fn().mockRejectedValue(new Error('handler error'));
    const successHandler = vi.fn();
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [
            { type: 'custom', handler: failingHandler },
            { type: 'custom', handler: successHandler },
          ],
        },
      ],
    };

    const webhookHandler = createWebhookHandler(config);
    const payload = createPayload();
    const response = await webhookHandler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(response.status).toBe(200);
    expect(failingHandler).toHaveBeenCalledOnce();
    expect(successHandler).toHaveBeenCalledOnce();
  });

  it('uses custom logger when provided', async () => {
    const logger = { info: vi.fn(), error: vi.fn() };
    const secret = 'secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [{ type: 'custom', handler: vi.fn() }],
        },
      ],
      logger,
    };

    const handler = createWebhookHandler(config);
    const payload = createPayload();
    await handler(await createSignedRequest(JSON.stringify(payload), secret));

    expect(logger.info).toHaveBeenCalled();
    // Should log event info and actions executed
    const calls = logger.info.mock.calls.map((c: any) => c[0]);
    expect(calls.some((msg: string) => msg.includes('items.create'))).toBe(true);
    expect(calls.some((msg: string) => msg.includes('1 actions'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createWebhookClient
// ---------------------------------------------------------------------------
describe('createWebhookClient', () => {
  it('returns client with config and handleWebhook method', () => {
    const config: WebhookConfig = {
      secret: 'test-secret',
      mappings: [],
    };

    const client = createWebhookClient(config);
    expect(client).toHaveProperty('config');
    expect(client).toHaveProperty('handleWebhook');
    expect(client.config).toBe(config);
    expect(typeof client.handleWebhook).toBe('function');
  });

  it('handleWebhook processes requests correctly', async () => {
    const customHandler = vi.fn();
    const secret = 'test-secret';
    const config: WebhookConfig = {
      secret,
      mappings: [
        {
          collection: 'test_posts',
          actions: [{ type: 'custom', handler: customHandler }],
        },
      ],
    };

    const client = createWebhookClient(config);
    const payload = createPayload();
    const request = await createSignedRequest(JSON.stringify(payload), secret);
    const response = await client.handleWebhook(request);

    expect(response.status).toBe(200);
    expect(customHandler).toHaveBeenCalledOnce();
  });

  it('handleWebhook rejects non-POST requests', async () => {
    const config: WebhookConfig = {
      secret: 'test-secret',
      mappings: [],
    };

    const client = createWebhookClient(config);
    const request = createRequest('GET');
    const response = await client.handleWebhook(request);

    expect(response.status).toBe(405);
  });

  it('preserves config reference', () => {
    const config: WebhookConfig = {
      secret: 'unique-secret-123',
      mappings: [
        {
          collection: 'my_collection',
          actions: [{ type: 'custom', handler: vi.fn() }],
        },
      ],
    };

    const client = createWebhookClient(config);
    expect(client.config.secret).toBe('unique-secret-123');
    expect(client.config.mappings).toHaveLength(1);
    expect(client.config.mappings[0].collection).toBe('my_collection');
  });
});
