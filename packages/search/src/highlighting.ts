/**
 * Extract a snippet from text around the first occurrence of query terms,
 * with highlight positions marked.
 */
export function extractSnippet(
  text: string,
  query: string,
  maxLength: number = 200,
): { snippet: string; highlights: Array<{ start: number; end: number }> } {
  if (!text || !query) {
    return { snippet: text?.slice(0, maxLength) || '', highlights: [] };
  }

  // Strip HTML tags for plain text search
  const plainText = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const lowerText = plainText.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Split query into terms for multi-word matching
  const terms = lowerQuery.split(/\s+/).filter(Boolean);

  // Find the first occurrence of any term
  let firstMatchIndex = -1;
  for (const term of terms) {
    const idx = lowerText.indexOf(term);
    if (idx !== -1 && (firstMatchIndex === -1 || idx < firstMatchIndex)) {
      firstMatchIndex = idx;
    }
  }

  // Extract snippet window around the match
  let snippetStart: number;
  let snippetEnd: number;

  if (firstMatchIndex === -1) {
    snippetStart = 0;
    snippetEnd = Math.min(plainText.length, maxLength);
  } else {
    const padding = Math.floor(maxLength / 4);
    snippetStart = Math.max(0, firstMatchIndex - padding);
    snippetEnd = Math.min(plainText.length, snippetStart + maxLength);

    // Adjust to word boundaries
    if (snippetStart > 0) {
      const spaceIndex = plainText.indexOf(' ', snippetStart);
      if (spaceIndex !== -1 && spaceIndex < snippetStart + 20) {
        snippetStart = spaceIndex + 1;
      }
    }
  }

  let snippet = plainText.slice(snippetStart, snippetEnd);
  if (snippetStart > 0) snippet = '...' + snippet;
  if (snippetEnd < plainText.length) snippet = snippet + '...';

  // Find all highlight positions within the snippet
  const highlights: Array<{ start: number; end: number }> = [];
  const lowerSnippet = snippet.toLowerCase();

  for (const term of terms) {
    let searchFrom = 0;
    while (searchFrom < lowerSnippet.length) {
      const idx = lowerSnippet.indexOf(term, searchFrom);
      if (idx === -1) break;
      highlights.push({ start: idx, end: idx + term.length });
      searchFrom = idx + term.length;
    }
  }

  // Sort highlights by start position
  highlights.sort((a, b) => a.start - b.start);

  return { snippet, highlights };
}
