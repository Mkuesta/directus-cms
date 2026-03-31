import { revalidatePath, revalidateTag } from 'next/cache';
import type { WebhookAction, DirectusWebhookPayload } from './types.js';

type Logger = { info: (msg: string) => void; error: (msg: string) => void };

/**
 * Execute a list of webhook actions.
 */
export async function executeActions(
  actions: WebhookAction[],
  payload: DirectusWebhookPayload,
  logger?: Logger,
): Promise<number> {
  let executed = 0;

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'revalidatePath':
          revalidatePath(action.path, action.mode);
          executed++;
          break;
        case 'revalidateTag':
          revalidateTag(action.tag);
          executed++;
          break;
        case 'custom':
          await action.handler(payload);
          executed++;
          break;
      }
    } catch (err) {
      logger?.error(`Webhook action ${action.type} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return executed;
}
