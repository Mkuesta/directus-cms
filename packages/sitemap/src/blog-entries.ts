import type { SitemapConfig, SitemapEntry } from './types';
import { resolvePostPath, resolveCategoryPath, resolveIndexPath } from '@mkuesta/core';

export async function getBlogEntries(config: SitemapConfig): Promise<SitemapEntry[]> {
  if (!config.cms) return [];

  const entries: SitemapEntry[] = [];
  const cmsConfig = config.cms.config;

  // Blog index page
  entries.push({
    url: `${config.baseUrl.trim()}${resolveIndexPath(cmsConfig)}`,
    changeFrequency: config.defaultChangeFrequency ?? 'daily',
    priority: 0.8,
  });

  // Fetch posts and categories in parallel
  const [postsResult, categories] = await Promise.all([
    config.cms.getPosts({ pageSize: 100000 }),
    config.cms.getBlogCategories(),
  ]);

  // Blog categories (skip if URL builder returns null)
  for (const category of categories) {
    const categoryPath = resolveCategoryPath(cmsConfig, category.slug);
    if (categoryPath !== null) {
      entries.push({
        url: `${config.baseUrl.trim()}${categoryPath}`,
        changeFrequency: config.defaultChangeFrequency ?? 'weekly',
        priority: 0.6,
      });
    }
  }

  // Blog posts
  for (const post of postsResult.posts) {
    const categorySlug = post.blogCategory?.slug;
    const postUrl = `${config.baseUrl.trim()}${resolvePostPath(cmsConfig, post.slug, categorySlug)}`;

    entries.push({
      url: postUrl,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: config.defaultChangeFrequency ?? 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}
