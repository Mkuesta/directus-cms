import { readItems } from '@directus/sdk';
import type { TagConfig, TagCount, TaggedPost } from './types.js';

const _cache = new WeakMap<object, { data: TaggedPost[]; expires: number }>();
const CACHE_TTL = 60_000;

/**
 * Fetch all published posts with their tags (cached).
 */
async function fetchAllTaggedPosts(config: TagConfig): Promise<TaggedPost[]> {
  const cached = _cache.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;

  const filter: Record<string, any> = {
    _and: [
      { status: { _eq: 'published' } },
      { tags: { _nnull: true } },
    ],
  };

  if (config.siteId != null) {
    filter._and.push({ site: { _eq: config.siteId } });
  }

  try {
    const items = await config.directus.request(
      readItems(config.collections.posts as any, {
        fields: ['id', 'title', 'slug', 'excerpt', 'tags', 'published_date', 'featured_image'],
        filter,
        sort: ['-published_date'],
        limit: -1,
      } as any),
    ) as unknown as any[];

    const posts: TaggedPost[] = items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || undefined,
      tags: Array.isArray(item.tags) ? item.tags : [],
      publishedDate: item.published_date || undefined,
      featuredImage: item.featured_image
        ? (typeof item.featured_image === 'string'
          ? `${config.directusUrl}/assets/${item.featured_image}`
          : item.featured_image?.id
            ? `${config.directusUrl}/assets/${item.featured_image.id}`
            : undefined)
        : undefined,
    }));

    _cache.set(config.directus, { data: posts, expires: Date.now() + CACHE_TTL });
    return posts;
  } catch (error) {
    console.error('[tags] Failed to fetch tagged posts:', error);
    return [];
  }
}

/**
 * Get all unique tags from published posts.
 */
export async function getAllTags(config: TagConfig): Promise<string[]> {
  const posts = await fetchAllTaggedPosts(config);
  const tagSet = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * Get posts that have a specific tag.
 */
export async function getPostsByTag(
  config: TagConfig,
  tag: string,
  limit?: number,
): Promise<TaggedPost[]> {
  const posts = await fetchAllTaggedPosts(config);
  const lowerTag = tag.toLowerCase();

  const matching = posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === lowerTag),
  );

  return limit ? matching.slice(0, limit) : matching;
}

/**
 * Get posts related by shared tags, excluding a specific post.
 */
export async function getRelatedByTags(
  config: TagConfig,
  tags: string[],
  excludeSlug?: string,
  limit: number = 5,
): Promise<TaggedPost[]> {
  const posts = await fetchAllTaggedPosts(config);
  const lowerTags = new Set(tags.map((t) => t.toLowerCase()));

  // Score each post by number of shared tags
  const scored = posts
    .filter((post) => post.slug !== excludeSlug)
    .map((post) => {
      const sharedCount = post.tags.filter((t) => lowerTags.has(t.toLowerCase())).length;
      return { post, sharedCount };
    })
    .filter(({ sharedCount }) => sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount);

  return scored.slice(0, limit).map(({ post }) => post);
}

/**
 * Get all tags with their post counts, sorted by count descending.
 */
export async function getTagCounts(config: TagConfig): Promise<TagCount[]> {
  const posts = await fetchAllTaggedPosts(config);
  const countMap = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      countMap.set(tag, (countMap.get(tag) || 0) + 1);
    }
  }

  return Array.from(countMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
