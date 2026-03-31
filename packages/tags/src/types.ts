import type { RestClient } from '@directus/sdk';

export interface TagCollections {
  /** Posts collection name (e.g. 'mysite_posts') */
  posts: string;
  /** Optional dedicated tags collection (e.g. 'mysite_tags') */
  tags?: string;
  /** Optional junction table for M2M (e.g. 'mysite_posts_tags') */
  postsTags?: string;
}

export interface TagConfig {
  /** Directus SDK client instance created with createDirectus().with(rest()) */
  directus: RestClient<any>;
  /** Base URL of the Directus instance, used for constructing asset URLs (e.g. "https://cms.example.com") */
  directusUrl: string;
  /** Collection name mappings for posts, tags, and their junction table */
  collections: TagCollections;
  /** Site identifier for multi-tenant filtering; only items matching this siteId are returned */
  siteId?: number;
}

export interface TagClient {
  /** The bound tag configuration */
  config: TagConfig;
  /** Retrieve all unique tag strings across published posts */
  getAllTags: () => Promise<string[]>;
  /** Fetch posts that have a specific tag, with optional result limit */
  getPostsByTag: (tag: string, limit?: number) => Promise<TaggedPost[]>;
  /** Find posts sharing any of the given tags, excluding a specific slug (useful for "related posts") */
  getRelatedByTags: (tags: string[], excludeSlug?: string, limit?: number) => Promise<TaggedPost[]>;
  /** Get each tag with its usage count, sorted by frequency descending */
  getTagCounts: () => Promise<TagCount[]>;
}

export interface TagCount {
  /** The tag name */
  tag: string;
  /** Number of published posts using this tag */
  count: number;
}

export interface TaggedPost {
  /** Directus item ID */
  id: string | number;
  /** Post title */
  title: string;
  /** URL slug for the post */
  slug: string;
  /** Short summary or excerpt of the post content */
  excerpt?: string;
  /** List of tag strings assigned to this post */
  tags: string[];
  /** ISO date string when the post was published */
  publishedDate?: string;
  /** Directus file ID or URL for the post's featured image */
  featuredImage?: string;
}
