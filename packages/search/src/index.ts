import type { SearchConfig, SearchClient } from './types.js';
import { search as searchFn, searchByType as searchByTypeFn } from './search.js';

export function createSearchClient(config: SearchConfig): SearchClient {
  return {
    config,
    search: (query, options) => searchFn(config, query, options),
    searchByType: (type, query, options) => searchByTypeFn(config, type, query, options),
  };
}

export type {
  SearchConfig,
  SearchClient,
  SearchableCollection,
  SearchOptions,
  SearchResult,
  SearchResponse,
  FilterCriteria,
} from './types.js';

export { search, searchByType } from './search.js';
export { buildFilter } from './filters.js';
export { extractSnippet } from './highlighting.js';

export { SearchResults } from './components/SearchResults.js';
