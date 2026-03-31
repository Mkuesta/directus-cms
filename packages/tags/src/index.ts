import type { TagConfig, TagClient } from './types.js';
import { getAllTags, getPostsByTag, getRelatedByTags, getTagCounts } from './tags.js';

export function createTagClient(config: TagConfig): TagClient {
  return {
    config,
    getAllTags: () => getAllTags(config),
    getPostsByTag: (tag, limit) => getPostsByTag(config, tag, limit),
    getRelatedByTags: (tags, excludeSlug, limit) => getRelatedByTags(config, tags, excludeSlug, limit),
    getTagCounts: () => getTagCounts(config),
  };
}

export type {
  TagConfig,
  TagClient,
  TagCollections,
  TagCount,
  TaggedPost,
} from './types.js';
