import { readItems } from '@directus/sdk';
import { getDirectusAssetUrl } from './images';
import { remapItem, remapFilter, remapSort } from './field-mapping';
import type {
  CmsConfig,
  DirectusPost,
  DirectusBlogCategory,
  Post,
  BlogCategory,
  FAQItem,
  HowToStep,
  TableItem,
  ItemListData,
} from './types';

/** Known post fields for extras detection */
const KNOWN_POST_FIELDS = new Set([
  'id', 'title', 'slug', 'excerpt', 'content', 'author', 'author_title',
  'author_type', 'author_image', 'author_url', 'author_twitter',
  'author_image_url', 'published_date', 'updated_date',
  'scheduled_publish_date', 'status', 'category', 'tags', 'read_time',
  'article_type', 'featured_image', 'featured_image_url',
  'seo_title', 'seo_description', 'seo_keywords', 'meta_description',
  'meta_robots', 'meta_tags', 'canonical_url', 'og_image', 'og_image_alt',
  'og_title', 'og_description', 'twitter_title', 'twitter_description',
  'twitter_image', 'twitter_image_alt', 'faqs_json', 'howto_json',
  'tables_json', 'itemlists_json', 'language', 'site',
]);

// Category lookup cache (populated per-request, keyed by config identity)
const _categoryCaches = new WeakMap<object, Map<string, BlogCategory>>();

async function getCategoryLookup(config: CmsConfig): Promise<Map<string, BlogCategory>> {
  const existing = _categoryCaches.get(config.directus);
  if (existing) return existing;
  const cats = await getBlogCategories(config);
  const map = new Map<string, BlogCategory>();
  for (const c of cats) {
    map.set(c.id, c);
    map.set(c.slug, c);
  }
  _categoryCaches.set(config.directus, map);
  // Clear cache after 60s to avoid stale data
  setTimeout(() => { _categoryCaches.delete(config.directus); }, 60_000);
  return map;
}

function safeJsonParse<T>(json: string | undefined | null): T | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

/**
 * Extract FAQs from content (supports both Markdown and HTML).
 */
export function extractFAQsFromContent(content: string | undefined): FAQItem[] | undefined {
  if (!content) return undefined;

  const isHtml = /<h[23][^>]*>/.test(content);

  if (isHtml) {
    return extractFAQsFromHtml(content);
  }

  const faqMatch = content.match(
    /##\s+(?:Frequently\s+Asked\s+Questions|FAQ)\s*\n([\s\S]*?)(?=\n##\s+[^#]|\n#\s+[^#]|$)/i
  );
  if (!faqMatch) return undefined;

  const section = faqMatch[1];
  const faqs: FAQItem[] = [];

  const h3Pattern = /###\s+(.+?)\n+([\s\S]+?)(?=\n###\s+|$)/g;
  let match;
  while ((match = h3Pattern.exec(section)) !== null) {
    const question = match[1].trim();
    const answer = match[2].replace(/\n{3,}/g, '\n\n').trim();
    if (question && answer) faqs.push({ question, answer });
  }
  if (faqs.length > 0) return faqs;

  const boldPattern = /\*\*(.+?\??)\*\*\s*\n+([\s\S]+?)(?=\n\*\*[^*]+\*\*|\n##|$)/g;
  while ((match = boldPattern.exec(section)) !== null) {
    const question = match[1].trim();
    const answer = match[2].replace(/\n{3,}/g, '\n\n').trim();
    if (question && answer) faqs.push({ question, answer });
  }
  if (faqs.length > 0) return faqs;

  const qLinePattern = /^(.+\?)\s*\n+([\s\S]+?)(?=\n.+\?\s*\n|$)/gm;
  while ((match = qLinePattern.exec(section)) !== null) {
    const question = match[1].trim();
    const answer = match[2].replace(/\n{3,}/g, '\n\n').trim();
    if (question && answer && !question.startsWith('#') && !question.startsWith('|'))
      faqs.push({ question, answer });
  }

  return faqs.length > 0 ? faqs : undefined;
}

function extractFAQsFromHtml(content: string): FAQItem[] | undefined {
  const faqMatch = content.match(
    /<h2[^>]*>(?:Frequently\s+Asked\s+Questions|FAQ)<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/i
  );
  if (!faqMatch) return undefined;

  const section = faqMatch[1];
  const faqs: FAQItem[] = [];

  const h3Pattern = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3[^>]*>|$)/g;
  let match;
  while ((match = h3Pattern.exec(section)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    const answer = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (question && answer) faqs.push({ question, answer });
  }

  return faqs.length > 0 ? faqs : undefined;
}

/**
 * Extract tables from content (supports both Markdown and HTML).
 */
export function extractTablesFromContent(content: string | undefined): TableItem[] | undefined {
  if (!content) return undefined;

  const isHtml = /<table[^>]*>/.test(content);
  if (isHtml) return extractTablesFromHtml(content);

  const tables: TableItem[] = [];
  const tableBlockPattern = /(?:^|\n)(?:##\s+(.+?)\n\n?)?((?:\|.+\|\n?)+)/g;
  let match;

  while ((match = tableBlockPattern.exec(content)) !== null) {
    const tableName = match[1]?.trim();
    const lines = match[2].split('\n').filter(l => l.trim().startsWith('|'));

    if (lines.length < 3) continue;

    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);

    if (!lines[1].includes('---')) continue;

    const rows: string[][] = [];
    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length > 0) rows.push(cells);
    }

    if (headers.length > 0 && rows.length > 0) {
      tables.push({ name: tableName, headers, rows });
    }
  }

  return tables.length > 0 ? tables : undefined;
}

function extractTablesFromHtml(content: string): TableItem[] | undefined {
  const tables: TableItem[] = [];
  const tablePattern = /(?:<h2[^>]*>([\s\S]*?)<\/h2>\s*)?<table[^>]*>([\s\S]*?)<\/table>/gi;
  let match;

  while ((match = tablePattern.exec(content)) !== null) {
    const tableName = match[1]?.replace(/<[^>]+>/g, '').trim() || undefined;
    const tableHtml = match[2];

    const headers: string[] = [];
    const thPattern = /<th[^>]*>([\s\S]*?)<\/th>/gi;
    let thMatch;
    while ((thMatch = thPattern.exec(tableHtml)) !== null) {
      headers.push(thMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (headers.length === 0) continue;

    const rows: string[][] = [];
    const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trPattern.exec(tableHtml)) !== null) {
      const cells: string[] = [];
      const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let tdMatch;
      while ((tdMatch = tdPattern.exec(trMatch[1])) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length > 0) tables.push({ name: tableName, headers, rows });
  }

  return tables.length > 0 ? tables : undefined;
}

/**
 * Extract numbered lists that follow h2/h3 headings from content.
 */
export function extractItemListsFromContent(content: string | undefined): ItemListData[] | undefined {
  if (!content) return undefined;

  const isHtml = /<h[23][^>]*>/.test(content);
  if (isHtml) return extractItemListsFromHtml(content);

  const lists: ItemListData[] = [];
  const pattern = /(?:^|\n)#{2,3}\s+(.+?)\n+((?:\d+\.\s+.+\n?)+)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const name = match[1].trim();
    const listBlock = match[2];
    const items = listBlock
      .split('\n')
      .map(line => line.replace(/^\d+\.\s+/, '').trim())
      .filter(Boolean);

    if (items.length >= 3) {
      lists.push({ name, items });
    }
  }

  return lists.length > 0 ? lists : undefined;
}

function extractItemListsFromHtml(content: string): ItemListData[] | undefined {
  const lists: ItemListData[] = [];
  const pattern = /<h[23][^>]*>([\s\S]*?)<\/h[23]>\s*<ol[^>]*>([\s\S]*?)<\/ol>/gi;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const name = match[1].replace(/<[^>]+>/g, '').trim();
    const olHtml = match[2];
    const items: string[] = [];
    const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liPattern.exec(olHtml)) !== null) {
      const text = liMatch[1].replace(/<[^>]+>/g, '').trim();
      if (text) items.push(text);
    }

    if (items.length >= 3) {
      lists.push({ name, items });
    }
  }

  return lists.length > 0 ? lists : undefined;
}

// Helper to transform Directus post to Post format
function transformPost(config: CmsConfig, item: DirectusPost, categoryLookup?: Map<string, BlogCategory>): Post {
  const catId = typeof item.category === 'string' ? item.category : undefined;
  const blogCategory = catId && categoryLookup?.get(catId);

  const featuredImageId = item.featured_image?.id;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    author: item.author || undefined,
    authorTitle: item.author_title,
    authorType: item.author_type,
    authorUrl: item.author_url,
    authorTwitter: item.author_twitter,
    publishedDate: item.published_date || '',
    status: item.status as 'draft' | 'published' | 'archived',
    category: blogCategory ? blogCategory.slug : catId,
    tags: item.tags || [],
    readingTime: item.read_time,
    articleType: item.article_type,
    featuredImage: featuredImageId
      ? {
          url: getDirectusAssetUrl(config, featuredImageId) || '',
          alt: item.title,
        }
      : item.featured_image_url
        ? { url: item.featured_image_url, alt: item.title }
        : undefined,
    authorImage: item.author_image
      ? {
          url: getDirectusAssetUrl(config, item.author_image.id) || '',
          alt: item.author || 'Author',
        }
      : item.author_image_url
        ? { url: item.author_image_url, alt: item.author || 'Author' }
        : undefined,
    blogCategory: blogCategory
      ? { id: blogCategory.id, name: blogCategory.name, slug: blogCategory.slug }
      : undefined,
    seo: {
      title: item.seo_title,
      description: item.meta_description || item.seo_description || item.excerpt,
      keywords: item.seo_keywords,
    },
    canonicalUrl: item.canonical_url || undefined,
    metaRobots: item.meta_robots || undefined,
    ogImage: item.og_image
      ? getDirectusAssetUrl(config, item.og_image)
      : featuredImageId
        ? getDirectusAssetUrl(config, featuredImageId)
        : undefined,
    ogImageAlt: item.og_image_alt,
    ogTitle: item.og_title,
    ogDescription: item.og_description,
    twitterTitle: item.twitter_title,
    twitterDescription: item.twitter_description,
    twitterImage: item.twitter_image ? getDirectusAssetUrl(config, item.twitter_image) : undefined,
    twitterImageAlt: item.twitter_image_alt,
    faqs: safeJsonParse<FAQItem[]>(item.faqs_json) || extractFAQsFromContent(item.content),
    howToSteps: safeJsonParse<HowToStep[]>(item.howto_json),
    tables: safeJsonParse<TableItem[]>(item.tables_json) || extractTablesFromContent(item.content),
    itemLists: safeJsonParse<ItemListData[]>(item.itemlists_json) || extractItemListsFromContent(item.content),
    createdAt: item.published_date || '',
    updatedAt: item.updated_date || item.published_date || '',
    publishedAt: item.published_date,
    extras: (item as any).__extras,
  };
}

const POST_FIELDS = [
  '*',
  'featured_image.id',
  'featured_image.title',
  'author_image.id',
  'author_image.title',
] as const;

/**
 * Get blog posts with optional filters
 */
export async function getPosts(
  config: CmsConfig,
  options: {
    page?: number;
    pageSize?: number;
    status?: 'draft' | 'published';
    category?: string;
    featured?: boolean;
  } = {}
): Promise<{ posts: Post[]; pagination: any }> {
  const { page = 1, pageSize = 10, status = 'published', category } = options;
  const fm = config.fieldMapping?.posts;

  const filter: any = {
    status: { _eq: status },
  };

  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  if (category) {
    const cat = await getBlogCategoryBySlug(config, category);
    if (cat) {
      filter.category = { _eq: cat.id };
    }
  }

  try {
    const items = await config.directus.request(
      readItems(config.collections.posts as any, {
        fields: [...POST_FIELDS] as any,
        filter: remapFilter(filter, fm),
        limit: -1,
        sort: remapSort(['-published_date'], fm),
      })
    );

    const categoryLookup = await getCategoryLookup(config);
    const posts: Post[] = (items as unknown as Record<string, any>[])
      .map((item) => remapItem(item, fm, KNOWN_POST_FIELDS) as unknown as DirectusPost)
      .map((item) => transformPost(config, item, categoryLookup));

    const total = posts.length;
    const pageCount = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedPosts = posts.slice(offset, offset + pageSize);

    return {
      posts: paginatedPosts,
      pagination: {
        page,
        pageSize,
        pageCount,
        total,
      },
    };
  } catch (error) {
    console.error('Error fetching posts from Directus:', error);
    return { posts: [], pagination: null };
  }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(config: CmsConfig, slug: string): Promise<Post | null> {
  const fm = config.fieldMapping?.posts;
  try {
    const items = await config.directus.request(
      readItems(config.collections.posts as any, {
        fields: [...POST_FIELDS] as any,
        filter: remapFilter({
          slug: { _eq: slug },
          status: { _eq: 'published' },
          ...(config.siteId != null && { site: { _eq: config.siteId } }),
        }, fm),
        limit: 1,
      })
    );

    if (!items || (items as any[]).length === 0) {
      return null;
    }

    const categoryLookup = await getCategoryLookup(config);
    const raw = remapItem((items as any[])[0] as Record<string, any>, fm, KNOWN_POST_FIELDS) as unknown as DirectusPost;
    return transformPost(config, raw, categoryLookup);
  } catch (error) {
    console.error(`Error fetching post ${slug} from Directus:`, error);
    return null;
  }
}

/**
 * Get recent posts for sidebar
 */
export async function getRecentPosts(config: CmsConfig, limit: number = 5): Promise<Post[]> {
  const { posts } = await getPosts(config, { pageSize: limit, status: 'published' });
  return posts;
}

/**
 * Get available blog categories from Directus
 */
export async function getBlogCategories(config: CmsConfig): Promise<BlogCategory[]> {
  try {
    const items = await config.directus.request(
      readItems(config.collections.blogCategories as any, {
        fields: ['*'] as any,
        filter: {
          status: { _eq: 'published' },
          ...(config.siteId != null && { site: { _eq: config.siteId } }),
        },
        sort: ['sort', 'name'],
      })
    );

    return (items as unknown as DirectusBlogCategory[]).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      seoTitle: item.seo_title,
      seoDescription: item.seo_description,
      sort: item.sort,
    }));
  } catch (error) {
    console.error('Error fetching blog categories from Directus:', error);
    return [];
  }
}

/**
 * Get a single blog category by slug
 */
export async function getBlogCategoryBySlug(config: CmsConfig, slug: string): Promise<BlogCategory | null> {
  try {
    const items = await config.directus.request(
      readItems(config.collections.blogCategories as any, {
        fields: ['*'] as any,
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' },
          ...(config.siteId != null && { site: { _eq: config.siteId } }),
        },
        limit: 1,
      })
    );

    if (!items || (items as any[]).length === 0) {
      return null;
    }

    const item = (items as any[])[0] as unknown as DirectusBlogCategory;
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      seoTitle: item.seo_title,
      seoDescription: item.seo_description,
      sort: item.sort,
    };
  } catch (error) {
    console.error(`Error fetching blog category ${slug} from Directus:`, error);
    return null;
  }
}

/**
 * Helper to convert BlogCategory to legacy format for compatibility
 */
export function getCategoryWithCount(
  category: BlogCategory
): {
  label: string;
  value: string;
  count: number;
  description?: string;
} {
  return {
    label: category.name,
    value: category.slug,
    count: 0,
    description: category.description,
  };
}
