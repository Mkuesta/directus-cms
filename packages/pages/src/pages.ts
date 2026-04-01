import { readItems } from '@directus/sdk';
import { processArticleContent } from '@mkuesta/core';
import type { PageConfig, DirectusPage, Page } from './types';

function getAssetUrl(config: PageConfig, fileId: string | undefined | null): string | undefined {
  if (!fileId) return undefined;
  return `${config.directusUrl}/assets/${fileId}`;
}

function transformPage(config: PageConfig, raw: DirectusPage): Page {
  const processed = raw.content ? processArticleContent(raw.content) : undefined;

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    content: raw.content,
    html: processed?.html,
    headings: processed?.headings,
    excerpt: raw.excerpt,
    featuredImageUrl: raw.featured_image ? getAssetUrl(config, raw.featured_image.id) : undefined,
    parentId: raw.parent_id,
    template: raw.template,
    status: raw.status,
    sort: raw.sort ?? 0,
    seo: {
      title: raw.seo_title,
      description: raw.seo_description,
      keywords: raw.seo_keywords,
    },
    metaRobots: raw.meta_robots,
    ogImageUrl: raw.og_image ? getAssetUrl(config, raw.og_image.id) : undefined,
    publishedDate: raw.published_date,
    updatedDate: raw.updated_date,
  };
}

async function fetchPages(config: PageConfig): Promise<DirectusPage[]> {
  const filter: Record<string, any> = { status: { _eq: 'published' } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  return await config.directus.request(
    readItems(config.collections.pages as any, {
      fields: [
        'id',
        'title',
        'slug',
        'content',
        'excerpt',
        { featured_image: ['id'] },
        'parent_id',
        'template',
        'status',
        'sort',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'meta_robots',
        { og_image: ['id'] },
        'published_date',
        'updated_date',
        'site',
      ],
      filter,
      sort: ['sort', 'title'],
      limit: -1,
    } as any)
  ) as unknown as DirectusPage[];
}

export async function getPage(config: PageConfig, slug: string): Promise<Page | null> {
  const filter: Record<string, any> = {
    status: { _eq: 'published' },
    slug: { _eq: slug },
  };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.pages as any, {
      fields: [
        'id',
        'title',
        'slug',
        'content',
        'excerpt',
        { featured_image: ['id'] },
        'parent_id',
        'template',
        'status',
        'sort',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'meta_robots',
        { og_image: ['id'] },
        'published_date',
        'updated_date',
        'site',
      ],
      filter,
      limit: 1,
    } as any)
  ) as unknown as DirectusPage[];

  if (!items.length) return null;
  return transformPage(config, items[0]);
}

export async function getPages(config: PageConfig): Promise<Page[]> {
  const raw = await fetchPages(config);
  return raw.map((item) => transformPage(config, item));
}

export async function getPageTree(config: PageConfig): Promise<Page[]> {
  const pages = await getPages(config);

  const map = new Map<number, Page>();
  const roots: Page[] = [];

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = map.get(page.id)!;
    if (page.parentId != null && map.has(page.parentId)) {
      map.get(page.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
