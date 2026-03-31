import { getBlogCategories, getPosts } from "./blog";
import type { CmsConfig } from "./types";

/**
 * Returns static params for category pages: [{ category: "slug" }, ...]
 */
export async function getCategoryStaticParams(config: CmsConfig) {
  const categories = await getBlogCategories(config).catch(() => []);
  return categories.map((cat) => ({ category: cat.slug }));
}

/**
 * Returns static params for article pages: [{ category: "slug", slug: "post-slug" }, ...]
 */
export async function getArticleStaticParams(config: CmsConfig) {
  const { posts } = await getPosts(config, { pageSize: 1000, status: "published" }).catch(() => ({ posts: [] as any[] }));
  return posts.map((post: any) => ({
    category: post.blogCategory?.slug || "general",
    slug: post.slug,
  }));
}
