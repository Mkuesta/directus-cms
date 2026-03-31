import type { RestClient } from '@directus/sdk';

// ── Notification types ───────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface NotifyOptions {
  type?: NotificationType;
  title?: string;
  /** Duration in milliseconds before auto-dismiss. Default 5000. Set to 0 to disable. */
  duration?: number;
  /** Whether the notification can be dismissed by clicking. Default true. */
  dismissible?: boolean;
}

// ── CMS-managed notification templates (optional) ───────────────────────────

export interface NotificationCollections {
  /** Directus collection name for notification templates (e.g. "notification_templates") */
  templates: string;
}

export interface NotificationConfig {
  /** A Directus SDK client instance (optional — only needed for CMS templates) */
  directus?: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections?: NotificationCollections;
  /** Multi-tenant site ID (optional) */
  siteId?: number;
  /** Default auto-dismiss duration in ms (default 5000) */
  defaultDuration?: number;
  /** Position of the notification container (default 'top-right') */
  position?: NotificationPosition;
}

export interface DirectusNotificationTemplate {
  id: number;
  slug: string;
  type: NotificationType;
  title?: string | null;
  message: string;
  duration?: number | null;
  status: 'active' | 'draft';
  site?: number | null;
}

export interface NotificationTemplate {
  id: number;
  slug: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  status: 'active' | 'draft';
}

// ── NotificationClient: returned by createNotificationClient() ──────────────

export interface NotificationClient {
  config: NotificationConfig;
  /** Get all active notification templates from CMS (requires directus + collections) */
  getTemplates(): Promise<NotificationTemplate[]>;
  /** Get a notification template by slug */
  getTemplate(slug: string): Promise<NotificationTemplate | null>;
}

// ── Context types (for React) ───────────────────────────────────────────────

export interface NotificationContextValue {
  notifications: Notification[];
  notify(message: string, options?: NotifyOptions): string;
  success(message: string, title?: string): string;
  error(message: string, title?: string): string;
  info(message: string, title?: string): string;
  warning(message: string, title?: string): string;
  dismiss(id: string): void;
}
