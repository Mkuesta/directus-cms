import type { NotificationConfig, NotificationClient } from './types';
import { getTemplates, getTemplate } from './templates';

/**
 * Creates a notification client for CMS-managed notification templates.
 *
 * The client is optional — you can use `<NotificationProvider>` and `useNotification()`
 * from `@mkuesta/notifications/components` without it for purely client-side
 * toast notifications.
 *
 * Usage:
 *   const notifications = createNotificationClient({
 *     directus,
 *     collections: { templates: `${PREFIX}_notification_templates` },
 *   });
 *   const templates = await notifications.getTemplates();
 */
export function createNotificationClient(config: NotificationConfig): NotificationClient {
  return {
    config,
    getTemplates: () => getTemplates(config),
    getTemplate: (slug) => getTemplate(config, slug),
  };
}

// Re-export all types
export type {
  NotificationConfig,
  NotificationCollections,
  NotificationClient,
  NotificationType,
  NotificationPosition,
  Notification,
  NotifyOptions,
  NotificationContextValue,
  DirectusNotificationTemplate,
  NotificationTemplate,
} from './types';

// Re-export standalone functions (server-safe, no React)
export { getTemplates, getTemplate } from './templates';
