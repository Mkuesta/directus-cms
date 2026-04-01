/**
 * Seed ALL test collections with comprehensive dummy data.
 *
 * Usage:
 *   npx tsx src/seed-all-test-data.ts --url https://cms.drlogist.com --token <token> --prefix test
 */

const PREFIX = 'test';

function parseArgs(args: string[]) {
  const result: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url': result.url = args[++i]; break;
      case '--token': result.token = args[++i]; break;
      case '--prefix': result.prefix = args[++i]; break;
    }
  }
  return result;
}

async function api(url: string, token: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || res.statusText;
    console.error(`  ERROR ${method} ${path}: ${res.status} — ${msg}`);
    return null;
  }
  return data?.data;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const url = (parsed.url as string) || process.env.DIRECTUS_URL || '';
  const token = (parsed.token as string) || process.env.DIRECTUS_ADMIN_TOKEN || '';
  const prefix = (parsed.prefix as string) || PREFIX;

  if (!token) {
    console.error('Token required: --token <token>');
    process.exit(1);
  }

  console.log(`\nSeeding all ${prefix}_* collections with dummy data...\n`);

  // ── 1. Update settings singleton (fill remaining fields) ──
  console.log('--- Settings ---');
  await api(url, token, 'PATCH', `/items/${prefix}_settings`, {
    site_name: 'Test Site',
    site_title: 'Welcome to Test Site',
    site_description: 'A comprehensive test site for validating all Directus CMS features.',
    site_tagline: 'Testing everything, one collection at a time',
    default_author_name: 'Jane Doe',
    default_author_title: 'Content Manager',
    default_author_url: 'https://test-site.vercel.app/about',
    default_author_twitter: '@janedoe',
    organization_description: 'Test Site Inc. builds modern web experiences powered by Directus CMS.',
    twitter_handle: '@testsite',
    linkedin_url: 'https://linkedin.com/company/test-site',
    theme_color: '#3B82F6',
    primary_color: '#2563EB',
    secondary_color: '#F59E0B',
    default_language: 'en',
    homepage_keywords: 'test, cms, directus, headless, nextjs',
    default_meta_robots: 'index, follow',
    logo_initials: 'TS',
    contact_page_path: '/contact',
    sitemap_path: '/sitemap.xml',
  });
  console.log('  Updated settings');

  // ── 2. Analytics settings singleton ──
  console.log('\n--- Analytics Settings ---');
  await api(url, token, 'PATCH', `/items/${prefix}_analytics_settings`, {
    gtm_id: 'GTM-TESTXYZ',
    ga4_id: 'G-TEST12345',
    google_ads_id: 'AW-TEST98765',
    facebook_pixel_id: '1234567890123456',
    hotjar_id: '3456789',
    clarity_id: 'abc123xyz',
    custom_head_scripts: '<!-- Custom head script for testing -->',
    custom_body_scripts: '<!-- Custom body script for testing -->',
    cookie_consent_enabled: true,
    cookie_consent_message: 'We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.',
    cookie_consent_accept_text: 'Accept All',
    cookie_consent_decline_text: 'Decline',
    cookie_consent_policy_url: '/privacy-policy',
  });
  console.log('  Updated analytics settings');

  // ── 3. Update blog categories with SEO fields ──
  console.log('\n--- Blog Categories (update SEO) ---');
  const blogCats = await api(url, token, 'GET', `/items/${prefix}_blog_categories`);
  if (blogCats?.length) {
    for (const cat of blogCats) {
      await api(url, token, 'PATCH', `/items/${prefix}_blog_categories/${cat.id}`, {
        seo_title: `${cat.name} Articles — Test Site`,
        seo_description: `Browse all ${cat.name.toLowerCase()} articles and posts on Test Site.`,
      });
    }
    console.log(`  Updated ${blogCats.length} categories with SEO data`);
  }

  // ── 4. Update existing posts with full SEO/schema data ──
  console.log('\n--- Posts (update with full data) ---');
  const posts = await api(url, token, 'GET', `/items/${prefix}_posts`);
  if (posts?.length) {
    // Link posts to categories
    const catMap: Record<string, number> = {};
    if (blogCats) for (const c of blogCats) catMap[c.slug] = c.id;

    const postUpdates = [
      {
        slug: 'getting-started',
        update: {
          author_title: 'Senior Developer',
          author_type: 'Person',
          author_url: 'https://test-site.vercel.app/about',
          author_twitter: '@janedoe',
          category: catMap['tutorials'] || null,
          tags: ['getting-started', 'beginner', 'guide'],
          read_time: 3,
          seo_title: 'Getting Started with Test Site — Complete Guide',
          seo_description: 'Learn how to get started with your new Directus-powered website in minutes.',
          seo_keywords: 'getting started, setup, guide, directus',
          meta_robots: 'index, follow',
          og_title: 'Getting Started with Test Site',
          og_description: 'Your complete guide to setting up a Directus CMS website.',
          twitter_title: 'Getting Started with Test Site',
          twitter_description: 'Learn how to build a modern site with Directus CMS.',
          faqs_json: JSON.stringify([
            { question: 'How long does setup take?', answer: 'About 5 minutes with our provisioning tool.' },
            { question: 'Do I need coding experience?', answer: 'Basic knowledge of Next.js and React is helpful but not required.' },
          ]),
          content: `<h2>Welcome to Your New Site</h2>
<p>This guide will walk you through setting up your Directus-powered website from scratch.</p>

<h3>Prerequisites</h3>
<ul>
<li>Node.js 18 or later</li>
<li>A Directus instance</li>
<li>A Vercel account</li>
</ul>

<h3>Step 1: Provision Your Collections</h3>
<p>Run the provisioner to create all necessary collections in your Directus instance.</p>

<h3>Step 2: Scaffold Your Site</h3>
<p>Use create-directus-site to generate a complete Next.js project with all integrations.</p>

<h3>Step 3: Deploy</h3>
<p>Deploy to Vercel with a single command using deploy-directus-site.</p>

<h2>Frequently Asked Questions</h2>
<h3>How long does setup take?</h3>
<p>About 5 minutes with our provisioning tool.</p>

<h3>Do I need coding experience?</h3>
<p>Basic knowledge of Next.js and React is helpful but not required.</p>`,
        },
      },
      {
        slug: 'building-with-directus',
        update: {
          author_title: 'CMS Architect',
          author_type: 'Person',
          category: catMap['tutorials'] || null,
          tags: ['directus', 'cms', 'headless', 'architecture'],
          read_time: 7,
          article_type: 'TechArticle',
          seo_title: 'Building Modern Websites with Directus CMS',
          seo_description: 'A deep dive into building production websites with Directus as your headless CMS.',
          seo_keywords: 'directus, headless cms, nextjs, web development',
          meta_robots: 'index, follow',
          content: `<h2>Why Directus?</h2>
<p>Directus is a powerful headless CMS that gives you full control over your content and data model. Unlike traditional CMSes, it wraps your existing SQL database with a modern API.</p>

<h3>Key Benefits</h3>
<ol>
<li>Complete data ownership — your database, your schema</li>
<li>REST and GraphQL APIs out of the box</li>
<li>Granular role-based access control</li>
<li>Built-in file storage and image transformations</li>
<li>Webhooks and automation flows</li>
</ol>

<h3>Architecture Overview</h3>
<p>Our CMS package uses a factory pattern where each module creates a client bound to your specific configuration:</p>

<table>
<thead><tr><th>Package</th><th>Purpose</th><th>Key Function</th></tr></thead>
<tbody>
<tr><td>@mkuesta/core</td><td>Blog &amp; content</td><td>createCmsClient()</td></tr>
<tr><td>@mkuesta/products</td><td>Product catalog</td><td>createProductClient()</td></tr>
<tr><td>@mkuesta/admin</td><td>Admin panel</td><td>createAdminApiHandler()</td></tr>
</tbody>
</table>

<h3>Performance Considerations</h3>
<p>The CMS client includes a 60-second WeakMap-based cache for settings and category lookups, reducing API calls during page rendering.</p>`,
          tables_json: JSON.stringify([
            {
              headers: ['Package', 'Purpose', 'Key Function'],
              rows: [
                ['@mkuesta/core', 'Blog & content', 'createCmsClient()'],
                ['@mkuesta/products', 'Product catalog', 'createProductClient()'],
                ['@mkuesta/admin', 'Admin panel', 'createAdminApiHandler()'],
              ],
            },
          ]),
        },
      },
      {
        slug: 'draft-post-example',
        update: {
          category: catMap['news'] || null,
          tags: ['draft', 'wip'],
          article_type: 'Article',
          seo_title: 'Upcoming Feature Announcement',
          seo_description: 'Stay tuned for our latest feature announcement.',
        },
      },
    ];

    for (const p of postUpdates) {
      const post = posts.find((x: any) => x.slug === p.slug);
      if (post) {
        await api(url, token, 'PATCH', `/items/${prefix}_posts/${post.id}`, p.update);
        console.log(`  Updated: ${p.slug}`);
      }
    }
  }

  // Add two more posts
  const newPosts = [
    {
      title: '10 Tips for Better Content Management',
      slug: '10-tips-content-management',
      excerpt: 'Practical tips for organizing and managing your website content effectively.',
      content: `<h2>Master Your Content Workflow</h2>
<p>Good content management is the foundation of a successful website. Here are our top 10 tips.</p>

<h3>1. Use Consistent Naming Conventions</h3>
<p>Establish clear naming patterns for slugs, categories, and tags from day one.</p>

<h3>2. Write SEO-Friendly Titles</h3>
<p>Keep titles under 60 characters and include your primary keyword.</p>

<h3>3. Optimize Your Images</h3>
<p>Always compress images before upload and provide descriptive alt text.</p>

<h3>4. Schedule Your Content</h3>
<p>Use the scheduled_publish_date field to plan content in advance.</p>

<h3>5. Leverage Categories and Tags</h3>
<p>Organize content hierarchically with categories and use tags for cross-cutting topics.</p>

<h3>6. Write Meta Descriptions</h3>
<p>Every page should have a unique meta description between 120-160 characters.</p>

<h3>7. Use Internal Links</h3>
<p>Link between related articles to improve navigation and SEO.</p>

<h3>8. Keep Content Fresh</h3>
<p>Regularly update older articles with new information and corrected links.</p>

<h3>9. Monitor Analytics</h3>
<p>Track which content performs well and double down on those topics.</p>

<h3>10. Back Up Regularly</h3>
<p>Always maintain backups of your Directus database and uploaded files.</p>`,
      status: 'published',
      published_date: '2026-03-10T10:00:00Z',
      author: 'Jane Doe',
      author_title: 'Content Manager',
      author_type: 'Person',
      article_type: 'Article',
      language: 'en',
      tags: ['content', 'tips', 'management', 'seo'],
      read_time: 5,
      seo_title: '10 Tips for Better Content Management — Test Site',
      seo_description: 'Practical tips for organizing and managing your website content effectively with a headless CMS.',
      seo_keywords: 'content management, cms tips, seo, organization',
      meta_robots: 'index, follow',
      itemlists_json: JSON.stringify([{
        name: 'Content Management Tips',
        items: [
          'Use Consistent Naming Conventions',
          'Write SEO-Friendly Titles',
          'Optimize Your Images',
          'Schedule Your Content',
          'Leverage Categories and Tags',
          'Write Meta Descriptions',
          'Use Internal Links',
          'Keep Content Fresh',
          'Monitor Analytics',
          'Back Up Regularly',
        ],
      }]),
    },
    {
      title: 'How to Set Up Product Categories',
      slug: 'how-to-setup-product-categories',
      excerpt: 'A step-by-step guide to organizing your product catalog with categories.',
      content: `<h2>Organizing Your Product Catalog</h2>
<p>A well-structured category system helps customers find what they need quickly.</p>

<h3>Step 1: Plan Your Category Hierarchy</h3>
<p>Before creating categories, map out the logical groupings for your products.</p>

<h3>Step 2: Create Categories in Directus</h3>
<p>Navigate to the categories collection and add your top-level categories first.</p>

<h3>Step 3: Assign Products</h3>
<p>Edit each product and select the appropriate category from the dropdown.</p>

<h3>Step 4: Set Display Order</h3>
<p>Use the display_order field to control how categories appear on your site.</p>

<h2>FAQ</h2>
<h3>Can products belong to multiple categories?</h3>
<p>Currently each product belongs to one category. Use tags for cross-categorization.</p>

<h3>How many categories should I have?</h3>
<p>Start with 3-7 top-level categories. You can always add more as your catalog grows.</p>`,
      status: 'published',
      published_date: '2026-03-12T14:00:00Z',
      author: 'Jane Doe',
      article_type: 'HowTo',
      language: 'en',
      tags: ['products', 'categories', 'howto', 'ecommerce'],
      read_time: 4,
      seo_title: 'How to Set Up Product Categories — Test Site',
      seo_description: 'Step-by-step guide to organizing your product catalog with categories in Directus CMS.',
      meta_robots: 'index, follow',
      faqs_json: JSON.stringify([
        { question: 'Can products belong to multiple categories?', answer: 'Currently each product belongs to one category. Use tags for cross-categorization.' },
        { question: 'How many categories should I have?', answer: 'Start with 3-7 top-level categories. You can always add more as your catalog grows.' },
      ]),
      howto_json: JSON.stringify({
        name: 'Set Up Product Categories',
        steps: [
          { name: 'Plan Your Category Hierarchy', text: 'Map out the logical groupings for your products.' },
          { name: 'Create Categories in Directus', text: 'Navigate to the categories collection and add your top-level categories.' },
          { name: 'Assign Products', text: 'Edit each product and select the appropriate category.' },
          { name: 'Set Display Order', text: 'Use the display_order field to control category ordering.' },
        ],
      }),
    },
  ];

  for (const post of newPosts) {
    const created = await api(url, token, 'POST', `/items/${prefix}_posts`, post);
    if (created) console.log(`  Created: ${post.slug}`);
  }

  // ── 5. Update products with full data ──
  console.log('\n--- Products (update with full data) ---');
  const existingProducts = await api(url, token, 'GET', `/items/${prefix}_products`);
  if (existingProducts?.length) {
    const prodCats = await api(url, token, 'GET', `/items/${prefix}_categories`);
    const prodCatMap: Record<string, number> = {};
    if (prodCats) for (const c of prodCats) prodCatMap[c.slug] = c.id;

    const prodUpdates: Record<string, any> = {
      'sample-product': {
        description: '<h2>Sample Digital Product</h2><p>This is a comprehensive digital product designed for testing purposes. It includes everything you need to validate your product catalog.</p><h3>What You Get</h3><ul><li>Complete source code</li><li>Documentation</li><li>1 year of updates</li></ul>',
        publisher: 'Test Site Inc.',
        vat_included: true,
        vat_rate: 19,
        average_rating: 4.5,
        review_count: 23,
        target_audience: 'Developers',
        tags: ['digital', 'sample', 'starter'],
        category: prodCatMap['digital-products'] || null,
        file_format: 'ZIP',
        file_size: '15 MB',
        seo_article: '<p>This sample product demonstrates all product catalog features including pricing, reviews, and file delivery.</p>',
        seo_article_title: 'About Sample Product',
      },
      'premium-template': {
        publisher: 'Test Site Inc.',
        vat_included: true,
        vat_rate: 19,
        average_rating: 4.8,
        review_count: 47,
        target_audience: 'Designers & Developers',
        tags: ['template', 'premium', 'responsive'],
        category: prodCatMap['templates'] || null,
        file_size: '42 MB',
        seo_article: '<p>Our premium template pack includes responsive designs, dark mode support, and SEO-optimized layouts for modern websites.</p>',
        seo_article_title: 'About Premium Template',
      },
    };

    for (const prod of existingProducts) {
      if (prodUpdates[prod.slug]) {
        await api(url, token, 'PATCH', `/items/${prefix}_products/${prod.id}`, prodUpdates[prod.slug]);
        console.log(`  Updated: ${prod.slug}`);
      }
    }
  }

  // Add more products
  const newProducts = [
    {
      title: 'E-Commerce Starter Kit',
      slug: 'ecommerce-starter-kit',
      description: '<h2>Complete E-Commerce Starter</h2><p>Everything you need to launch an online store with Directus and Next.js. Includes product pages, cart, and checkout flow.</p>',
      short_description: 'Launch your store in minutes',
      price: 99.99,
      compare_at_price: 149.99,
      status: 'published',
      featured: true,
      sku: 'ECOM-001',
      publisher: 'Test Site Inc.',
      vat_included: true,
      vat_rate: 19,
      average_rating: 4.7,
      review_count: 31,
      target_audience: 'Entrepreneurs',
      features: ['Product catalog', 'Shopping cart', 'Stripe checkout', 'Order management', 'Email notifications'],
      tags: ['ecommerce', 'starter', 'stripe'],
      file_format: 'ZIP',
      file_size: '28 MB',
    },
    {
      title: 'SEO Optimization Guide',
      slug: 'seo-optimization-guide',
      description: '<p>A comprehensive PDF guide covering technical SEO, content optimization, and Schema.org markup for Directus-powered sites.</p>',
      short_description: 'Master SEO for headless CMS',
      price: 19.99,
      status: 'published',
      featured: false,
      sku: 'GUIDE-SEO-001',
      publisher: 'Test Site Inc.',
      features: ['Technical SEO checklist', 'Schema.org templates', 'Content optimization tips'],
      tags: ['seo', 'guide', 'pdf'],
      file_format: 'PDF',
      file_size: '8 MB',
    },
  ];

  for (const prod of newProducts) {
    const created = await api(url, token, 'POST', `/items/${prefix}_products`, prod);
    if (created) console.log(`  Created: ${prod.slug}`);
  }

  // ── 6. Navigation items ──
  console.log('\n--- Navigation Items ---');
  const navItems = [
    { label: 'Home', path: '/', type: 'internal', target: '_self', menu: 'main', status: 'published', sort: 1 },
    { label: 'Blog', path: '/blog', type: 'internal', target: '_self', menu: 'main', status: 'published', sort: 2 },
    { label: 'Products', path: '/products', type: 'internal', target: '_self', menu: 'main', status: 'published', sort: 3 },
    { label: 'About', path: '/about', type: 'internal', target: '_self', menu: 'main', status: 'published', sort: 4 },
    { label: 'Contact', path: '/contact', type: 'internal', target: '_self', menu: 'main', status: 'published', sort: 5 },
    { label: 'Privacy Policy', path: '/privacy-policy', type: 'internal', target: '_self', menu: 'footer', status: 'published', sort: 1 },
    { label: 'Terms of Service', path: '/terms', type: 'internal', target: '_self', menu: 'footer', status: 'published', sort: 2 },
    { label: 'Sitemap', path: '/sitemap.xml', type: 'internal', target: '_self', menu: 'footer', status: 'published', sort: 3 },
    { label: 'GitHub', url: 'https://github.com/test-site', type: 'external', target: '_blank', menu: 'footer', status: 'published', sort: 4, icon: 'github' },
    { label: 'Twitter', url: 'https://twitter.com/testsite', type: 'external', target: '_blank', menu: 'social', status: 'published', sort: 1, icon: 'twitter' },
    { label: 'LinkedIn', url: 'https://linkedin.com/company/test-site', type: 'external', target: '_blank', menu: 'social', status: 'published', sort: 2, icon: 'linkedin' },
  ];

  for (const item of navItems) {
    const created = await api(url, token, 'POST', `/items/${prefix}_navigation_items`, item);
    if (created) console.log(`  Created: ${item.label} (${item.menu})`);
  }

  // Add sub-navigation items (need parent IDs)
  const blogNav = await api(url, token, 'GET', `/items/${prefix}_navigation_items?filter[label][_eq]=Blog&filter[menu][_eq]=main`);
  if (blogNav?.length) {
    const subItems = [
      { label: 'All Posts', path: '/blog', type: 'internal', target: '_self', menu: 'main', status: 'published', parent_id: blogNav[0].id, sort: 1 },
      { label: 'Tutorials', path: '/blog/category/tutorials', type: 'internal', target: '_self', menu: 'main', status: 'published', parent_id: blogNav[0].id, sort: 2 },
      { label: 'News', path: '/blog/category/news', type: 'internal', target: '_self', menu: 'main', status: 'published', parent_id: blogNav[0].id, sort: 3 },
    ];
    for (const sub of subItems) {
      const created = await api(url, token, 'POST', `/items/${prefix}_navigation_items`, sub);
      if (created) console.log(`  Created: ${sub.label} (sub of Blog)`);
    }
  }

  // ── 7. Pages ──
  console.log('\n--- Pages ---');
  const pageData = [
    {
      title: 'About Us',
      slug: 'about',
      content: `<h2>About Test Site</h2>
<p>Test Site is a demonstration project built to validate all features of the Directus CMS package ecosystem.</p>
<h3>Our Mission</h3>
<p>We make it easy to build content-rich websites with Directus as the headless CMS and Next.js on the frontend.</p>
<h3>The Team</h3>
<p>Our team consists of developers, designers, and content strategists who are passionate about modern web development.</p>`,
      excerpt: 'Learn about Test Site and our mission.',
      status: 'published',
      template: 'default',
      published_date: '2026-01-01T00:00:00Z',
      seo_title: 'About Us — Test Site',
      seo_description: 'Learn about Test Site, our mission, and the team behind the Directus CMS package.',
      seo_keywords: 'about, team, mission',
      meta_robots: 'index, follow',
    },
    {
      title: 'Contact',
      slug: 'contact',
      content: `<h2>Get in Touch</h2>
<p>Have questions or feedback? We'd love to hear from you.</p>
<h3>Email</h3>
<p>Send us an email at <a href="mailto:hello@test-site.com">hello@test-site.com</a></p>
<h3>Office</h3>
<p>123 Test Street<br>Berlin, Germany 10115</p>
<h3>Business Hours</h3>
<p>Monday–Friday: 9:00 AM – 6:00 PM CET</p>`,
      excerpt: 'Reach out to the Test Site team.',
      status: 'published',
      template: 'contact',
      published_date: '2026-01-01T00:00:00Z',
      seo_title: 'Contact Us — Test Site',
      seo_description: 'Get in touch with the Test Site team. Email, office address, and business hours.',
      meta_robots: 'index, follow',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `<h2>Privacy Policy</h2>
<p>Last updated: March 1, 2026</p>
<h3>1. Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you fill out a form or contact us.</p>
<h3>2. How We Use Information</h3>
<p>We use the information to provide, maintain, and improve our services.</p>
<h3>3. Cookies</h3>
<p>We use cookies and similar technologies to collect usage data and improve our site. You can manage cookie preferences through the consent banner.</p>
<h3>4. Contact</h3>
<p>For questions about this policy, contact us at privacy@test-site.com.</p>`,
      status: 'published',
      template: 'legal',
      published_date: '2026-03-01T00:00:00Z',
      seo_title: 'Privacy Policy — Test Site',
      seo_description: 'Our privacy policy explains how we collect, use, and protect your personal information.',
      meta_robots: 'noindex, follow',
    },
    {
      title: 'Terms of Service',
      slug: 'terms',
      content: `<h2>Terms of Service</h2>
<p>Last updated: March 1, 2026</p>
<h3>1. Acceptance of Terms</h3>
<p>By accessing this website, you agree to be bound by these terms.</p>
<h3>2. Use License</h3>
<p>Permission is granted to temporarily access the materials on Test Site for personal, non-commercial use only.</p>
<h3>3. Disclaimer</h3>
<p>The materials on this website are provided on an 'as is' basis. Test Site makes no warranties.</p>`,
      status: 'published',
      template: 'legal',
      published_date: '2026-03-01T00:00:00Z',
      seo_title: 'Terms of Service — Test Site',
      meta_robots: 'noindex, follow',
    },
    {
      title: 'Services',
      slug: 'services',
      content: `<h2>Our Services</h2>
<p>We offer a range of web development and CMS integration services.</p>
<h3>CMS Setup</h3>
<p>We provision and configure your Directus instance with all the collections and permissions you need.</p>
<h3>Frontend Development</h3>
<p>Custom Next.js websites built on top of our CMS package for fast, SEO-friendly experiences.</p>
<h3>Maintenance</h3>
<p>Ongoing support, updates, and content management assistance.</p>`,
      excerpt: 'Explore our web development and CMS services.',
      status: 'draft',
      template: 'default',
      seo_title: 'Services — Test Site',
    },
  ];

  for (const page of pageData) {
    const created = await api(url, token, 'POST', `/items/${prefix}_pages`, page);
    if (created) console.log(`  Created: ${page.slug} (${page.status})`);
  }

  // ── 8. Redirects ──
  console.log('\n--- Redirects ---');
  const redirectsData = [
    { source: '/old-blog', destination: '/blog', status_code: 301, is_regex: false, active: true, sort: 1 },
    { source: '/articles/(.*)', destination: '/blog/$1', status_code: 301, is_regex: true, active: true, sort: 2 },
    { source: '/shop', destination: '/products', status_code: 301, is_regex: false, active: true, sort: 3 },
    { source: '/team', destination: '/about', status_code: 302, is_regex: false, active: true, sort: 4 },
    { source: '/legacy-page', destination: '/about', status_code: 301, is_regex: false, active: false, sort: 5 },
  ];

  for (const redirect of redirectsData) {
    const created = await api(url, token, 'POST', `/items/${prefix}_redirects`, redirect);
    if (created) console.log(`  Created: ${redirect.source} → ${redirect.destination} (${redirect.status_code})`);
  }

  // ── 9. Galleries ──
  console.log('\n--- Galleries ---');
  const galleriesData = [
    { title: 'Product Showcase', slug: 'product-showcase', description: 'High-quality images of our featured products.', status: 'published' },
    { title: 'Team Photos', slug: 'team-photos', description: 'Meet the team behind Test Site.', status: 'published' },
    { title: 'Office Tour', slug: 'office-tour', description: 'A behind-the-scenes look at our workspace.', status: 'draft' },
  ];

  for (const gallery of galleriesData) {
    const created = await api(url, token, 'POST', `/items/${prefix}_galleries`, gallery);
    if (created) console.log(`  Created: ${gallery.title} (${gallery.status})`);
  }

  // ── 10. Banners ──
  console.log('\n--- Banners ---');
  const bannersData = [
    {
      title: 'Welcome Banner',
      slug: 'welcome-banner',
      content: '<strong>Welcome!</strong> Check out our latest products and blog posts.',
      type: 'announcement',
      position: 'top',
      link_url: '/products',
      link_text: 'Browse Products',
      background_color: '#2563EB',
      text_color: '#FFFFFF',
      dismissible: true,
      status: 'published',
      sort: 1,
    },
    {
      title: 'Spring Sale',
      slug: 'spring-sale',
      content: '<strong>Spring Sale!</strong> Get 30% off all templates this week only.',
      type: 'promotion',
      position: 'top',
      link_url: '/products',
      link_text: 'Shop Now',
      background_color: '#F59E0B',
      text_color: '#1F2937',
      dismissible: true,
      start_date: '2026-03-01T00:00:00Z',
      end_date: '2026-04-01T00:00:00Z',
      status: 'published',
      sort: 2,
    },
    {
      title: 'Cookie Notice',
      slug: 'cookie-notice',
      content: 'This site uses cookies to enhance your experience. See our <a href="/privacy-policy">Privacy Policy</a>.',
      type: 'info',
      position: 'bottom',
      dismissible: true,
      background_color: '#F3F4F6',
      text_color: '#374151',
      status: 'published',
      sort: 3,
    },
    {
      title: 'Maintenance Notice',
      slug: 'maintenance-notice',
      content: '<strong>Scheduled Maintenance:</strong> Our systems will be briefly unavailable on March 20th from 2-4 AM CET.',
      type: 'warning',
      position: 'top',
      background_color: '#FEF3C7',
      text_color: '#92400E',
      dismissible: false,
      status: 'draft',
      sort: 4,
    },
    {
      title: 'Newsletter Popup',
      slug: 'newsletter-popup',
      content: '<h3>Stay Updated</h3><p>Subscribe to our newsletter for the latest articles and product updates.</p>',
      type: 'popup',
      position: 'popup',
      link_url: '/contact',
      link_text: 'Subscribe',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      dismissible: true,
      target_pages: ['/', '/blog'],
      status: 'published',
      sort: 5,
    },
  ];

  for (const banner of bannersData) {
    const created = await api(url, token, 'POST', `/items/${prefix}_banners`, banner);
    if (created) console.log(`  Created: ${banner.title} (${banner.type})`);
  }

  // ── 11. Translations ──
  console.log('\n--- Translations ---');
  const translationsData = [
    // English
    { key: 'nav.home', locale: 'en', value: 'Home', namespace: 'common' },
    { key: 'nav.blog', locale: 'en', value: 'Blog', namespace: 'common' },
    { key: 'nav.products', locale: 'en', value: 'Products', namespace: 'common' },
    { key: 'nav.about', locale: 'en', value: 'About', namespace: 'common' },
    { key: 'nav.contact', locale: 'en', value: 'Contact', namespace: 'common' },
    { key: 'btn.read_more', locale: 'en', value: 'Read More', namespace: 'common' },
    { key: 'btn.buy_now', locale: 'en', value: 'Buy Now', namespace: 'common' },
    { key: 'btn.add_to_cart', locale: 'en', value: 'Add to Cart', namespace: 'common' },
    { key: 'footer.copyright', locale: 'en', value: '© 2026 Test Site. All rights reserved.', namespace: 'common' },
    { key: 'form.submit', locale: 'en', value: 'Submit', namespace: 'forms' },
    { key: 'form.name', locale: 'en', value: 'Your Name', namespace: 'forms' },
    { key: 'form.email', locale: 'en', value: 'Email Address', namespace: 'forms' },
    { key: 'form.message', locale: 'en', value: 'Your Message', namespace: 'forms' },
    { key: 'form.success', locale: 'en', value: 'Thank you! Your message has been sent.', namespace: 'forms' },
    // German
    { key: 'nav.home', locale: 'de', value: 'Startseite', namespace: 'common' },
    { key: 'nav.blog', locale: 'de', value: 'Blog', namespace: 'common' },
    { key: 'nav.products', locale: 'de', value: 'Produkte', namespace: 'common' },
    { key: 'nav.about', locale: 'de', value: 'Über uns', namespace: 'common' },
    { key: 'nav.contact', locale: 'de', value: 'Kontakt', namespace: 'common' },
    { key: 'btn.read_more', locale: 'de', value: 'Weiterlesen', namespace: 'common' },
    { key: 'btn.buy_now', locale: 'de', value: 'Jetzt kaufen', namespace: 'common' },
    { key: 'btn.add_to_cart', locale: 'de', value: 'In den Warenkorb', namespace: 'common' },
    { key: 'footer.copyright', locale: 'de', value: '© 2026 Test Site. Alle Rechte vorbehalten.', namespace: 'common' },
    { key: 'form.submit', locale: 'de', value: 'Absenden', namespace: 'forms' },
    { key: 'form.name', locale: 'de', value: 'Ihr Name', namespace: 'forms' },
    { key: 'form.email', locale: 'de', value: 'E-Mail-Adresse', namespace: 'forms' },
    { key: 'form.message', locale: 'de', value: 'Ihre Nachricht', namespace: 'forms' },
    { key: 'form.success', locale: 'de', value: 'Vielen Dank! Ihre Nachricht wurde gesendet.', namespace: 'forms' },
    // French
    { key: 'nav.home', locale: 'fr', value: 'Accueil', namespace: 'common' },
    { key: 'nav.blog', locale: 'fr', value: 'Blog', namespace: 'common' },
    { key: 'nav.products', locale: 'fr', value: 'Produits', namespace: 'common' },
    { key: 'nav.about', locale: 'fr', value: "À propos", namespace: 'common' },
    { key: 'nav.contact', locale: 'fr', value: 'Contact', namespace: 'common' },
    { key: 'btn.read_more', locale: 'fr', value: 'Lire la suite', namespace: 'common' },
    { key: 'btn.buy_now', locale: 'fr', value: 'Acheter', namespace: 'common' },
    { key: 'btn.add_to_cart', locale: 'fr', value: 'Ajouter au panier', namespace: 'common' },
    { key: 'footer.copyright', locale: 'fr', value: '© 2026 Test Site. Tous droits réservés.', namespace: 'common' },
    { key: 'form.submit', locale: 'fr', value: 'Envoyer', namespace: 'forms' },
    { key: 'form.name', locale: 'fr', value: 'Votre nom', namespace: 'forms' },
    { key: 'form.email', locale: 'fr', value: 'Adresse e-mail', namespace: 'forms' },
    { key: 'form.message', locale: 'fr', value: 'Votre message', namespace: 'forms' },
    { key: 'form.success', locale: 'fr', value: 'Merci ! Votre message a été envoyé.', namespace: 'forms' },
  ];

  for (const t of translationsData) {
    const created = await api(url, token, 'POST', `/items/${prefix}_translations`, t);
    if (created) console.log(`  Created: ${t.key} (${t.locale})`);
  }

  // ── 12. Form submissions (sample data) ──
  console.log('\n--- Form Submissions ---');
  const formSubmissions = [
    {
      form: 'contact',
      data: { name: 'Alice Johnson', email: 'alice@example.com', message: 'Love the new site! Great work on the product catalog.' },
      ip: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      referrer: 'https://test-site.vercel.app/contact',
      site_name: 'Test Site',
      status: 'read',
    },
    {
      form: 'contact',
      data: { name: 'Bob Smith', email: 'bob@example.com', message: 'I have a question about the Premium Template. Does it support dark mode?' },
      ip: '10.0.0.42',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      referrer: 'https://test-site.vercel.app/products',
      site_name: 'Test Site',
      status: 'new',
    },
    {
      form: 'newsletter',
      data: { email: 'carol@example.com', preferences: ['blog', 'products'] },
      ip: '172.16.0.5',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
      referrer: 'https://test-site.vercel.app/',
      site_name: 'Test Site',
      status: 'new',
    },
    {
      form: 'contact',
      data: { name: 'Spam Bot', email: 'spam@spam.spam', message: 'Buy cheap watches at spam-site.com!!!' },
      ip: '203.0.113.1',
      user_agent: 'SpamBot/1.0',
      site_name: 'Test Site',
      status: 'spam',
    },
  ];

  for (const sub of formSubmissions) {
    const created = await api(url, token, 'POST', `/items/${prefix}_form_submissions`, sub);
    if (created) console.log(`  Created: ${sub.form} from ${sub.data.name || sub.data.email}`);
  }

  console.log('\n=== All done! ===\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
