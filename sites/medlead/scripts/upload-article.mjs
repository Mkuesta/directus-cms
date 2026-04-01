#!/usr/bin/env node

/**
 * Upload a markdown article to Medlead blog via Directus CMS.
 *
 * Usage:
 *   node scripts/upload-article.mjs --file <article.md> --image <image.webp> --category "news"
 *
 * Options:
 *   --file       Path to the markdown article file (required)
 *   --image      Path to the featured image file (optional)
 *   --category   Category slug (default: "news")
 *   --author     Author name (default: "Medlead")
 *   --status     Post status: published|draft (default: "published")
 *   --language   Language code (default: "en")
 */

import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';

// ── Config ────────────────────────────────────────────────────────────────────
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://cms.drlogist.com';
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_STATIC_TOKEN environment variable is required');
  process.exit(1);
}

// ── CLI args ──────────────────────────────────────────────────────────────────
const { values: args } = parseArgs({
  options: {
    file:     { type: 'string', short: 'f' },
    image:    { type: 'string', short: 'i' },
    category: { type: 'string', short: 'c', default: 'news' },
    author:   { type: 'string', short: 'a', default: '' },
    status:   { type: 'string', short: 's', default: 'published' },
    language: { type: 'string', short: 'l', default: 'en' },
  },
});

if (!args.file) {
  console.error('Usage: node scripts/upload-article.mjs --file <article.md> [--image <image>] [--category <slug>]');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSeoDescription(title) {
  const topic = title
    .replace(/:\s*\d{4}\s*guide/i, '')
    .replace(/:\s*a\s+(comprehensive\s+)?guide/i, '')
    .replace(/\s*guide$/i, '')
    .trim();

  return `Discover ${topic.toLowerCase()}. By Medlead.`;
}

function calculateReadTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function markdownToHtml(md) {
  let html = md;

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Headings (h2–h6, skip h1 as it becomes the title)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>\n`);

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Tables
  html = html.replace(/(^\|.+\|$\n?)+/gm, (tableBlock) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return tableBlock;
    const parseRow = (row) =>
      row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const headerCells = parseRow(rows[0]);
    const thead = `<thead><tr>${headerCells.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const bodyRows = rows.slice(2).filter(r => !/^\|[\s\-:|]+\|$/.test(r));
    const tbody = bodyRows.length
      ? `<tbody>${bodyRows.map(r => `<tr>${parseRow(r).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
      : '';
    return `<table>${thead}${tbody}</table>`;
  });

  // Wrap remaining plain-text lines in <p> tags
  const lines = html.split('\n');
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
    } else if (/^</.test(trimmed)) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function parseMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  // Extract H1 title
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  const title = h1Index >= 0 ? lines[h1Index].replace(/^#\s+/, '').trim() : path.basename(filePath, '.md');

  // Body = everything after the H1
  const bodyLines = h1Index >= 0 ? lines.slice(h1Index + 1) : lines;
  const body = bodyLines.join('\n').trim();

  const slug = slugify(title);
  const readTime = calculateReadTime(body);
  const contentHtml = markdownToHtml(body);

  const seoDescription = buildSeoDescription(title);

  return { title, slug, seoDescription, content: contentHtml, readTime };
}

async function directusFetch(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Directus ${options.method || 'GET'} ${endpoint} failed (${res.status}): ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function uploadImage(filePath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = fileName.endsWith('.webp') ? 'image/webp'
    : fileName.endsWith('.png') ? 'image/png'
    : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg'
    : 'application/octet-stream';

  const form = new FormData();
  form.append('title', fileName.replace(/\.\w+$/, '').replace(/[-_]/g, ' '));
  form.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);

  const result = await directusFetch('/files', {
    method: 'POST',
    body: form,
  });

  console.log(`  Uploaded image: ${result.data.id} (${fileName})`);
  return result.data.id;
}

async function getCategoryId(slug) {
  const result = await directusFetch(
    `/items/medlead_blog_categories?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`
  );
  if (!result.data || result.data.length === 0) {
    throw new Error(`Category with slug "${slug}" not found`);
  }
  return result.data[0].id;
}

async function createPost(postData) {
  const result = await directusFetch('/items/medlead_posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  return result.data;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Medlead Blog Article Uploader');
  console.log('===================================\n');

  // 1. Parse markdown
  const articlePath = path.resolve(args.file);
  if (!fs.existsSync(articlePath)) {
    console.error(`File not found: ${articlePath}`);
    process.exit(1);
  }

  console.log(`Parsing: ${articlePath}`);
  const { title, slug, seoDescription, content, readTime } = parseMarkdown(articlePath);
  console.log(`  Title: ${title}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Read time: ${readTime} min`);
  console.log(`  SEO desc: ${seoDescription}`);

  // 2. Upload image (if provided)
  let featuredImageId = null;
  if (args.image) {
    const imagePath = path.resolve(args.image);
    if (!fs.existsSync(imagePath)) {
      console.error(`Image not found: ${imagePath}`);
      process.exit(1);
    }
    console.log(`\nUploading image: ${imagePath}`);
    featuredImageId = await uploadImage(imagePath);
  }

  // 3. Resolve category
  console.log(`\nResolving category: ${args.category}`);
  const categoryId = await getCategoryId(args.category);
  console.log(`  Category ID: ${categoryId}`);

  // 4. Create post
  console.log('\nCreating blog post...');
  const postData = {
    title,
    slug,
    excerpt: '',
    content,
    author: args.author,
    published_date: new Date().toISOString(),
    status: args.status,
    category: categoryId,
    tags: [],
    read_time: readTime,
    language: args.language,
    article_type: 'blog',
    seo_title: title,
    seo_description: seoDescription,
    meta_description: seoDescription,
  };

  if (featuredImageId) {
    postData.featured_image = featuredImageId;
  }

  const post = await createPost(postData);
  console.log(`\n  Post created successfully!`);
  console.log(`  ID: ${post.id}`);
  console.log(`  URL: ${DIRECTUS_URL}/items/medlead_posts/${post.id}`);
  console.log(`  Frontend: /blog/${args.category}/${slug}`);
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
