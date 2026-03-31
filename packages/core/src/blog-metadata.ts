import type { Metadata } from "next";
import { getPostBySlug, getBlogCategoryBySlug } from "./blog";
import { getSettings } from "./settings";
import { parseKeywords, fixProperNouns } from "./seo-utils";
import { toAbsoluteAssetUrl } from "./images";
import type { CmsConfig } from "./types";
import { resolvePostPath, resolveCategoryPath, resolveIndexPath } from "./url-builder";

/**
 * Build a clean, non-truncated description. Rejects mid-sentence cuts.
 */
function cleanDescription(primary: string | undefined, fallback: string | undefined, defaultText: string): string {
  for (const text of [primary, fallback]) {
    if (text && text.length > 50 && /[.!?]$/.test(text.trim())) {
      return fixProperNouns(text.trim());
    }
  }
  // If both are truncated, use the longest one or the default
  const best = primary || fallback;
  if (best && best.length > 80) return fixProperNouns(best.trim());
  return defaultText;
}

/**
 * Generates Next.js Metadata for an individual blog article page.
 */
export async function getArticleMetadata(config: CmsConfig, slug: string, category: string): Promise<Metadata> {
  const [post, settings] = await Promise.all([
    getPostBySlug(config, slug).catch(() => null),
    getSettings(config),
  ]);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const baseUrl = config.baseUrl.trim();
  const description = cleanDescription(post.seo?.description, post.excerpt, `Read about ${post.title}.`);
  const tags = parseKeywords(post.seo?.keywords) || post.tags || [];

  const canonicalUrl = post.canonicalUrl || resolvePostPath(config, slug, category);
  const absoluteCanonical = canonicalUrl.startsWith("http") ? canonicalUrl : `${baseUrl}${canonicalUrl}`;

  const ogImage = toAbsoluteAssetUrl(config, post.ogImage)
    || toAbsoluteAssetUrl(config, post.featuredImage?.url)
    || settings.ogImageUrl
    || undefined;

  const robots = post.metaRobots || "index, follow";

  // Title: let the layout template handle branding suffix
  const title = post.seo?.title || post.title;

  return {
    title,
    description,
    authors: [{ name: post.author || settings.defaultAuthorName || config.siteName }],
    robots,
    alternates: {
      canonical: absoluteCanonical,
    },
    openGraph: {
      title: post.ogTitle || title,
      description: fixProperNouns(post.ogDescription || description),
      type: "article",
      url: absoluteCanonical,
      siteName: settings.siteName || config.siteName,
      locale: "en_US",
      // Only include dates when they have actual values
      ...(post.publishedDate ? { publishedTime: post.publishedDate } : {}),
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      authors: [post.author || settings.defaultAuthorName || config.siteName],
      section: post.blogCategory?.name || undefined,
      images: ogImage
        ? [{ url: ogImage, alt: post.ogImageAlt || post.title, width: 1200, height: 630 }]
        : [],
      ...(tags.length > 0 ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitterTitle || post.ogTitle || title,
      description: fixProperNouns(post.twitterDescription || post.ogDescription || description),
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(post.authorTwitter || settings.defaultAuthorTwitter || settings.twitterHandle
        ? { creator: post.authorTwitter || settings.defaultAuthorTwitter || settings.twitterHandle }
        : {}),
      images: post.twitterImage
        ? [{ url: toAbsoluteAssetUrl(config, post.twitterImage) || ogImage || "", alt: post.twitterImageAlt || post.title, width: 1200, height: 630 }]
        : ogImage
          ? [{ url: ogImage, alt: post.ogImageAlt || post.title, width: 1200, height: 630 }]
          : [],
    },
  };
}

/**
 * Generates Next.js Metadata for a blog category listing page.
 */
export async function getCategoryMetadata(config: CmsConfig, categorySlug: string): Promise<Metadata> {
  const [categoryData, settings] = await Promise.all([
    getBlogCategoryBySlug(config, categorySlug).catch(() => null),
    getSettings(config),
  ]);

  const baseUrl = config.baseUrl.trim();
  const label = categoryData?.seoTitle || categoryData?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const description = fixProperNouns(categoryData?.seoDescription || categoryData?.description || `All articles in the ${label} category.`);
  const title = label;
  const categoryPath = resolveCategoryPath(config, categorySlug);
  const url = `${baseUrl}${categoryPath ?? `/${config.route}/${categorySlug}`}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: settings.siteName,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, alt: title, width: 1200, height: 630 }] } : {}),
    },
  };
}

/**
 * Generates Next.js Metadata for the blog index page.
 */
export async function getBlogIndexMetadata(config: CmsConfig): Promise<Metadata> {
  const settings = await getSettings(config);
  const baseUrl = config.baseUrl.trim();
  const title = settings.siteName ? `Resources | ${settings.siteName}` : "Resources";
  const description = settings.siteDescription
    || "Insights, analysis, and strategies for healthcare professionals and marketers.";

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}${resolveIndexPath(config)}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}${resolveIndexPath(config)}`,
      siteName: settings.siteName,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, alt: title, width: 1200, height: 630 }] } : {}),
    },
  };
}
