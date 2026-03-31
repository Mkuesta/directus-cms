import type { WebhookConfig, WebhookClient } from './types.js';
import { createWebhookHandler } from './handler.js';

export function createWebhookClient(config: WebhookConfig): WebhookClient {
  return {
    config,
    handleWebhook: createWebhookHandler(config),
  };
}

export type {
  WebhookConfig,
  WebhookClient,
  CollectionMapping,
  WebhookAction,
  DirectusEvent,
  DirectusWebhookPayload,
} from './types.js';

export { createWebhookHandler } from './handler.js';
export { verifySignature } from './signature.js';
export { defaultCollectionMappings } from './collection-map.js';
export { executeActions } from './revalidation.js';
