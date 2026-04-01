#!/usr/bin/env node

/**
 * Directus Setup for Medlead
 *
 * Creates dedicated collections following the site-prefix pattern:
 * 1. medlead_settings (singleton)
 * 2. medlead_blog_categories
 * 3. medlead_posts
 * 4. medlead_categories
 * 5. medlead_products
 *
 * Then seeds blog categories and sample posts.
 *
 * Usage: node directus-setup.mjs [--reset]
 *
 * Auth (pick one):
 *   DIRECTUS_TOKEN=xxx node directus-setup.mjs
 *   DIRECTUS_EMAIL=admin@example.com DIRECTUS_PASSWORD=secret node directus-setup.mjs
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://cms.drlogist.com';
let DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

// If no static token, try email/password login
if (!DIRECTUS_TOKEN) {
  const email = process.env.DIRECTUS_EMAIL;
  const password = process.env.DIRECTUS_PASSWORD;
  if (email && password) {
    console.log('No DIRECTUS_TOKEN found — logging in with email/password…');
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      console.error(`Login failed [${res.status}]:`, (await res.text()).slice(0, 300));
      process.exit(1);
    }
    const data = await res.json();
    DIRECTUS_TOKEN = data.data.access_token;
    console.log('Login OK — token acquired\n');
  } else {
    console.error('Auth required. Set DIRECTUS_TOKEN or both DIRECTUS_EMAIL + DIRECTUS_PASSWORD.');
    process.exit(1);
  }
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

async function api(method, path, body, opts = {}) {
  const fetchOpts = { method, headers };
  if (body) fetchOpts.body = JSON.stringify(body);
  const res = await fetch(`${DIRECTUS_URL}${path}`, fetchOpts);
  const text = await res.text();
  if (!res.ok) {
    if (!opts.silent) {
      console.error(`[${res.status}] ${method} ${path}:`, text.slice(0, 300));
    }
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ============================================================
// Collection & field creation helpers
// ============================================================

async function collectionExists(name) {
  const res = await api('GET', `/collections/${name}`, null, { silent: true });
  return res?.data != null;
}

async function createCollection(collection, meta = {}, fields = []) {
  if (await collectionExists(collection)) {
    console.log(`  Collection "${collection}" already exists — skipping`);
    return true;
  }

  const payload = {
    collection,
    schema: {},
    meta: {
      icon: meta.icon || 'box',
      note: meta.note || '',
      singleton: meta.singleton || false,
      ...meta,
    },
    fields: [
      // Primary key
      {
        field: 'id',
        type: meta.singleton ? 'integer' : 'uuid',
        meta: { hidden: true, readonly: true, interface: 'input', special: meta.singleton ? undefined : ['uuid'] },
        schema: { is_primary_key: true, has_auto_increment: meta.singleton },
      },
      ...fields,
    ],
  };

  const result = await api('POST', '/collections', payload);
  if (result) {
    console.log(`  Created collection "${collection}"`);
    return true;
  }
  return false;
}

async function addField(collection, field) {
  const result = await api('POST', `/fields/${collection}`, field);
  if (result) {
    console.log(`    + field "${field.field}"`);
    return true;
  }
  return false;
}

async function addRelation(relation) {
  const result = await api('POST', '/relations', relation);
  if (result) {
    console.log(`    + relation ${relation.collection}.${relation.field} -> ${relation.related_collection}`);
    return true;
  }
  return false;
}

function textField(field, iface = 'input', opts = {}) {
  return {
    field,
    type: 'string',
    meta: { interface: iface, ...opts.meta },
    schema: { is_nullable: true, ...opts.schema },
  };
}

function textArea(field, opts = {}) {
  return {
    field,
    type: 'text',
    meta: { interface: 'input-multiline', ...opts.meta },
    schema: { is_nullable: true, ...opts.schema },
  };
}

function richText(field, opts = {}) {
  return {
    field,
    type: 'text',
    meta: { interface: 'input-rich-text-html', ...opts.meta },
    schema: { is_nullable: true, ...opts.schema },
  };
}

function intField(field, opts = {}) {
  return {
    field,
    type: 'integer',
    meta: { interface: 'input', ...opts.meta },
    schema: { is_nullable: true, ...opts.schema },
  };
}

function decimalField(field, opts = {}) {
  return {
    field,
    type: 'decimal',
    meta: { interface: 'input', ...opts.meta },
    schema: { is_nullable: true, numeric_precision: 10, numeric_scale: 2, ...opts.schema },
  };
}

function boolField(field, defaultVal = false) {
  return {
    field,
    type: 'boolean',
    meta: { interface: 'boolean', special: ['cast-boolean'] },
    schema: { is_nullable: true, default_value: defaultVal },
  };
}

function jsonField(field, opts = {}) {
  return {
    field,
    type: 'json',
    meta: { interface: 'input-code', options: { language: 'json' }, special: ['cast-json'], ...opts.meta },
    schema: { is_nullable: true, ...opts.schema },
  };
}

function timestampField(field) {
  return {
    field,
    type: 'timestamp',
    meta: { interface: 'datetime' },
    schema: { is_nullable: true },
  };
}

function statusField() {
  return {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      display: 'labels',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' },
        ],
      },
    },
    schema: { is_nullable: true, default_value: 'draft' },
  };
}

function imageField(field) {
  return {
    field,
    type: 'uuid',
    meta: { interface: 'file-image', special: ['file'] },
    schema: { is_nullable: true },
  };
}

// ============================================================
// Reset: delete all medlead_* collections
// ============================================================
async function resetCollections() {
  console.log('\n=== Resetting medlead_* collections ===');

  // 1. Fetch all collections matching the prefix
  const allCollections = await api('GET', '/collections');
  if (!allCollections?.data) {
    console.error('  Could not fetch collections — aborting reset');
    return;
  }
  const prefixed = allCollections.data
    .filter((c) => c.collection.startsWith('medlead_'))
    .map((c) => c.collection);

  if (prefixed.length === 0) {
    console.log('  No medlead_* collections found — nothing to reset');
    return;
  }
  console.log(`  Found ${prefixed.length} collections: ${prefixed.join(', ')}`);

  // 2. Delete relations first to avoid FK constraint errors
  const allRelations = await api('GET', '/relations');
  if (allRelations?.data) {
    for (const rel of allRelations.data) {
      if (prefixed.includes(rel.collection) || prefixed.includes(rel.related_collection)) {
        console.log(`  Deleting relation ${rel.collection}.${rel.field}`);
        await api('DELETE', `/relations/${rel.collection}/${rel.field}`, null, { silent: true });
      }
    }
  }

  // 3. Delete collections in reverse order (posts/items before settings)
  for (const name of prefixed.reverse()) {
    console.log(`  Deleting collection "${name}"`);
    const result = await api('DELETE', `/collections/${name}`, null, { silent: true });
    if (result === null) {
      // Retry — may already be gone
      console.log(`    (may already be deleted)`);
    }
  }

  console.log('  Reset complete\n');
}

// ============================================================
// STEP 1: Create medlead_settings (singleton)
// ============================================================
async function createSettings() {
  console.log('\n=== Creating medlead_settings ===');

  const created = await createCollection(
    'medlead_settings',
    { icon: 'settings', singleton: true, note: 'Medlead site settings' },
    []
  );
  if (!created) return;

  const fields = [
    textField('site_name'),
    textField('site_title'),
    textArea('site_description'),
    textField('default_author_name'),
    textField('default_author_title'),
    imageField('default_author_image'),
    textArea('organization_description'),
    textField('twitter_handle'),
    textField('linkedin_url'),
    imageField('default_article_image'),
    imageField('default_og_image'),
    imageField('default_logo'),
    // Additional settings fields
    imageField('favicon'),
    imageField('apple_touch_icon'),
    textField('theme_color'),
    textArea('site_tagline'),
    textField('default_language', 'input', { schema: { default_value: 'en' } }),
    textField('primary_color'),
    textField('secondary_color'),
    textArea('homepage_keywords'),
    textField('default_meta_robots', 'input', { schema: { default_value: 'index, follow' } }),
    textField('logo_initials'),
    textField('contact_page_path'),
    textField('default_author_url'),
  ];

  for (const f of fields) {
    await addField('medlead_settings', f);
  }

  // Add file relations
  for (const imgField of ['default_article_image', 'default_og_image', 'default_logo', 'default_author_image', 'favicon', 'apple_touch_icon']) {
    await addRelation({
      collection: 'medlead_settings',
      field: imgField,
      related_collection: 'directus_files',
    });
  }
}

// ============================================================
// STEP 2: Create medlead_blog_categories
// ============================================================
async function createBlogCategories() {
  console.log('\n=== Creating medlead_blog_categories ===');

  const created = await createCollection(
    'medlead_blog_categories',
    { icon: 'category', note: 'Medlead blog categories' },
    []
  );
  if (!created) return;

  const fields = [
    textField('name'),
    textField('slug'),
    textArea('description'),
    textField('seo_title'),
    textArea('seo_description'),
    statusField(),
    intField('sort'),
  ];

  for (const f of fields) {
    await addField('medlead_blog_categories', f);
  }
}

// ============================================================
// STEP 3: Create medlead_posts
// ============================================================
async function createPosts() {
  console.log('\n=== Creating medlead_posts ===');

  const created = await createCollection(
    'medlead_posts',
    { icon: 'article', note: 'Medlead blog posts' },
    []
  );
  if (!created) return;

  const fields = [
    textField('title'),
    textField('slug'),
    textArea('excerpt'),
    richText('content'),
    textField('author'),
    imageField('author_image'),
    textField('author_image_url'),
    timestampField('published_date'),
    statusField(),
    textField('category'),
    jsonField('tags'),
    intField('read_time'),
    imageField('featured_image'),
    textField('featured_image_url'),
    textField('seo_title'),
    textArea('seo_description'),
    textField('seo_keywords'),
    textField('og_image'),
    textField('language', 'input', { schema: { default_value: 'en' } }),
    // SEO fields
    textField('author_url'),
    textField('author_title'),
    {
      field: 'author_type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Person', value: 'Person' },
            { text: 'Organization', value: 'Organization' },
          ],
        },
      },
      schema: { is_nullable: true },
    },
    {
      field: 'article_type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Blog', value: 'blog' },
            { text: 'Product', value: 'product' },
            { text: 'Guide', value: 'guide' },
            { text: 'Comparison', value: 'comparison' },
          ],
        },
      },
      schema: { is_nullable: true, default_value: 'blog' },
    },
    textField('canonical_url'),
    textField('meta_robots'),
    textArea('meta_description'),
    timestampField('updated_date'),
    timestampField('scheduled_publish_date'),
    // Social / Open Graph fields
    textField('og_title'),
    textArea('og_description'),
    textField('og_image_alt'),
    textField('twitter_title'),
    textArea('twitter_description'),
    imageField('twitter_image'),
    textField('twitter_image_alt'),
    // Structured data fields
    jsonField('faqs_json'),
    jsonField('howto_json'),
    jsonField('tables_json'),
  ];

  for (const f of fields) {
    await addField('medlead_posts', f);
  }

  // File relations
  for (const imgField of ['featured_image', 'author_image', 'twitter_image']) {
    await addRelation({
      collection: 'medlead_posts',
      field: imgField,
      related_collection: 'directus_files',
    });
  }
}

// ============================================================
// STEP 4: Create medlead_categories
// ============================================================
async function createCategories() {
  console.log('\n=== Creating medlead_categories ===');

  const created = await createCollection(
    'medlead_categories',
    { icon: 'folder', note: 'Medlead content/product categories' },
    []
  );
  if (!created) return;

  const fields = [
    textField('name'),
    textField('slug'),
    textArea('description'),
    textField('icon'),
    textField('seo_title'),
    textArea('seo_description'),
    richText('seo_article_content'),
    textField('cta_text'),
    textField('cta_url'),
    intField('lead_count'),
    statusField(),
    intField('sort'),
    // parent_id for self-referencing hierarchy
    {
      field: 'parent_id',
      type: 'uuid',
      meta: { interface: 'select-dropdown-m2o', special: ['m2o'] },
      schema: { is_nullable: true },
    },
  ];

  for (const f of fields) {
    await addField('medlead_categories', f);
  }

  // Self-referencing relation for hierarchy
  await addRelation({
    collection: 'medlead_categories',
    field: 'parent_id',
    related_collection: 'medlead_categories',
  });
}

// ============================================================
// STEP 5: Create medlead_products
// ============================================================
async function createProducts() {
  console.log('\n=== Creating medlead_products ===');

  const created = await createCollection(
    'medlead_products',
    { icon: 'shopping_cart', note: 'Medlead downloadable products/reports' },
    []
  );
  if (!created) return;

  const fields = [
    textField('name'),
    textField('slug'),
    textArea('description'),
    textArea('short_description'),
    decimalField('price'),
    textField('currency', 'input', { schema: { default_value: 'USD' } }),
    textField('file_format'),
    decimalField('vat_rate'),
    textField('sku'),
    textField('category'),
    imageField('image'),
    boolField('is_featured', false),
    statusField(),
    jsonField('features'),
    textField('seo_title'),
    textArea('seo_description'),
    textField('seo_article_title'),
    richText('seo_article'),
  ];

  for (const f of fields) {
    await addField('medlead_products', f);
  }

  // File relation for image
  await addRelation({
    collection: 'medlead_products',
    field: 'image',
    related_collection: 'directus_files',
  });
}

// ============================================================
// STEP 6: Create file folders
// ============================================================
async function createFolders() {
  console.log('\n=== Creating file folders ===');

  const existing = await api('GET', '/folders?filter[name][_eq]=medlead');
  let parentId;

  if (existing?.data?.length > 0) {
    parentId = existing.data[0].id;
    console.log('  Parent folder already exists:', parentId);
  } else {
    const parent = await api('POST', '/folders', { name: 'medlead' });
    parentId = parent?.data?.id;
    console.log('  Created parent folder:', parentId);
  }

  if (!parentId) return;

  for (const name of ['blogs', 'categories', 'products', 'settings']) {
    const check = await api('GET', `/folders?filter[name][_eq]=${name}&filter[parent][_eq]=${parentId}`);
    if (check?.data?.length > 0) {
      console.log(`  Subfolder "${name}" already exists`);
    } else {
      await api('POST', '/folders', { name, parent: parentId });
      console.log(`  Created subfolder "${name}"`);
    }
  }
}

// ============================================================
// STEP 7: Seed blog categories
// ============================================================
const SEED_CATEGORIES = [
  {
    name: 'News',
    slug: 'news',
    description: 'Latest news and updates.',
    seo_title: 'News | Medlead',
    seo_description: 'Stay up to date with the latest news from Medlead.',
    status: 'published',
    sort: 1,
  },
  {
    name: 'Guides',
    slug: 'guides',
    description: 'In-depth guides and tutorials.',
    seo_title: 'Guides | Medlead',
    seo_description: 'Comprehensive guides and tutorials from Medlead.',
    status: 'published',
    sort: 2,
  },
  {
    name: 'Resources',
    slug: 'resources',
    description: 'Useful resources, reports, and tools.',
    seo_title: 'Resources | Medlead',
    seo_description: 'Curated resources and tools from Medlead.',
    status: 'published',
    sort: 3,
  },
];

async function seedBlogCategories() {
  console.log('\n=== Seeding blog categories ===');
  const categoryIds = {};

  for (const cat of SEED_CATEGORIES) {
    const existing = await api(
      'GET',
      `/items/medlead_blog_categories?filter[slug][_eq]=${cat.slug}`
    );
    if (existing?.data?.length > 0) {
      categoryIds[cat.slug] = existing.data[0].id;
      console.log(`  "${cat.name}" already exists (ID: ${existing.data[0].id})`);
      continue;
    }

    const result = await api('POST', '/items/medlead_blog_categories', cat);
    if (result?.data) {
      categoryIds[cat.slug] = result.data.id;
      console.log(`  Created "${cat.name}" (ID: ${result.data.id})`);
    }
  }

  return categoryIds;
}

// ============================================================
// STEP 8: Seed sample blog post
// ============================================================
async function seedBlogPosts(categoryIds) {
  console.log('\n=== Seeding sample blog post ===');

  const post = {
    title: 'Welcome to Medlead',
    slug: 'welcome',
    excerpt: 'Your first blog post on Medlead. Edit or replace this with your own content.',
    content: `<h2>Welcome</h2>
<p>This is a sample blog post created by the Directus setup script. You can edit or delete it from the Directus admin panel.</p>

<h2>Getting Started</h2>
<p>Head over to your Directus admin at <strong>${'https://cms.drlogist.com'}</strong> to manage your content, upload images, and publish new articles.</p>`,
    author: 'Medlead',
    published_date: new Date().toISOString(),
    status: 'published',
    read_time: 1,
    tags: JSON.stringify(['welcome', 'getting-started']),
    seo_title: 'Welcome to Medlead',
    seo_description: 'Your first blog post on Medlead.',
    seo_keywords: 'medlead, blog, welcome',
    category: categoryIds['news'],
    language: 'en',
  };

  const existing = await api(
    'GET',
    `/items/medlead_posts?filter[slug][_eq]=${post.slug}`
  );
  if (existing?.data?.length > 0) {
    console.log(`  Post "${post.title}" already exists`);
    return;
  }

  const result = await api('POST', '/items/medlead_posts', post);
  if (result?.data) {
    console.log(`  Created post: "${post.title}" (ID: ${result.data.id})`);
  } else {
    console.error(`  Failed to create post: "${post.title}"`);
  }
}

// ============================================================
// STEP 9: Set public read permissions
// ============================================================
async function setPublicPermissions() {
  console.log('\n=== Setting public read permissions ===');

  // Find the public policy
  const policies = await api('GET', '/policies?filter[name][_eq]=Public');
  let publicPolicyId;

  if (policies?.data?.length > 0) {
    publicPolicyId = policies.data[0].id;
  } else {
    // Try the $public role
    const roles = await api('GET', '/roles');
    const publicRole = roles?.data?.find((r) => r.name === 'Public' || r.id === 'public');
    if (publicRole) {
      const access = await api('GET', `/access?filter[role][_eq]=${publicRole.id}`);
      if (access?.data?.length > 0) {
        publicPolicyId = access.data[0].policy;
      }
    }
  }

  if (!publicPolicyId) {
    console.log('  Could not find public policy — skipping permissions');
    console.log('  You may need to set read permissions manually in Directus admin');
    return;
  }

  const collections = [
    'medlead_settings',
    'medlead_blog_categories',
    'medlead_posts',
    'medlead_categories',
    'medlead_products',
  ];

  for (const collection of collections) {
    const existing = await api(
      'GET',
      `/permissions?filter[policy][_eq]=${publicPolicyId}&filter[collection][_eq]=${collection}&filter[action][_eq]=read`
    );
    if (existing?.data?.length > 0) {
      console.log(`  Read permission for "${collection}" already exists`);
      continue;
    }

    const result = await api('POST', '/permissions', {
      policy: publicPolicyId,
      collection,
      action: 'read',
      fields: ['*'],
    });

    if (result) {
      console.log(`  Set read permission for "${collection}"`);
    }
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('================================================');
  console.log('  Medlead — Directus Collection Setup');
  console.log(`  Target: ${DIRECTUS_URL}`);
  console.log('================================================');

  // Verify connectivity
  const info = await api('GET', '/server/info');
  if (!info) {
    console.error('\nFATAL: Cannot connect to Directus. Check URL and token.');
    process.exit(1);
  }
  console.log('Connected to Directus OK\n');

  // Reset if requested
  if (process.argv.includes('--reset')) {
    await resetCollections();
  }

  // Create collections
  await createSettings();
  await createBlogCategories();
  await createPosts();
  await createCategories();
  await createProducts();

  // Create file folders
  await createFolders();

  // Set public permissions
  await setPublicPermissions();

  // Seed content
  const categoryIds = await seedBlogCategories();
  if (Object.keys(categoryIds).length > 0) {
    await seedBlogPosts(categoryIds);
  }

  console.log('\n================================================');
  console.log('  Setup Complete!');
  console.log('================================================');
  console.log('\n  Collections created:');
  console.log('    - medlead_settings');
  console.log('    - medlead_blog_categories');
  console.log('    - medlead_posts');
  console.log('    - medlead_categories');
  console.log('    - medlead_products');
  console.log('\n  Next: verify in Directus admin at', DIRECTUS_URL);
  console.log('================================================\n');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
