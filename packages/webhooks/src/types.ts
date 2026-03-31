export type DirectusEvent =
  | 'items.create'
  | 'items.update'
  | 'items.delete'
  | 'items.sort';

export interface DirectusWebhookPayload {
  /** The Directus event type that triggered this webhook (e.g. 'items.create') */
  event: DirectusEvent;
  /** Directus collection name where the event occurred */
  collection: string;
  /** Primary key of the affected item (for single-item operations) */
  key?: string | number;
  /** Primary keys of affected items (for batch operations) */
  keys?: (string | number)[];
  /** The item data sent by Directus (fields that were created/updated) */
  payload?: Record<string, any>;
}

export type WebhookAction =
  | {
      /** Revalidate a specific Next.js page or layout path */
      type: 'revalidatePath';
      /** The URL path to revalidate (e.g. '/blog/my-post') */
      path: string;
      /** Whether to revalidate just the page or the entire layout tree (default: 'page') */
      mode?: 'page' | 'layout';
    }
  | {
      /** Revalidate all entries associated with a Next.js cache tag */
      type: 'revalidateTag';
      /** The cache tag to invalidate (e.g. 'posts', 'products') */
      tag: string;
    }
  | {
      /** Execute a custom handler function with the full webhook payload */
      type: 'custom';
      /** Async or sync function to run when this action is triggered */
      handler: (payload: DirectusWebhookPayload) => Promise<void> | void;
    };

export interface CollectionMapping {
  /** Exact collection name or prefix with wildcard (e.g. 'mysite_*') */
  collection: string;
  /** Filter by specific events (undefined = all events) */
  events?: DirectusEvent[];
  /** Actions to execute when this mapping matches */
  actions: WebhookAction[];
}

export interface WebhookConfig {
  /** Shared secret for HMAC signature validation */
  secret: string;
  /** Collection-to-action mappings */
  mappings: CollectionMapping[];
  /** Callback on successful webhook processing */
  onWebhook?: (payload: DirectusWebhookPayload, actionsExecuted: number) => void;
  /** Callback on signature validation failure */
  onInvalidSignature?: (request: Request) => void;
  /** Custom logger */
  logger?: { info: (msg: string) => void; error: (msg: string) => void };
}

export interface WebhookClient {
  /** The bound webhook configuration */
  config: WebhookConfig;
  /** Process an incoming webhook Request: validates the HMAC signature, matches mappings, and executes actions */
  handleWebhook: (request: Request) => Promise<Response>;
}
