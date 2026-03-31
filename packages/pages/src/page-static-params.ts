import { readItems } from '@directus/sdk';
import type { PageConfig } from './types';

export async function getPageStaticParams(config: PageConfig): Promise<{ slug: string }[]> {
  const filter: Record<string, any> = { status: { _eq: 'published' } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.pages as any, {
      fields: ['slug'],
      filter,
      limit: -1,
    } as any)
  ) as unknown as { slug: string }[];

  return items.map((item) => ({ slug: item.slug }));
}
