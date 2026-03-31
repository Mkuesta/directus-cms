import type { WebhookConfig, DirectusWebhookPayload, CollectionMapping } from './types.js';
import { verifySignature } from './signature.js';
import { executeActions } from './revalidation.js';

/**
 * Create a Next.js route handler for Directus webhooks.
 */
export function createWebhookHandler(config: WebhookConfig) {
  return async (request: Request): Promise<Response> => {
    const log = config.logger || { info: () => {}, error: () => {} };

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Read body
    const body = await request.text();
    if (!body) {
      return new Response(
        JSON.stringify({ error: 'Empty request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Verify signature
    const signature = request.headers.get('X-Directus-Signature') || request.headers.get('x-directus-signature');
    if (!signature) {
      log.error('Missing webhook signature header');
      config.onInvalidSignature?.(request);
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const valid = await verifySignature(body, signature, config.secret);
    if (!valid) {
      log.error('Invalid webhook signature');
      config.onInvalidSignature?.(request);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse payload
    let payload: DirectusWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    log.info(`Webhook: ${payload.event} on ${payload.collection}`);

    // Find matching mappings
    const matchingMappings = findMatchingMappings(config.mappings, payload);

    // Execute all actions from matching mappings
    let totalActionsExecuted = 0;
    for (const mapping of matchingMappings) {
      const executed = await executeActions(mapping.actions, payload, log);
      totalActionsExecuted += executed;
    }

    log.info(`Executed ${totalActionsExecuted} actions`);
    config.onWebhook?.(payload, totalActionsExecuted);

    return new Response(
      JSON.stringify({ success: true, actionsExecuted: totalActionsExecuted }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };
}

function findMatchingMappings(
  mappings: CollectionMapping[],
  payload: DirectusWebhookPayload,
): CollectionMapping[] {
  return mappings.filter((mapping) => {
    // Check collection match (exact or wildcard prefix)
    const collectionMatch = mapping.collection.endsWith('*')
      ? payload.collection.startsWith(mapping.collection.slice(0, -1))
      : mapping.collection === payload.collection;

    if (!collectionMatch) return false;

    // Check event filter
    if (mapping.events && !mapping.events.includes(payload.event)) {
      return false;
    }

    return true;
  });
}
