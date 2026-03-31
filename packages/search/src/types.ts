import type { RestClient } from '@directus/sdk';

export interface SearchConfig {
  /** Directus SDK client instance created with createDirectus().with(rest()) */
  directus: RestClient<any>;
  /** Base URL of the Directus instance, used for constructing asset URLs (e.g. "https://cms.example.com") */
  directusUrl: string;
  /** Definitions of which Directus collections are searchable and how to map their fields */
  collections: SearchableCollection[];
  /** Site identifier for multi-tenant filtering; only items matching this siteId are searched */
  siteId?: number;
  /** Maximum number of results returned when no explicit limit is provided (default: 25) */
  defaultLimit?: number;
}

export interface SearchableCollection {
  /** Directus collection name */
  collection: string;
  /** Type identifier for grouping results (e.g. 'post', 'product', 'page') */
  type: string;
  /** Fields to search, ordered by weight (first = highest) */
  searchFields: string[];
  /** Fields to return in results */
  resultFields: string[];
  /** Field name for the result title */
  titleField: string;
  /** Field name for the result slug */
  slugField: string;
  /** Field name for excerpt/snippet source */
  excerptField?: string;
  /** Field name for the image */
  imageField?: string;
  /** Additional base filter to apply (e.g. status: published) */
  baseFilter?: Record<string, any>;
  /** URL prefix for constructing result URLs */
  urlPrefix: string;
}

export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip for pagination */
  offset?: number;
  /** Restrict search to specific collection types (e.g. ['post', 'product']) */
  types?: string[];
}

export interface SearchResult {
  /** Collection type this result came from (e.g. 'post', 'product', 'page') */
  type: string;
  /** Directus item ID */
  id: string | number;
  /** Display title of the matched item */
  title: string;
  /** URL slug of the matched item */
  slug: string;
  /** Fully constructed URL path including the collection's urlPrefix */
  url: string;
  /** Short text excerpt around the matched terms */
  snippet?: string;
  /** Character offset ranges where the query matched within the snippet */
  highlights?: Array<{ start: number; end: number }>;
  /** Full URL to the item's image asset, if available */
  imageUrl?: string;
  /** Relevance score used for ranking results (higher = more relevant) */
  score: number;
}

export interface SearchResponse {
  /** The original search query string */
  query: string;
  /** Matched items sorted by relevance score */
  results: SearchResult[];
  /** Number of results per collection type (e.g. { post: 5, product: 2 }) */
  counts: Record<string, number>;
  /** Total number of results across all types */
  total: number;
}

export interface SearchClient {
  /** The bound search configuration */
  config: SearchConfig;
  /** Search across all configured collections, returning aggregated results sorted by relevance */
  search: (query: string, options?: SearchOptions) => Promise<SearchResponse>;
  /** Search within a single collection type, returning only results of that type */
  searchByType: (type: string, query: string, options?: SearchOptions) => Promise<SearchResult[]>;
}

export interface FilterCriteria {
  /** The search query string to match against */
  query: string;
  /** Field names to apply the search filter on */
  fields: string[];
  /** Site identifier for multi-tenant filtering */
  siteId?: number;
  /** Additional Directus filter conditions to merge with the search filter */
  baseFilter?: Record<string, any>;
}
