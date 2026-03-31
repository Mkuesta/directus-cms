import * as fs from 'node:fs';

const URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const PREFIX = process.env.COLLECTION_PREFIX || 'test';

if (!TOKEN) {
  console.error('Error: DIRECTUS_ADMIN_TOKEN env var is required');
  process.exit(1);
}

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(`ERROR ${method} ${path}: ${res.status} — ${data?.errors?.[0]?.message || res.statusText}`);
    return null;
  }
  return data?.data;
}

function mdToHtml(text: string): string {
  let html = text;

  // Tables
  html = html.replace(/\n\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_m, header: string, rows: string) => {
    const ths = header.split('|').filter(Boolean).map((h: string) => `<th>${h.trim()}</th>`).join('');
    const trs = rows.trim().split('\n').map((r: string) => {
      const tds = r.split('|').filter(Boolean).map((d: string) => `<td>${d.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // List items
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (m) => `<ul>${m.trim()}</ul>`);

  // Paragraphs (lines that don't start with HTML tags)
  html = html.replace(/^(?!<[hultdp])((?!\s*$).+)$/gm, '<p>$1</p>');

  // Clean up extra newlines
  html = html.replace(/\n{2,}/g, '\n');

  return html.trim();
}

async function main() {
  const mdPath = process.argv[2];
  if (!mdPath) {
    console.error('Usage: upload-article <path-to-markdown-file>');
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const content = mdToHtml(md);

  // Extract FAQs
  const faqs: Array<{ question: string; answer: string }> = [];
  const faqSection = md.split('## Frequently Asked Questions')[1];
  if (faqSection) {
    const faqRegex = /### (.+?)\n\n([\s\S]*?)(?=\n### |$)/g;
    let m;
    while ((m = faqRegex.exec(faqSection)) !== null) {
      faqs.push({ question: m[1].trim(), answer: m[2].trim() });
    }
  }
  console.log(`Extracted ${faqs.length} FAQs`);

  // Extract table
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  const tableMatch = md.match(/\| Field Name \| Description \|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/);
  if (tableMatch) {
    const rows = tableMatch[1].trim().split('\n').map((r: string) => {
      return r.split('|').filter(Boolean).map((c: string) => c.trim());
    });
    tables.push({ headers: ['Field Name', 'Description'], rows });
    console.log(`Extracted table with ${rows.length} rows`);
  }

  // Extract related lists
  const itemLists: Array<{ name: string; items: string[] }> = [];
  const relatedMatch = md.match(/## Related Healthcare.*?\n\n([\s\S]*?)(?=\n## |$)/);
  if (relatedMatch) {
    const items = relatedMatch[1].match(/\*\*(.+?)\*\*/g)?.map((i: string) => i.replace(/\*\*/g, '')) || [];
    if (items.length) {
      itemLists.push({ name: 'Related Healthcare Marketing Technology Email Lists', items });
      console.log(`Extracted item list with ${items.length} items`);
    }
  }

  // Get category IDs
  const blogCats = await api('GET', `/items/${PREFIX}_blog_categories`);
  const generalCat = blogCats?.find((c: any) => c.slug === 'general');
  const prodCats = await api('GET', `/items/${PREFIX}_categories`);
  const digitalCat = prodCats?.find((c: any) => c.slug === 'digital-products');

  // 1. Create as blog post
  console.log('\n--- Creating blog post ---');
  const post = await api('POST', `/items/${PREFIX}_posts`, {
    title: 'Healthcare B2B Marketing Data Gathering Software Email List',
    slug: 'healthcare-b2b-marketing-data-gathering-software-email-list',
    excerpt: 'Verified decision-maker contacts for healthcare B2B marketing campaigns. Multi-step verified records across the full buyer landscape.',
    content,
    status: 'published',
    published_date: new Date().toISOString(),
    author: 'Jane Doe',
    author_title: 'Healthcare Marketing Specialist',
    author_type: 'Person',
    article_type: 'Article',
    language: 'en',
    category: generalCat?.id || null,
    tags: ['healthcare', 'b2b', 'marketing', 'email-list', 'data', 'software'],
    read_time: 12,
    seo_title: 'Healthcare B2B Marketing Data Gathering Software Email List 2026',
    seo_description: 'Verified healthcare B2B decision-maker contacts for marketing campaigns. NPI-targeted, GDPR/CAN-SPAM compliant contact database.',
    seo_keywords: 'healthcare b2b marketing, data gathering software, email list, healthcare contacts, NPI database',
    meta_robots: 'index, follow',
    faqs_json: JSON.stringify(faqs),
    tables_json: JSON.stringify(tables),
    itemlists_json: JSON.stringify(itemLists),
  });
  if (post) console.log(`Created post: id=${post.id}, slug=${post.slug}`);

  // 2. Create as product
  console.log('\n--- Creating product ---');
  const product = await api('POST', `/items/${PREFIX}_products`, {
    title: 'Healthcare B2B Marketing Data Gathering Software Email List',
    slug: 'healthcare-b2b-marketing-email-list',
    description: content,
    short_description: 'Verified decision-maker contacts for healthcare B2B marketing. NPI-targeted, multi-step verified records.',
    price: 299.99,
    compare_at_price: 499.99,
    status: 'published',
    featured: true,
    sku: 'DATA-HC-B2B-001',
    publisher: 'Test Site Inc.',
    vat_included: true,
    vat_rate: 19,
    average_rating: 4.6,
    review_count: 18,
    target_audience: 'Healthcare Marketing Professionals',
    features: [
      'Multi-step verified healthcare decision-maker contacts',
      'NPI registry cross-referenced records',
      'GDPR and CAN-SPAM compliant',
      'Geographic, professional, and facility segmentation',
      'CSV/Excel export + CRM integrations',
      'Rolling 30-90 day refresh cycles',
      '19 data fields per contact record',
    ],
    tags: ['healthcare', 'b2b', 'email-list', 'data', 'marketing'],
    category: digitalCat?.id || null,
    site: 1,
    file_format: 'CSV',
    file_size: '45 MB',
    seo_article: '<p>This healthcare B2B marketing data gathering software email list delivers multi-step verified records across the full buyer landscape including pharmaceutical companies, medical device manufacturers, health IT vendors, staffing agencies, and marketing agencies.</p><p>The healthcare B2B marketing technology market reached $3.21 billion in 2025, expanding at 26.7% CAGR to a projected $16.82 billion by 2032.</p>',
    seo_article_title: 'About This Healthcare Email List',
  });
  if (product) console.log(`Created product: id=${product.id}, slug=${product.slug}`);

  console.log('\nDone!');
}

main().catch(console.error);
