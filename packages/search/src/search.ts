import { readItems } from '@directus/sdk';
import type { SearchConfig, SearchOptions, SearchResult, SearchResponse, SearchableCollection } from './types.js';
import { buildFilter } from './filters.js';
import { extractSnippet } from './highlighting.js';

/**
 * Search across all configured collections.
 */
export async function search(
  config: SearchConfig,
  query: string,
  options?: SearchOptions,
): Promise<SearchResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { query: '', results: [], counts: {}, total: 0 };
  }

  const limit = options?.limit ?? config.defaultLimit ?? 20;
  const types = options?.types;

  // Filter collections by type if specified
  const collections = types
    ? config.collections.filter((c) => types.includes(c.type))
    : config.collections;

  // Search all collections in parallel
  const resultSets = await Promise.all(
    collections.map((col) => searchCollection(config, col, trimmedQuery, limit)),
  );

  // Merge and sort by score
  const allResults: SearchResult[] = resultSets.flat();
  allResults.sort((a, b) => b.score - a.score);

  // Compute counts by type
  const counts: Record<string, number> = {};
  for (const result of allResults) {
    counts[result.type] = (counts[result.type] || 0) + 1;
  }

  // Apply offset and limit
  const offset = options?.offset ?? 0;
  const paginatedResults = allResults.slice(offset, offset + limit);

  return {
    query: trimmedQuery,
    results: paginatedResults,
    counts,
    total: allResults.length,
  };
}

/**
 * Search a specific type only.
 */
export async function searchByType(
  config: SearchConfig,
  type: string,
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> {
  const response = await search(config, query, { ...options, types: [type] });
  return response.results;
}

async function searchCollection(
  config: SearchConfig,
  collection: SearchableCollection,
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const filter = buildFilter({
    query,
    fields: collection.searchFields,
    siteId: config.siteId,
    baseFilter: collection.baseFilter,
  });

  try {
    const items = await config.directus.request(
      readItems(collection.collection as any, {
        fields: collection.resultFields as any,
        filter,
        limit,
      } as any),
    ) as unknown as any[];

    return items.map((item) => mapToSearchResult(config, collection, item, query));
  } catch (error) {
    console.error(`[search] Failed to search collection "${collection.collection}":`, error);
    return [];
  }
}

function mapToSearchResult(
  config: SearchConfig,
  collection: SearchableCollection,
  item: any,
  query: string,
): SearchResult {
  const title = item[collection.titleField] || '';
  const slug = item[collection.slugField] || '';
  const excerptText = collection.excerptField ? item[collection.excerptField] : '';

  // Calculate score based on which field matched (title match = highest)
  const score = calculateScore(item, collection.searchFields, query);

  // Extract snippet with highlighting
  const { snippet, highlights } = extractSnippet(excerptText || title, query);

  // Build image URL
  let imageUrl: string | undefined;
  if (collection.imageField && item[collection.imageField]) {
    const imageValue = item[collection.imageField];
    if (typeof imageValue === 'string') {
      imageUrl = imageValue.startsWith('http')
        ? imageValue
        : `${config.directusUrl}/assets/${imageValue}`;
    } else if (imageValue?.id) {
      imageUrl = `${config.directusUrl}/assets/${imageValue.id}`;
    }
  }

  return {
    type: collection.type,
    id: item.id,
    title,
    slug,
    url: `${collection.urlPrefix}/${slug}`,
    snippet: snippet || undefined,
    highlights: highlights.length > 0 ? highlights : undefined,
    imageUrl,
    score,
  };
}

function calculateScore(
  item: any,
  searchFields: string[],
  query: string,
): number {
  const lowerQuery = query.toLowerCase();
  let maxScore = 0;

  for (let i = 0; i < searchFields.length; i++) {
    const fieldValue = String(item[searchFields[i]] || '').toLowerCase();
    // Weight: first field (title) = 1.0, second = 0.7, third = 0.4, rest = 0.2
    const weight = i === 0 ? 1.0 : i === 1 ? 0.7 : i === 2 ? 0.4 : 0.2;

    if (fieldValue.includes(lowerQuery)) {
      // Exact phrase match
      const score = weight;
      if (score > maxScore) maxScore = score;
    } else {
      // Check individual terms
      const terms = lowerQuery.split(/\s+/);
      const matchedTerms = terms.filter((t) => fieldValue.includes(t));
      if (matchedTerms.length > 0) {
        const score = weight * (matchedTerms.length / terms.length) * 0.8;
        if (score > maxScore) maxScore = score;
      }
    }
  }

  return Math.round(maxScore * 100) / 100;
}
