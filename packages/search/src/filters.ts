import type { FilterCriteria } from './types.js';

const MAX_QUERY_LENGTH = 200;

/**
 * Escape SQL LIKE wildcard characters so user input is treated literally
 * when passed to Directus _icontains filters.
 */
function escapeWildcards(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/**
 * Build a Directus filter object for text search across multiple fields.
 * Uses `_icontains` for case-insensitive matching.
 */
export function buildFilter(criteria: FilterCriteria): Record<string, any> {
  const { query, fields, siteId, baseFilter } = criteria;

  // Truncate and escape user input
  const safeQuery = escapeWildcards(query.slice(0, MAX_QUERY_LENGTH));

  // Build OR conditions for each searchable field
  const orConditions = fields.map((field) => ({
    [field]: { _icontains: safeQuery },
  }));

  const filter: Record<string, any> = {
    _and: [
      { _or: orConditions },
    ],
  };

  // Add base filter (e.g. status: published)
  if (baseFilter) {
    filter._and.push(baseFilter);
  }

  // Add site filter for multi-tenancy
  if (siteId != null) {
    filter._and.push({ site: { _eq: siteId } });
  }

  return filter;
}
