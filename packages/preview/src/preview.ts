import { readItems, readItem, updateItem } from '@directus/sdk';
import type { PreviewConfig, PreviewItem, ScheduledItem, PublishResult } from './types.js';

/**
 * Fetch a post by slug regardless of status (admin token).
 */
export async function getPreviewPost(
  config: PreviewConfig,
  slug: string,
): Promise<PreviewItem | null> {
  if (!config.collections.posts) return null;
  return fetchPreviewItem(config, config.collections.posts, slug);
}

/**
 * Fetch a product by slug regardless of status.
 */
export async function getPreviewProduct(
  config: PreviewConfig,
  slug: string,
): Promise<PreviewItem | null> {
  if (!config.collections.products) return null;
  return fetchPreviewItem(config, config.collections.products, slug);
}

/**
 * Fetch a page by slug regardless of status.
 */
export async function getPreviewPage(
  config: PreviewConfig,
  slug: string,
): Promise<PreviewItem | null> {
  if (!config.collections.pages) return null;
  return fetchPreviewItem(config, config.collections.pages, slug);
}

async function fetchPreviewItem(
  config: PreviewConfig,
  collection: string,
  slug: string,
): Promise<PreviewItem | null> {
  try {
    const filter: Record<string, any> = { slug: { _eq: slug } };
    if (config.siteId != null) {
      filter.site = { _eq: config.siteId };
    }

    const items = await config.directus.request(
      readItems(collection as any, {
        fields: [
          'id', 'title', 'slug', 'content', 'status', 'excerpt',
          'featured_image', 'published_date', 'updated_date', 'scheduled_publish_date',
        ],
        filter,
        limit: 1,
      } as any),
    ) as unknown as any[];

    if (!items?.length) return null;

    const item = items[0];
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      content: item.content || undefined,
      status: item.status,
      excerpt: item.excerpt || undefined,
      featuredImage: item.featured_image
        ? (typeof item.featured_image === 'string'
          ? `${config.directusUrl}/assets/${item.featured_image}`
          : item.featured_image?.id
            ? `${config.directusUrl}/assets/${item.featured_image.id}`
            : undefined)
        : undefined,
      publishedDate: item.published_date || undefined,
      updatedDate: item.updated_date || undefined,
      scheduledPublishDate: item.scheduled_publish_date || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Get all content with a scheduled_publish_date that has passed but status is still draft.
 */
export async function getScheduledContent(
  config: PreviewConfig,
): Promise<ScheduledItem[]> {
  const now = new Date().toISOString();
  const results: ScheduledItem[] = [];

  const collections = [
    { name: config.collections.posts, label: 'posts' },
    { name: config.collections.products, label: 'products' },
    { name: config.collections.pages, label: 'pages' },
  ].filter((c) => c.name);

  for (const col of collections) {
    try {
      const filter: Record<string, any> = {
        _and: [
          { status: { _in: ['draft', 'scheduled'] } },
          { scheduled_publish_date: { _lte: now } },
          { scheduled_publish_date: { _nnull: true } },
        ],
      };

      if (config.siteId != null) {
        filter._and.push({ site: { _eq: config.siteId } });
      }

      const items = await config.directus.request(
        readItems(col.name! as any, {
          fields: ['id', 'title', 'slug', 'scheduled_publish_date', 'status'],
          filter,
          limit: -1,
        } as any),
      ) as unknown as any[];

      for (const item of items) {
        results.push({
          id: item.id,
          collection: col.label,
          title: item.title,
          slug: item.slug,
          scheduledPublishDate: item.scheduled_publish_date,
          status: item.status,
        });
      }
    } catch {
      // Skip collections that error
    }
  }

  return results;
}

/**
 * Publish all content whose scheduled_publish_date has passed.
 */
export async function publishScheduledContent(
  config: PreviewConfig,
): Promise<PublishResult> {
  const scheduled = await getScheduledContent(config);
  let published = 0;
  const errors: string[] = [];

  // Map label back to collection name
  const collectionMap: Record<string, string> = {};
  if (config.collections.posts) collectionMap.posts = config.collections.posts;
  if (config.collections.products) collectionMap.products = config.collections.products;
  if (config.collections.pages) collectionMap.pages = config.collections.pages;

  for (const item of scheduled) {
    const collection = collectionMap[item.collection];
    if (!collection) continue;

    try {
      await config.directus.request(
        updateItem(collection as any, item.id, {
          status: 'published',
          published_date: item.scheduledPublishDate || new Date().toISOString(),
        } as any),
      );
      published++;
    } catch (err) {
      errors.push(`Failed to publish ${item.collection}/${item.slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { published, errors };
}
