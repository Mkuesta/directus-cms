// Lazy-loaded to avoid JSDOM initialization issues during Next.js SSG/build
let _DOMPurify: typeof import('isomorphic-dompurify').default | null = null;

async function loadDOMPurify() {
  if (!_DOMPurify) {
    const mod = await import('isomorphic-dompurify');
    _DOMPurify = mod.default;
  }
  return _DOMPurify;
}

const ALLOWED_TAGS = [
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Block
  'p', 'div', 'blockquote', 'pre', 'code', 'hr', 'br',
  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // Inline
  'a', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark',
  'small', 'sub', 'sup', 'abbr', 'cite', 'q', 'kbd', 'var', 'samp',
  'span', 'time', 'wbr',
  // Table
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Media
  'img', 'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
  // Semantic
  'article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'details', 'summary',
];

const ALLOWED_ATTR = [
  'id', 'class', 'href', 'src', 'alt', 'title', 'width', 'height',
  'target', 'rel', 'loading', 'decoding', 'srcset', 'sizes', 'type', 'media',
  'colspan', 'rowspan', 'scope', 'headers',
  'datetime', 'open', 'start', 'reversed', 'value',
  'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload',
  'role', 'tabindex',
  // aria-* and data-* are handled by ALLOW_ARIA_ATTR / ALLOW_DATA_ATTR
];

// Block dangerous URI schemes
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel|#):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitize HTML content using DOMPurify (async to lazy-load JSDOM).
 * Removes script/style/iframe/form tags, event handlers, and dangerous URI schemes.
 */
export async function sanitizeHtml(html: string): Promise<string> {
  if (!html) return '';

  const DOMPurify = await loadDOMPurify();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: true,
  });
}

/**
 * Sanitize HTML and return props for dangerouslySetInnerHTML
 */
export async function createSanitizedHtml(html: string): Promise<{ __html: string }> {
  return { __html: await sanitizeHtml(html) };
}
