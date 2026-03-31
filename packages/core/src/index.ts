import type { CmsConfig, CmsClient, ImageTransformOptions } from './types';
import * as blog from './blog';
import * as settings from './settings';
import * as images from './images';
import * as blogMetadata from './blog-metadata';
import * as blogStaticParams from './blog-static-params';

/**
 * Creates a CMS client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const cms = createCmsClient({ directus, collections, siteName, baseUrl, directusUrl, route });
 *   const { posts } = await cms.getPosts({ pageSize: 10 });
 */
export function createCmsClient(config: CmsConfig): CmsClient {
  return {
    config,

    // Blog
    getPosts: (opts) => blog.getPosts(config, opts),
    getPostBySlug: (slug) => blog.getPostBySlug(config, slug),
    getRecentPosts: (limit) => blog.getRecentPosts(config, limit),
    getBlogCategories: () => blog.getBlogCategories(config),
    getBlogCategoryBySlug: (slug) => blog.getBlogCategoryBySlug(config, slug),
    getCategoryWithCount: blog.getCategoryWithCount,

    // Settings
    getSettings: () => settings.getSettings(config),

    // Metadata
    getArticleMetadata: (slug, cat) => blogMetadata.getArticleMetadata(config, slug, cat),
    getCategoryMetadata: (categorySlug) => blogMetadata.getCategoryMetadata(config, categorySlug),
    getBlogIndexMetadata: () => blogMetadata.getBlogIndexMetadata(config),

    // Static params
    getCategoryStaticParams: () => blogStaticParams.getCategoryStaticParams(config),
    getArticleStaticParams: () => blogStaticParams.getArticleStaticParams(config),

    // Images
    getDirectusAssetUrl: (fileId) => images.getDirectusAssetUrl(config, fileId),
    getDirectusImageUrl: (fileId, opts) => images.getDirectusImageUrl(config, fileId, opts),
    toAbsoluteAssetUrl: (path) => images.toAbsoluteAssetUrl(config, path),
  };
}

// Re-export URL builders
export { resolvePostPath, resolveCategoryPath, resolveIndexPath } from './url-builder';

// Re-export all types
export type {
  CmsConfig,
  CmsClient,
  CmsCollections,
  CmsUrlBuilders,
  Post,
  BlogCategory,
  SiteSettings,
  FAQItem,
  HowToStep,
  TableItem,
  ItemListData,
  DirectusFile,
  DirectusSettings,
  DirectusBlogCategory,
  DirectusPost,
  DirectusCategory,
  DirectusProduct,
  DirectusResponse,
  DirectusCollectionResponse,
  ArticleType,
  AuthorType,
  ImageTransformOptions,
} from './types';

// Re-export standalone functions that other packages may need
export { getSettings } from './settings';

// Re-export pure utilities (no config needed)
export { sanitizeHtml, createSanitizedHtml } from './sanitize';
export { getWordCount, parseKeywords, textToHeadingId, fixProperNouns } from './seo-utils';
export {
  processArticleContent,
  markdownToHtml,
  addIdsToHeadings,
  wrapFaqSection,
  extractHeadings,
} from './blog-content';
export { IMAGE_PRESETS } from './images';
export { getCategoryWithCount, extractFAQsFromContent, extractTablesFromContent, extractItemListsFromContent } from './blog';

// Re-export field mapping utilities
export { remapFields, remapItem, remapFilter, remapSort } from './field-mapping';
export type { FieldMapping, CollectionFieldMappings } from './field-mapping';

// Re-export component
export { ArticleSchema } from './components/ArticleSchema';
