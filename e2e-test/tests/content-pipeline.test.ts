import { describe, it, expect } from 'vitest';
import {
  extractFAQsFromContent,
  extractTablesFromContent,
  extractItemListsFromContent,
} from '../../directus-cms-core/src/blog.js';
import {
  processArticleContent,
  addIdsToHeadings,
  wrapFaqSection,
  extractHeadings,
} from '../../directus-cms-core/src/blog-content.js';
import { sanitizeHtml } from '../../directus-cms-core/src/sanitize.js';
import { getWordCount, textToHeadingId, parseKeywords } from '../../directus-cms-core/src/seo-utils.js';
import { ArticleSchema } from '../../directus-cms-core/src/components/ArticleSchema.js';
import type { Post, SiteSettings } from '../../directus-cms-core/src/types.js';

// ---------------------------------------------------------------------------
// Dummy article content
// ---------------------------------------------------------------------------

const MARKDOWN_ARTICLE = `# Best CMS Platforms in 2025

Content management systems have evolved significantly.

## Comparison Table

| Platform | Price | Open Source |
|----------|-------|-------------|
| Directus | Free | Yes |
| Strapi | Free | Yes |
| Contentful | $489/mo | No |

## Top 5 Reasons to Use a Headless CMS

1. Decoupled architecture
2. API-first content delivery
3. Framework flexibility
4. Better performance
5. Future-proof stack

## Frequently Asked Questions

### What is a headless CMS?

A headless CMS is a content management system that separates the content repository from the presentation layer. It delivers content via APIs.

### How much does Directus cost?

Directus is free and open source. You can self-host it or use their cloud offering starting at $15/month.

### Is Directus better than WordPress?

It depends on your use case. Directus excels at structured content delivery via APIs, while WordPress is better for traditional websites with themes and plugins.
`;

const HTML_FAQ = `<h2>Frequently Asked Questions</h2>
<h3>Can I migrate from WordPress?</h3>
<p>Yes, Directus can import content from any source including WordPress exports.</p>
<h3>Does it support real-time updates?</h3>
<p>Yes, Directus supports WebSockets for real-time data subscriptions.</p>
<h3>What databases are supported?</h3>
<p>PostgreSQL, MySQL, MariaDB, SQLite, MS SQL Server, and Oracle.</p>
`;

const HTML_TABLE = `<h2>Feature Comparison</h2>
<table>
<tr><th>Feature</th><th>Directus</th><th>Strapi</th></tr>
<tr><td>REST API</td><td>Yes</td><td>Yes</td></tr>
<tr><td>GraphQL</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Custom SQL</td><td>Yes</td><td>No</td></tr>
</table>
`;

const HTML_LIST = `<h2>Top Benefits</h2>
<ol>
<li>Complete data ownership</li>
<li>No vendor lock-in</li>
<li>Flexible content modeling</li>
</ol>
`;

// ---------------------------------------------------------------------------
// FAQ Extraction
// ---------------------------------------------------------------------------
describe('extractFAQsFromContent', () => {
  it('extracts FAQs from markdown with h3 questions', () => {
    const faqs = extractFAQsFromContent(MARKDOWN_ARTICLE);
    expect(faqs).toBeDefined();
    expect(faqs!.length).toBe(3);
    expect(faqs![0].question).toBe('What is a headless CMS?');
    expect(faqs![0].answer).toContain('content management system');
    expect(faqs![1].question).toBe('How much does Directus cost?');
    expect(faqs![2].question).toBe('Is Directus better than WordPress?');
  });

  it('extracts FAQs from HTML with h3 questions', () => {
    const faqs = extractFAQsFromContent(HTML_FAQ);
    expect(faqs).toBeDefined();
    expect(faqs!.length).toBe(3);
    expect(faqs![0].question).toBe('Can I migrate from WordPress?');
    expect(faqs![0].answer).toContain('import content');
    expect(faqs![1].question).toBe('Does it support real-time updates?');
    expect(faqs![2].question).toBe('What databases are supported?');
  });

  it('returns undefined for content with no FAQ section', () => {
    expect(extractFAQsFromContent('<p>Just a paragraph</p>')).toBeUndefined();
    expect(extractFAQsFromContent('No FAQ here')).toBeUndefined();
  });

  it('returns undefined for undefined/empty input', () => {
    expect(extractFAQsFromContent(undefined)).toBeUndefined();
    expect(extractFAQsFromContent('')).toBeUndefined();
  });

  it('strips HTML tags from questions and answers', () => {
    const faqs = extractFAQsFromContent(HTML_FAQ);
    for (const faq of faqs!) {
      expect(faq.question).not.toMatch(/<[^>]+>/);
      expect(faq.answer).not.toMatch(/<[^>]+>/);
    }
  });
});

// ---------------------------------------------------------------------------
// Table Extraction
// ---------------------------------------------------------------------------
describe('extractTablesFromContent', () => {
  it('extracts table from markdown with headers and rows', () => {
    const tables = extractTablesFromContent(MARKDOWN_ARTICLE);
    expect(tables).toBeDefined();
    expect(tables!.length).toBe(1);
    expect(tables![0].name).toBe('Comparison Table');
    expect(tables![0].headers).toEqual(['Platform', 'Price', 'Open Source']);
    expect(tables![0].rows).toHaveLength(3);
    expect(tables![0].rows[0]).toEqual(['Directus', 'Free', 'Yes']);
  });

  it('extracts table from HTML', () => {
    const tables = extractTablesFromContent(HTML_TABLE);
    expect(tables).toBeDefined();
    expect(tables!.length).toBe(1);
    expect(tables![0].name).toBe('Feature Comparison');
    expect(tables![0].headers).toEqual(['Feature', 'Directus', 'Strapi']);
    expect(tables![0].rows).toHaveLength(3);
    expect(tables![0].rows[0]).toEqual(['REST API', 'Yes', 'Yes']);
  });

  it('returns undefined for content with no tables', () => {
    expect(extractTablesFromContent('<p>No table here</p>')).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(extractTablesFromContent(undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ItemList Extraction
// ---------------------------------------------------------------------------
describe('extractItemListsFromContent', () => {
  it('extracts numbered list from markdown (min 3 items)', () => {
    const lists = extractItemListsFromContent(MARKDOWN_ARTICLE);
    expect(lists).toBeDefined();
    expect(lists!.length).toBe(1);
    expect(lists![0].name).toBe('Top 5 Reasons to Use a Headless CMS');
    expect(lists![0].items).toHaveLength(5);
    expect(lists![0].items[0]).toBe('Decoupled architecture');
  });

  it('extracts numbered list from HTML', () => {
    const lists = extractItemListsFromContent(HTML_LIST);
    expect(lists).toBeDefined();
    expect(lists!.length).toBe(1);
    expect(lists![0].name).toBe('Top Benefits');
    expect(lists![0].items).toHaveLength(3);
    expect(lists![0].items[0]).toBe('Complete data ownership');
  });

  it('returns undefined for content with no numbered lists', () => {
    expect(extractItemListsFromContent('<p>No list here</p>')).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(extractItemListsFromContent(undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Content Processing Pipeline
// ---------------------------------------------------------------------------
describe('processArticleContent', () => {
  it('converts markdown to HTML with heading IDs', () => {
    const { html, headings } = processArticleContent(MARKDOWN_ARTICLE);
    expect(html).toContain('<h2');
    expect(html).toContain('id="comparison-table"');
    expect(html).toContain('id="frequently-asked-questions"');
    expect(headings.length).toBeGreaterThan(0);
    expect(headings.find((h) => h.text === 'Comparison Table')).toBeDefined();
  });

  it('strips leading h1 tag', () => {
    const { html } = processArticleContent(MARKDOWN_ARTICLE);
    expect(html).not.toContain('Best CMS Platforms in 2025');
  });

  it('wraps FAQ section in section.faq-section', () => {
    const { html } = processArticleContent(MARKDOWN_ARTICLE);
    expect(html).toContain('<section class="faq-section">');
  });

  it('sanitizes dangerous HTML', () => {
    const dirty = '## Title\n\n<script>alert("xss")</script>\n\nSafe content';
    const { html } = processArticleContent(dirty);
    expect(html).not.toContain('<script>');
    expect(html).toContain('Safe content');
  });
});

// ---------------------------------------------------------------------------
// Heading utilities
// ---------------------------------------------------------------------------
describe('addIdsToHeadings', () => {
  it('adds IDs to h2 and h3 elements', () => {
    const result = addIdsToHeadings('<h2>My Heading</h2><h3>Sub Heading</h3>');
    expect(result).toContain('id="my-heading"');
    expect(result).toContain('id="sub-heading"');
  });

  it('preserves existing IDs', () => {
    const result = addIdsToHeadings('<h2 id="existing">Text</h2>');
    expect(result).toContain('id="existing"');
    expect(result).not.toContain('id="text"');
  });
});

describe('wrapFaqSection', () => {
  it('wraps FAQ section in section element', () => {
    const html = '<h2>Frequently Asked Questions</h2><h3>Q?</h3><p>A.</p>';
    const result = wrapFaqSection(html);
    expect(result).toContain('<section class="faq-section">');
  });

  it('returns unchanged HTML when no FAQ heading exists', () => {
    const html = '<h2>Other Section</h2><p>Content</p>';
    const result = wrapFaqSection(html);
    expect(result).toBe(html);
  });
});

describe('extractHeadings', () => {
  it('extracts h2 headings with IDs', () => {
    const html = '<h2 id="intro">Introduction</h2><p>text</p><h2 id="details">Details</h2>';
    const headings = extractHeadings(html);
    expect(headings).toHaveLength(2);
    expect(headings[0]).toEqual({ id: 'intro', text: 'Introduction', level: 2 });
    expect(headings[1]).toEqual({ id: 'details', text: 'Details', level: 2 });
  });

  it('extracts h3 headings alongside h2', () => {
    const html = '<h2 id="section">Section</h2><h3 id="sub">Subsection</h3><h2 id="other">Other</h2>';
    const headings = extractHeadings(html);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toEqual({ id: 'section', text: 'Section', level: 2 });
    expect(headings[1]).toEqual({ id: 'sub', text: 'Subsection', level: 3 });
    expect(headings[2]).toEqual({ id: 'other', text: 'Other', level: 2 });
  });
});

// ---------------------------------------------------------------------------
// SEO utilities
// ---------------------------------------------------------------------------
describe('seo utilities', () => {
  it('getWordCount counts words in HTML content', () => {
    expect(getWordCount('<p>Hello world</p>')).toBe(2);
    expect(getWordCount('One two three four five')).toBe(5);
    expect(getWordCount(undefined)).toBe(0);
  });

  it('textToHeadingId converts text to kebab-case', () => {
    expect(textToHeadingId('Hello World')).toBe('hello-world');
    expect(textToHeadingId('FAQ & Questions!')).toBe('faq-questions');
  });

  it('textToHeadingId transliterates German diacritics', () => {
    expect(textToHeadingId('Häufige Fragen')).toBe('haeufige-fragen');
    expect(textToHeadingId('Über uns')).toBe('ueber-uns');
    expect(textToHeadingId('Größe')).toBe('groesse');
    expect(textToHeadingId('Straße')).toBe('strasse');
  });

  it('textToHeadingId transliterates French and Scandinavian diacritics', () => {
    expect(textToHeadingId('Résumé')).toBe('resume');
    expect(textToHeadingId('Ça va')).toBe('ca-va');
    expect(textToHeadingId('Ærø')).toBe('aero');
    expect(textToHeadingId('Ødegaard')).toBe('odegaard');
  });

  it('parseKeywords splits comma-separated keywords', () => {
    expect(parseKeywords('cms, headless, directus')).toEqual(['cms', 'headless', 'directus']);
    expect(parseKeywords(undefined)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Sanitize
// ---------------------------------------------------------------------------
describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    expect(sanitizeHtml('<p>Safe</p><script>alert(1)</script>')).not.toContain('<script>');
  });

  it('removes event handlers', () => {
    expect(sanitizeHtml('<div onmouseover="alert(1)">text</div>')).not.toContain('onmouseover');
  });

  it('removes javascript: protocols', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).not.toContain('javascript:');
  });

  it('preserves safe HTML', () => {
    const safe = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(safe)).toContain('<strong>world</strong>');
  });
});

// ---------------------------------------------------------------------------
// ArticleSchema — JSON-LD rendering with FAQs, tables, item lists
// ---------------------------------------------------------------------------
describe('ArticleSchema JSON-LD', () => {
  function createDummyPost(): Post {
    return {
      id: 'test-123',
      title: 'Best CMS Platforms in 2025',
      slug: 'best-cms-platforms-2025',
      excerpt: 'A comprehensive comparison of headless CMS platforms.',
      content: MARKDOWN_ARTICLE,
      author: 'John Doe',
      authorTitle: 'CTO',
      authorType: 'Person',
      authorUrl: 'https://johndoe.com',
      publishedDate: '2025-01-15T10:00:00Z',
      status: 'published',
      category: 'technology',
      tags: ['cms', 'headless', 'directus'],
      readingTime: 8,
      articleType: 'blog',
      featuredImage: { url: 'https://cms.example.com/assets/hero.jpg', alt: 'CMS comparison' },
      seo: {
        title: 'Best CMS Platforms Compared - 2025 Guide',
        description: 'Compare top headless CMS platforms including Directus, Strapi, and Contentful.',
        keywords: 'cms, headless cms, directus, strapi',
      },
      ogImage: 'https://cms.example.com/assets/og.jpg',
      ogImageAlt: 'CMS Comparison Chart',
      faqs: extractFAQsFromContent(MARKDOWN_ARTICLE),
      tables: extractTablesFromContent(MARKDOWN_ARTICLE),
      itemLists: extractItemListsFromContent(MARKDOWN_ARTICLE),
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-02-01T12:00:00Z',
      publishedAt: '2025-01-15T10:00:00Z',
    };
  }

  function createDummySettings(): SiteSettings {
    return {
      siteName: 'TechBlog',
      siteTitle: 'TechBlog — Insights',
      siteDescription: 'Technology insights and comparisons.',
      defaultAuthorName: 'TechBlog Team',
      twitterHandle: '@techblog',
      linkedinUrl: 'https://linkedin.com/company/techblog',
      organizationDescription: 'Leading tech blog.',
    };
  }

  function getJsonLd(post: Post, settings: SiteSettings) {
    const element = ArticleSchema({
      post,
      settings,
      categoryName: 'Technology',
      categorySlug: 'technology',
      baseUrl: 'https://techblog.com',
      route: 'blog',
    });
    // ArticleSchema returns <script> with dangerouslySetInnerHTML
    const jsonStr = (element as any).props.dangerouslySetInnerHTML.__html;
    return JSON.parse(jsonStr);
  }

  it('renders valid JSON-LD with @context and @graph', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@graph']).toBeDefined();
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);
  });

  it('includes FAQPage schema with all 3 questions', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const faqPage = jsonLd['@graph'].find((node: any) => node['@type'] === 'FAQPage');
    expect(faqPage).toBeDefined();
    expect(faqPage.mainEntity).toHaveLength(3);
    expect(faqPage.mainEntity[0]['@type']).toBe('Question');
    expect(faqPage.mainEntity[0].name).toBe('What is a headless CMS?');
    expect(faqPage.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(faqPage.mainEntity[0].acceptedAnswer.text).toContain('content management system');
  });

  it('excludes Dataset schema by default (opt-in only)', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const dataset = jsonLd['@graph'].find((node: any) => node['@type'] === 'Dataset');
    expect(dataset).toBeUndefined();
  });

  it('excludes Table schema by default (opt-in only)', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const table = jsonLd['@graph'].find((node: any) => node['@type'] === 'Table');
    expect(table).toBeUndefined();
  });

  it('includes ItemList schema for the numbered list', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const itemList = jsonLd['@graph'].find((node: any) => node['@type'] === 'ItemList');
    expect(itemList).toBeDefined();
    expect(itemList.name).toBe('Top 5 Reasons to Use a Headless CMS');
    expect(itemList.itemListElement).toHaveLength(5);
    expect(itemList.itemListElement[0]['@type']).toBe('ListItem');
    expect(itemList.itemListElement[0].position).toBe(1);
    expect(itemList.itemListElement[0].name).toBe('Decoupled architecture');
  });

  it('excludes speakable from BlogPosting by default (opt-in only)', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const article = jsonLd['@graph'].find((node: any) => node['@type'] === 'BlogPosting');
    expect(article).toBeDefined();
    expect(article.speakable).toBeUndefined();
  });

  it('includes BreadcrumbList with 4 levels', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const breadcrumb = jsonLd['@graph'].find((node: any) => node['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(4);
    expect(breadcrumb.itemListElement[0].name).toBe('Home');
    expect(breadcrumb.itemListElement[3].name).toBe('Best CMS Platforms in 2025');
  });

  it('omits FAQPage/Dataset/ItemList when post has no extracted data', () => {
    const post = createDummyPost();
    post.faqs = undefined;
    post.tables = undefined;
    post.itemLists = undefined;

    const jsonLd = getJsonLd(post, createDummySettings());
    expect(jsonLd['@graph'].find((n: any) => n['@type'] === 'FAQPage')).toBeUndefined();
    expect(jsonLd['@graph'].find((n: any) => n['@type'] === 'Dataset')).toBeUndefined();
    expect(jsonLd['@graph'].find((n: any) => n['@type'] === 'ItemList')).toBeUndefined();
  });

  it('article speakable is absent when no FAQs', () => {
    const post = createDummyPost();
    post.faqs = undefined;

    const jsonLd = getJsonLd(post, createDummySettings());
    const article = jsonLd['@graph'].find((node: any) => node['@type'] === 'BlogPosting');
    expect(article.speakable).toBeUndefined();
  });

  it('Organization schema includes social links', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    const org = jsonLd['@graph'].find((node: any) => node['@type'] === 'Organization');
    expect(org).toBeDefined();
    expect(org.sameAs).toContain('https://twitter.com/techblog');
    expect(org.sameAs).toContain('https://linkedin.com/company/techblog');
  });

  it('full graph has correct node count with all features', () => {
    const jsonLd = getJsonLd(createDummyPost(), createDummySettings());
    // Organization + WebSite + WebPage + BreadcrumbList + BlogPosting +
    // FAQPage + ItemList = 7 (Dataset + Table are opt-in, default OFF)
    expect(jsonLd['@graph']).toHaveLength(7);
  });
});
