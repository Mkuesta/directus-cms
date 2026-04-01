import { markdownToHtml, addIdsToHeadings, extractHeadings, sanitizeHtml, wrapFaqSection } from '@mkuesta/core';

/**
 * Processes a product's seo_article markdown field into sanitized HTML.
 *
 * Pipeline: markdown → HTML → strip leading H1 → add heading IDs → sanitize
 *
 * Returns the processed HTML and extracted h2 headings for table-of-contents.
 */
export async function processProductSeoContent(markdown: string): Promise<{
  html: string;
  headings: { id: string; text: string; level: number }[];
}> {
  if (!markdown) return { html: '', headings: [] };

  const rawHtml = markdownToHtml(markdown);
  const withoutH1 = rawHtml.replace(/^<h1[^>]*>.*?<\/h1>\s*/i, '');
  const withIds = addIdsToHeadings(withoutH1);
  const withFaqWrap = wrapFaqSection(withIds);
  const html = await sanitizeHtml(withFaqWrap);
  const headings = extractHeadings(html);

  return { html, headings };
}
