import { marked } from "marked";
import { sanitizeHtml } from "./sanitize";
import { textToHeadingId } from "./seo-utils";

/**
 * Converts markdown content to HTML.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return marked(markdown) as string;
}

/**
 * Adds id attributes to h2 and h3 elements that don't already have one.
 */
export function addIdsToHeadings(content: string): string {
  if (!content) return "";

  return content.replace(/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi, (match, level, attrs, text) => {
    if (attrs.includes("id=")) {
      return match;
    }

    const id = textToHeadingId(text);

    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
}

/**
 * Wraps FAQ sections (detected by heading text) in a <section class="faq-section"> element.
 */
export function wrapFaqSection(html: string): string {
  return html.replace(
    /(<h2[^>]*>(?:Frequently\s+Asked\s+Questions|FAQ)<\/h2>)([\s\S]*?)(?=<h2|$)/i,
    '<section class="faq-section">$1$2</section>'
  );
}

/**
 * Extracts h2 headings with their id and text for table-of-contents generation.
 */
export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ""),
    });
  }

  return headings;
}

/**
 * Full content processing pipeline:
 * markdown -> HTML -> strip leading h1 -> add heading IDs -> wrap FAQ -> sanitize
 *
 * Returns processed HTML and extracted headings for table-of-contents.
 */
export async function processArticleContent(rawContent: string): Promise<{ html: string; headings: { id: string; text: string; level: number }[] }> {
  const htmlContent = markdownToHtml(rawContent || "")
    .replace(/^<h1[^>]*>.*?<\/h1>\s*/i, "");
  const html = await sanitizeHtml(wrapFaqSection(addIdsToHeadings(htmlContent)));
  const headings = extractHeadings(html);
  return { html, headings };
}
