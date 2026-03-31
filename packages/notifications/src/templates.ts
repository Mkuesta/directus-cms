import { readItems } from '@directus/sdk';
import type {
  NotificationConfig,
  DirectusNotificationTemplate,
  NotificationTemplate,
} from './types';

function transformTemplate(raw: DirectusNotificationTemplate): NotificationTemplate {
  return {
    id: raw.id,
    slug: raw.slug,
    type: raw.type,
    title: raw.title ?? undefined,
    message: raw.message,
    duration: raw.duration ?? undefined,
    status: raw.status,
  };
}

export async function getTemplates(config: NotificationConfig): Promise<NotificationTemplate[]> {
  if (!config.directus || !config.collections) return [];

  const filter: Record<string, any> = { status: { _eq: 'active' } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.templates as any, {
      fields: ['id', 'slug', 'type', 'title', 'message', 'duration', 'status', 'site'],
      filter,
      sort: ['slug'],
    } as any)
  ) as unknown as DirectusNotificationTemplate[];

  return items.map(transformTemplate);
}

export async function getTemplate(
  config: NotificationConfig,
  slug: string,
): Promise<NotificationTemplate | null> {
  if (!config.directus || !config.collections) return null;

  const filter: Record<string, any> = {
    slug: { _eq: slug },
    status: { _eq: 'active' },
  };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.templates as any, {
      fields: ['id', 'slug', 'type', 'title', 'message', 'duration', 'status', 'site'],
      filter,
      limit: 1,
    } as any)
  ) as unknown as DirectusNotificationTemplate[];

  if (items.length === 0) return null;
  return transformTemplate(items[0]);
}
