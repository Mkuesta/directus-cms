import { describe, it, expect } from 'vitest';
import { buildFilter } from '../../directus-cms-search/src/filters.js';
import { extractSnippet } from '../../directus-cms-search/src/highlighting.js';
import { createSearchClient } from '../../directus-cms-search/src/index.js';

// ---------------------------------------------------------------------------
// buildFilter
// ---------------------------------------------------------------------------
describe('buildFilter', () => {
  it('creates _or conditions for each search field with _icontains', () => {
    const filter = buildFilter({
      query: 'headless',
      fields: ['title', 'content'],
    });

    const orConditions = filter._and[0]._or;
    expect(orConditions).toHaveLength(2);
    expect(orConditions[0]).toEqual({ title: { _icontains: 'headless' } });
    expect(orConditions[1]).toEqual({ content: { _icontains: 'headless' } });
  });

  it('wraps conditions in _and array', () => {
    const filter = buildFilter({
      query: 'cms',
      fields: ['title'],
    });

    expect(filter._and).toBeDefined();
    expect(Array.isArray(filter._and)).toBe(true);
    expect(filter._and.length).toBeGreaterThanOrEqual(1);
  });

  it('adds base filter when provided', () => {
    const filter = buildFilter({
      query: 'test',
      fields: ['title'],
      baseFilter: { status: { _eq: 'published' } },
    });

    expect(filter._and).toHaveLength(2);
    expect(filter._and[1]).toEqual({ status: { _eq: 'published' } });
  });

  it('adds site filter when siteId is provided', () => {
    const filter = buildFilter({
      query: 'test',
      fields: ['title'],
      siteId: 42,
    });

    expect(filter._and).toHaveLength(2);
    expect(filter._and[1]).toEqual({ site: { _eq: 42 } });
  });

  it('combines all filters in _and array', () => {
    const filter = buildFilter({
      query: 'directus',
      fields: ['title', 'content', 'excerpt'],
      baseFilter: { status: { _eq: 'published' } },
      siteId: 7,
    });

    // _or conditions + baseFilter + siteId
    expect(filter._and).toHaveLength(3);
    expect(filter._and[0]._or).toHaveLength(3);
    expect(filter._and[1]).toEqual({ status: { _eq: 'published' } });
    expect(filter._and[2]).toEqual({ site: { _eq: 7 } });
  });

  it('works with single field', () => {
    const filter = buildFilter({
      query: 'hello',
      fields: ['title'],
    });

    const orConditions = filter._and[0]._or;
    expect(orConditions).toHaveLength(1);
    expect(orConditions[0]).toEqual({ title: { _icontains: 'hello' } });
  });

  it('works with multiple fields', () => {
    const filter = buildFilter({
      query: 'search term',
      fields: ['title', 'body', 'excerpt', 'tags'],
    });

    const orConditions = filter._and[0]._or;
    expect(orConditions).toHaveLength(4);
    expect(orConditions[0]).toEqual({ title: { _icontains: 'search term' } });
    expect(orConditions[1]).toEqual({ body: { _icontains: 'search term' } });
    expect(orConditions[2]).toEqual({ excerpt: { _icontains: 'search term' } });
    expect(orConditions[3]).toEqual({ tags: { _icontains: 'search term' } });
  });
});

// ---------------------------------------------------------------------------
// extractSnippet
// ---------------------------------------------------------------------------
describe('extractSnippet', () => {
  it('returns empty string for null/empty text', () => {
    const result1 = extractSnippet('', 'test');
    expect(result1.snippet).toBe('');
    expect(result1.highlights).toEqual([]);

    const result2 = extractSnippet(null as any, 'test');
    expect(result2.snippet).toBe('');
    expect(result2.highlights).toEqual([]);
  });

  it('returns beginning of text when query is empty', () => {
    const result = extractSnippet('Some text here', '');
    expect(result.snippet).toBe('Some text here');
    expect(result.highlights).toEqual([]);
  });

  it('strips HTML tags before searching', () => {
    const result = extractSnippet(
      '<p>Hello <strong>world</strong> of <em>search</em></p>',
      'world',
      200,
    );
    expect(result.snippet).not.toContain('<p>');
    expect(result.snippet).not.toContain('<strong>');
    expect(result.snippet).not.toContain('<em>');
    expect(result.snippet).toContain('world');
  });

  it('finds first match and extracts surrounding context', () => {
    const longText =
      'The quick brown fox jumps over the lazy dog. ' +
      'Directus is a powerful headless CMS platform. ' +
      'It provides an API-first approach to content management. ' +
      'Many developers love using it for their projects.';
    const result = extractSnippet(longText, 'headless', 100);
    expect(result.snippet).toContain('headless');
  });

  it('returns highlights with correct start/end positions', () => {
    const result = extractSnippet('Hello world', 'world', 200);
    expect(result.highlights.length).toBeGreaterThan(0);
    const highlight = result.highlights[0];
    const matchedText = result.snippet.slice(highlight.start, highlight.end);
    expect(matchedText.toLowerCase()).toBe('world');
  });

  it('handles multi-word query (splits into terms)', () => {
    const text = 'The fox jumped over the lazy dog while the cat slept';
    const result = extractSnippet(text, 'fox cat', 200);
    // Both terms should be highlighted
    expect(result.highlights.length).toBeGreaterThanOrEqual(2);
    // Verify each highlight corresponds to one of the terms
    for (const h of result.highlights) {
      const matched = result.snippet.slice(h.start, h.end).toLowerCase();
      expect(['fox', 'cat']).toContain(matched);
    }
  });

  it('prepends ellipsis when snippet does not start at beginning', () => {
    const longText = 'A'.repeat(100) + ' target word here ' + 'B'.repeat(100);
    const result = extractSnippet(longText, 'target', 50);
    expect(result.snippet.startsWith('...')).toBe(true);
  });

  it('appends ellipsis when snippet does not reach end', () => {
    const longText = 'Start target word ' + 'C'.repeat(300);
    const result = extractSnippet(longText, 'target', 50);
    expect(result.snippet.endsWith('...')).toBe(true);
  });

  it('handles case-insensitive matching', () => {
    const result = extractSnippet('Hello WORLD of Testing', 'world', 200);
    expect(result.highlights.length).toBeGreaterThan(0);
    const highlight = result.highlights[0];
    const matchedText = result.snippet.slice(highlight.start, highlight.end);
    expect(matchedText.toLowerCase()).toBe('world');
  });

  it('returns full text when shorter than maxLength', () => {
    const shortText = 'Short text here';
    const result = extractSnippet(shortText, 'text', 200);
    expect(result.snippet).toBe('Short text here');
    expect(result.snippet).not.toContain('...');
  });

  it('works when query is not found (returns beginning of text)', () => {
    const text = 'This is some content about technology and programming';
    const result = extractSnippet(text, 'xyznonexistent', 200);
    // Should return beginning of text without highlights
    expect(result.snippet).toContain('This is some content');
    expect(result.highlights).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// createSearchClient — factory shape
// ---------------------------------------------------------------------------
describe('createSearchClient', () => {
  it('returns client with all expected methods', () => {
    const config = {
      directus: {} as any,
      directusUrl: 'https://cms.example.com',
      collections: [],
    };

    const client = createSearchClient(config);
    expect(client.config).toBe(config);
    expect(typeof client.search).toBe('function');
    expect(typeof client.searchByType).toBe('function');
  });

  it('search returns empty results for empty query', async () => {
    const config = {
      directus: {} as any,
      directusUrl: 'https://cms.example.com',
      collections: [],
    };

    const client = createSearchClient(config);
    const result = await client.search('');
    expect(result.query).toBe('');
    expect(result.results).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('search returns empty results for whitespace-only query', async () => {
    const config = {
      directus: {} as any,
      directusUrl: 'https://cms.example.com',
      collections: [],
    };

    const client = createSearchClient(config);
    const result = await client.search('   ');
    expect(result.query).toBe('');
    expect(result.results).toEqual([]);
    expect(result.total).toBe(0);
  });
});
