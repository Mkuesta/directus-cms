import { describe, it, expect } from 'vitest';
import { createMockDirectus } from '../../directus-cms-testing/src/mock-directus.js';
import {
  createMockCmsConfig,
  createMockProductConfig,
  createMockAnalyticsConfig,
  createMockNavigationConfig,
  createMockBannerConfig,
  createMockRedirectConfig,
  createMockI18nConfig,
  createMockFormConfig,
} from '../../directus-cms-testing/src/mock-configs.js';
import {
  createPost,
  createDirectusPost,
  createProduct,
  createDirectusProduct,
  createBlogCategory,
  createDirectusBlogCategory,
  createSiteSettings,
  createDirectusSiteSettings,
  createBanner,
  createDirectusBanner,
  createMenuItem,
  createDirectusNavigationItem,
  createRedirect,
  createDirectusRedirect,
  createPage,
  createDirectusPage,
} from '../../directus-cms-testing/src/fixtures/index.js';
import { createTmpDir, removeTmpDir } from '../../directus-cms-testing/src/cleanup.js';
import * as fs from 'node:fs';

// ---------------------------------------------------------------------------
// createMockDirectus
// ---------------------------------------------------------------------------

describe('createMockDirectus', () => {
  it('returns client with request, _config, _calls, and _reset methods', () => {
    const client = createMockDirectus();
    expect(typeof client.request).toBe('function');
    expect(client._config).toBeDefined();
    expect(Array.isArray(client._calls)).toBe(true);
    expect(typeof client._reset).toBe('function');
  });

  it('request() returns configured data', async () => {
    const mockPosts = [{ id: '1', title: 'Post 1' }];
    const client = createMockDirectus({ data: { posts: mockPosts } });
    const result = await client.request({ _collection: 'posts' });
    expect(result).toEqual(mockPosts);
  });

  it('request() tracks calls in _calls array', async () => {
    const client = createMockDirectus({ data: { posts: [] } });
    expect(client._calls).toHaveLength(0);

    const query1 = { _collection: 'posts' };
    const query2 = { _collection: 'posts', filter: { status: 'published' } };
    await client.request(query1);
    await client.request(query2);

    expect(client._calls).toHaveLength(2);
    expect(client._calls[0].query).toBe(query1);
    expect(client._calls[1].query).toBe(query2);
    expect(typeof client._calls[0].timestamp).toBe('number');
    expect(typeof client._calls[1].timestamp).toBe('number');
  });

  it('_reset() clears call history', async () => {
    const client = createMockDirectus({ data: { posts: [] } });
    await client.request({ _collection: 'posts' });
    await client.request({ _collection: 'posts' });
    expect(client._calls).toHaveLength(2);

    client._reset();
    expect(client._calls).toHaveLength(0);
  });

  it('shouldFail mode causes request() to throw', async () => {
    const client = createMockDirectus({ shouldFail: true });
    await expect(client.request({})).rejects.toThrow('Mock Directus request failed');
  });

  it('custom error is thrown when configured', async () => {
    const customError = new Error('Custom failure message');
    const client = createMockDirectus({ shouldFail: true, error: customError });
    await expect(client.request({})).rejects.toThrow('Custom failure message');
  });

  it('returns empty array when no data configured', async () => {
    const client = createMockDirectus();
    const result = await client.request({});
    expect(result).toEqual([]);
  });

  it('returns singleton data when configured', async () => {
    const settings = { site_name: 'My Site', theme_color: '#ff0000' };
    const client = createMockDirectus({ singletons: { settings } });
    const result = await client.request({ _collection: 'settings' });
    expect(result).toEqual(settings);
  });

  it('returns first data set when query does not match any collection', async () => {
    const mockPosts = [{ id: '1', title: 'Hello' }];
    const client = createMockDirectus({ data: { posts: mockPosts } });
    // Query without matching collection key
    const result = await client.request({ something: 'else' });
    expect(result).toEqual(mockPosts);
  });

  it('returns first singleton when no data matches but singletons exist', async () => {
    const settings = { site_name: 'Fallback Site' };
    const client = createMockDirectus({ singletons: { settings } });
    const result = await client.request({ something: 'unmatched' });
    expect(result).toEqual(settings);
  });
});

// ---------------------------------------------------------------------------
// Config factories
// ---------------------------------------------------------------------------

describe('Config factories', () => {
  describe('createMockCmsConfig', () => {
    it('returns valid config with all required fields', () => {
      const config = createMockCmsConfig();
      expect(config.directus).toBeDefined();
      expect(typeof config.directus.request).toBe('function');
      expect(config.collections).toBeDefined();
      expect(config.collections.posts).toBe('test_posts');
      expect(config.collections.settings).toBe('test_settings');
      expect(config.collections.blogCategories).toBe('test_blog_categories');
      expect(config.collections.categories).toBe('test_categories');
      expect(config.collections.products).toBe('test_products');
      expect(config.siteName).toBe('Test Site');
      expect(config.baseUrl).toBe('https://test.example.com');
      expect(config.directusUrl).toBe('https://cms.test.example.com');
      expect(config.route).toBe('blog');
    });

    it('accepts overrides', () => {
      const config = createMockCmsConfig({
        siteName: 'Overridden Site',
        route: 'articles',
        baseUrl: 'https://custom.example.com',
      });
      expect(config.siteName).toBe('Overridden Site');
      expect(config.route).toBe('articles');
      expect(config.baseUrl).toBe('https://custom.example.com');
      // Non-overridden fields remain default
      expect(config.directusUrl).toBe('https://cms.test.example.com');
    });
  });

  describe('createMockProductConfig', () => {
    it('returns valid config with siteId and currency', () => {
      const config = createMockProductConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.products).toBe('test_products');
      expect(config.collections.categories).toBe('test_categories');
      expect(config.collections.settings).toBe('test_settings');
      expect(config.siteId).toBe(1);
      expect(config.currency).toBe('EUR');
      expect(config.productRoute).toBe('product');
      expect(config.categoryRoute).toBe('category');
      expect(config.listingRoute).toBe('products');
      expect(config.siteName).toBe('Test Site');
      expect(config.baseUrl).toBe('https://test.example.com');
    });

    it('accepts overrides', () => {
      const config = createMockProductConfig({
        siteId: 5,
        currency: 'USD',
      });
      expect(config.siteId).toBe(5);
      expect(config.currency).toBe('USD');
    });
  });

  describe('createMockAnalyticsConfig', () => {
    it('returns valid config', () => {
      const config = createMockAnalyticsConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.settings).toBe('test_analytics_settings');
      expect(config.directusUrl).toBe('https://cms.test.example.com');
    });

    it('accepts overrides', () => {
      const config = createMockAnalyticsConfig({
        directusUrl: 'https://other.example.com',
      });
      expect(config.directusUrl).toBe('https://other.example.com');
    });
  });

  describe('createMockNavigationConfig', () => {
    it('returns valid config', () => {
      const config = createMockNavigationConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.items).toBe('test_navigation_items');
      expect(config.directusUrl).toBe('https://cms.test.example.com');
    });

    it('accepts overrides', () => {
      const config = createMockNavigationConfig({
        directusUrl: 'https://nav.example.com',
      });
      expect(config.directusUrl).toBe('https://nav.example.com');
    });
  });

  describe('createMockBannerConfig', () => {
    it('returns valid config', () => {
      const config = createMockBannerConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.banners).toBe('test_banners');
      expect(config.directusUrl).toBe('https://cms.test.example.com');
    });

    it('accepts overrides', () => {
      const config = createMockBannerConfig({
        collections: { banners: 'custom_banners' },
      });
      expect(config.collections.banners).toBe('custom_banners');
    });
  });

  describe('createMockRedirectConfig', () => {
    it('returns valid config', () => {
      const config = createMockRedirectConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.redirects).toBe('test_redirects');
      expect(config.directusUrl).toBe('https://cms.test.example.com');
    });

    it('accepts overrides', () => {
      const config = createMockRedirectConfig({
        directusUrl: 'https://redirects.example.com',
      });
      expect(config.directusUrl).toBe('https://redirects.example.com');
    });
  });

  describe('createMockI18nConfig', () => {
    it('returns valid config with locales', () => {
      const config = createMockI18nConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.translations).toBe('test_translations');
      expect(config.directusUrl).toBe('https://cms.test.example.com');
      expect(config.defaultLocale).toBe('en');
      expect(config.locales).toEqual(['en', 'de', 'fr']);
    });

    it('accepts overrides', () => {
      const config = createMockI18nConfig({
        defaultLocale: 'de',
        locales: ['de', 'en', 'es'],
      });
      expect(config.defaultLocale).toBe('de');
      expect(config.locales).toEqual(['de', 'en', 'es']);
    });
  });

  describe('createMockFormConfig', () => {
    it('returns valid config', () => {
      const config = createMockFormConfig();
      expect(config.directus).toBeDefined();
      expect(config.collections.submissions).toBe('test_form_submissions');
      expect(config.siteName).toBe('Test Site');
    });

    it('accepts overrides', () => {
      const config = createMockFormConfig({
        siteName: 'Custom Site',
      });
      expect(config.siteName).toBe('Custom Site');
    });
  });
});

// ---------------------------------------------------------------------------
// Fixture factories
// ---------------------------------------------------------------------------

describe('Fixture factories', () => {
  describe('createPost / createDirectusPost', () => {
    it('createPost returns post with unique id and camelCase fields', () => {
      const post = createPost();
      expect(post.id).toBeDefined();
      expect(post.title).toContain('Test Post');
      expect(post.slug).toContain('test-post-');
      expect(post.excerpt).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.author).toBe('Test Author');
      expect(post.authorTitle).toBe('Test Author Title');
      expect(post.authorType).toBe('Person');
      expect(post.publishedDate).toBe('2024-01-15T10:00:00Z');
      expect(post.status).toBe('published');
      expect(post.readingTime).toBe(5);
      expect(post.articleType).toBe('blog');
      expect(post.tags).toEqual(['test', 'fixture']);
      expect(post.seo).toBeDefined();
    });

    it('createDirectusPost returns post with unique id and snake_case fields', () => {
      const post = createDirectusPost();
      expect(post.id).toBeDefined();
      expect(post.title).toContain('Test Post');
      expect(post.slug).toContain('test-post-');
      expect(post.author_title).toBe('Test Author Title');
      expect(post.author_type).toBe('Person');
      expect(post.published_date).toBe('2024-01-15T10:00:00Z');
      expect(post.read_time).toBe(5);
      expect(post.article_type).toBe('blog');
      expect(post.featured_image).toBeNull();
      expect(post.seo_title).toBeNull();
      expect(post.seo_description).toBeNull();
    });

    it('createPost accepts overrides', () => {
      const post = createPost({ title: 'Custom Title', status: 'draft' as const });
      expect(post.title).toBe('Custom Title');
      expect(post.status).toBe('draft');
    });

    it('createDirectusPost accepts overrides', () => {
      const post = createDirectusPost({ title: 'Custom Title', status: 'draft' });
      expect(post.title).toBe('Custom Title');
      expect(post.status).toBe('draft');
    });

    it('consecutive calls produce different IDs', () => {
      const post1 = createPost();
      const post2 = createPost();
      expect(post1.id).not.toBe(post2.id);
    });

    it('consecutive createDirectusPost calls produce different IDs', () => {
      const post1 = createDirectusPost();
      const post2 = createDirectusPost();
      expect(post1.id).not.toBe(post2.id);
    });
  });

  describe('createProduct / createDirectusProduct', () => {
    it('createProduct returns product with camelCase fields', () => {
      const product = createProduct();
      expect(product.id).toBeDefined();
      expect(product.title).toContain('Test Product');
      expect(product.slug).toContain('test-product-');
      expect(product.shortDescription).toBeDefined();
      expect(product.price).toBe(29.99);
      expect(product.compareAtPrice).toBe(39.99);
      expect(product.status).toBe('published');
      expect(product.featured).toBe(false);
      expect(product.sku).toContain('SKU-');
      expect(product.publisher).toBe('Test Publisher');
      expect(product.category).toBeDefined();
      expect(product.category.slug).toBe('test-category');
      expect(product.averageRating).toBe(4.5);
      expect(product.reviewCount).toBe(10);
      expect(product.features).toEqual(['Feature 1', 'Feature 2']);
    });

    it('createDirectusProduct returns product with snake_case fields', () => {
      const product = createDirectusProduct();
      expect(product.id).toBeDefined();
      expect(product.title).toContain('Test Product');
      expect(product.short_description).toBeDefined();
      expect(product.compare_at_price).toBe(39.99);
      expect(product.average_rating).toBe(4.5);
      expect(product.review_count).toBe(10);
      expect(product.date_created).toBe('2024-01-15T10:00:00Z');
      expect(product.site).toBe(1);
    });

    it('createProduct accepts overrides', () => {
      const product = createProduct({ price: 99.99, featured: true });
      expect(product.price).toBe(99.99);
      expect(product.featured).toBe(true);
    });

    it('createDirectusProduct accepts overrides', () => {
      const product = createDirectusProduct({ price: 49.99, featured: true });
      expect(product.price).toBe(49.99);
      expect(product.featured).toBe(true);
    });

    it('consecutive calls produce different IDs', () => {
      const p1 = createProduct();
      const p2 = createProduct();
      expect(p1.id).not.toBe(p2.id);
    });
  });

  describe('createBlogCategory / createDirectusBlogCategory', () => {
    it('createBlogCategory returns category with camelCase fields', () => {
      const cat = createBlogCategory();
      expect(cat.id).toBeDefined();
      expect(cat.name).toContain('Category');
      expect(cat.slug).toContain('category-');
      expect(cat.description).toBeDefined();
    });

    it('createDirectusBlogCategory returns category with snake_case fields', () => {
      const cat = createDirectusBlogCategory();
      expect(cat.id).toBeDefined();
      expect(cat.name).toContain('Category');
      expect(cat.slug).toContain('category-');
      expect(cat.sort).toBeDefined();
    });

    it('createBlogCategory accepts overrides', () => {
      const cat = createBlogCategory({ name: 'Custom Category' });
      expect(cat.name).toBe('Custom Category');
    });

    it('createDirectusBlogCategory accepts overrides', () => {
      const cat = createDirectusBlogCategory({ name: 'Custom Category', sort: 99 });
      expect(cat.name).toBe('Custom Category');
      expect(cat.sort).toBe(99);
    });

    it('consecutive calls produce different IDs', () => {
      const c1 = createBlogCategory();
      const c2 = createBlogCategory();
      expect(c1.id).not.toBe(c2.id);
    });
  });

  describe('createSiteSettings / createDirectusSiteSettings', () => {
    it('createSiteSettings returns settings with camelCase fields', () => {
      const settings = createSiteSettings();
      expect(settings.siteName).toBe('Test Site');
      expect(settings.siteTitle).toBe('Test Site Title');
      expect(settings.siteDescription).toBe('A test site for unit testing');
      expect(settings.defaultAuthorName).toBe('Test Author');
      expect(settings.defaultAuthorTitle).toBe('Test Author Title');
      expect(settings.themeColor).toBe('#000000');
    });

    it('createDirectusSiteSettings returns settings with snake_case fields', () => {
      const settings = createDirectusSiteSettings();
      expect(settings.id).toBe(1);
      expect(settings.site_name).toBe('Test Site');
      expect(settings.site_title).toBe('Test Site Title');
      expect(settings.site_description).toBe('A test site for unit testing');
      expect(settings.default_author_name).toBe('Test Author');
      expect(settings.default_author_title).toBe('Test Author Title');
      expect(settings.theme_color).toBe('#000000');
      expect(settings.twitter_handle).toBeNull();
    });

    it('createSiteSettings accepts overrides', () => {
      const settings = createSiteSettings({ siteName: 'Custom Site', themeColor: '#ff0000' });
      expect(settings.siteName).toBe('Custom Site');
      expect(settings.themeColor).toBe('#ff0000');
    });

    it('createDirectusSiteSettings accepts overrides', () => {
      const settings = createDirectusSiteSettings({ site_name: 'Custom Site', twitter_handle: '@test' });
      expect(settings.site_name).toBe('Custom Site');
      expect(settings.twitter_handle).toBe('@test');
    });
  });

  describe('createBanner / createDirectusBanner', () => {
    it('createBanner returns banner with camelCase fields', () => {
      const banner = createBanner();
      expect(banner.id).toBeDefined();
      expect(banner.title).toContain('Banner');
      expect(banner.message).toContain('Banner message');
      expect(banner.type).toBe('info');
      expect(banner.dismissible).toBe(true);
      expect(banner.url).toBeUndefined();
      expect(banner.urlText).toBeUndefined();
      expect(banner.startDate).toBeUndefined();
      expect(banner.endDate).toBeUndefined();
    });

    it('createDirectusBanner returns banner with snake_case fields', () => {
      const banner = createDirectusBanner();
      expect(banner.id).toBeDefined();
      expect(banner.title).toContain('Banner');
      expect(banner.url_text).toBeNull();
      expect(banner.start_date).toBeNull();
      expect(banner.end_date).toBeNull();
      expect(banner.status).toBe('published');
      expect(banner.site).toBeNull();
    });

    it('createBanner accepts overrides', () => {
      const banner = createBanner({ type: 'warning' as const, dismissible: false });
      expect(banner.type).toBe('warning');
      expect(banner.dismissible).toBe(false);
    });

    it('createDirectusBanner accepts overrides', () => {
      const banner = createDirectusBanner({ type: 'error', dismissible: false });
      expect(banner.type).toBe('error');
      expect(banner.dismissible).toBe(false);
    });

    it('consecutive calls produce different IDs', () => {
      const b1 = createBanner();
      const b2 = createBanner();
      expect(b1.id).not.toBe(b2.id);
    });
  });

  describe('createMenuItem / createDirectusNavigationItem', () => {
    it('createMenuItem returns menu item with camelCase fields', () => {
      const item = createMenuItem();
      expect(item.id).toBeDefined();
      expect(item.label).toContain('Nav Item');
      expect(item.url).toContain('/page-');
      expect(item.external).toBe(false);
      expect(item.target).toBe('_self');
      expect(item.children).toEqual([]);
      expect(item.sort).toBeDefined();
    });

    it('createDirectusNavigationItem returns item with snake_case fields', () => {
      const item = createDirectusNavigationItem();
      expect(item.id).toBeDefined();
      expect(item.label).toContain('Nav Item');
      expect(item.path).toContain('/page-');
      expect(item.type).toBe('internal');
      expect(item.target).toBe('_self');
      expect(item.menu).toBe('header');
      expect(item.parent_id).toBeNull();
      expect(item.css_class).toBeNull();
      expect(item.status).toBe('published');
    });

    it('createMenuItem accepts overrides', () => {
      const item = createMenuItem({ label: 'Custom Link', external: true });
      expect(item.label).toBe('Custom Link');
      expect(item.external).toBe(true);
    });

    it('createDirectusNavigationItem accepts overrides', () => {
      const item = createDirectusNavigationItem({ menu: 'footer', parent_id: 5 });
      expect(item.menu).toBe('footer');
      expect(item.parent_id).toBe(5);
    });

    it('consecutive calls produce different IDs', () => {
      const n1 = createMenuItem();
      const n2 = createMenuItem();
      expect(n1.id).not.toBe(n2.id);
    });
  });

  describe('createRedirect / createDirectusRedirect', () => {
    it('createRedirect returns redirect with camelCase fields', () => {
      const redirect = createRedirect();
      expect(redirect.id).toBeDefined();
      expect(redirect.source).toContain('/old-page-');
      expect(redirect.destination).toContain('/new-page-');
      expect(redirect.statusCode).toBe(301);
      expect(redirect.isRegex).toBe(false);
    });

    it('createDirectusRedirect returns redirect with snake_case fields', () => {
      const redirect = createDirectusRedirect();
      expect(redirect.id).toBeDefined();
      expect(redirect.source).toContain('/old-page-');
      expect(redirect.destination).toContain('/new-page-');
      expect(redirect.status_code).toBe(301);
      expect(redirect.is_regex).toBe(false);
      expect(redirect.status).toBe('published');
      expect(redirect.site).toBeNull();
    });

    it('createRedirect accepts overrides', () => {
      const redirect = createRedirect({ statusCode: 302, isRegex: true });
      expect(redirect.statusCode).toBe(302);
      expect(redirect.isRegex).toBe(true);
    });

    it('createDirectusRedirect accepts overrides', () => {
      const redirect = createDirectusRedirect({ status_code: 307, is_regex: true });
      expect(redirect.status_code).toBe(307);
      expect(redirect.is_regex).toBe(true);
    });

    it('consecutive calls produce different IDs', () => {
      const r1 = createRedirect();
      const r2 = createRedirect();
      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe('createPage / createDirectusPage', () => {
    it('createPage returns page with camelCase fields', () => {
      const page = createPage();
      expect(page.id).toBeDefined();
      expect(page.title).toContain('Page');
      expect(page.slug).toContain('page-');
      expect(page.content).toContain('<p>Content for page');
      expect(page.excerpt).toBeDefined();
      expect(page.featuredImage).toBeUndefined();
      expect(page.parentId).toBeUndefined();
      expect(page.template).toBe('default');
      expect(page.status).toBe('published');
      expect(page.seo).toBeDefined();
      expect(page.seo.title).toBeUndefined();
      expect(page.seo.description).toBeUndefined();
      expect(page.publishedDate).toBe('2024-01-15T10:00:00Z');
    });

    it('createDirectusPage returns page with snake_case fields', () => {
      const page = createDirectusPage();
      expect(page.id).toBeDefined();
      expect(page.title).toContain('Page');
      expect(page.slug).toContain('page-');
      expect(page.featured_image).toBeNull();
      expect(page.parent_id).toBeNull();
      expect(page.template).toBe('default');
      expect(page.status).toBe('published');
      expect(page.seo_title).toBeNull();
      expect(page.seo_description).toBeNull();
      expect(page.seo_keywords).toBeNull();
      expect(page.published_date).toBe('2024-01-15T10:00:00Z');
      expect(page.site).toBeNull();
    });

    it('createPage accepts overrides', () => {
      const page = createPage({ title: 'About Us', template: 'landing' });
      expect(page.title).toBe('About Us');
      expect(page.template).toBe('landing');
    });

    it('createDirectusPage accepts overrides', () => {
      const page = createDirectusPage({ title: 'About Us', parent_id: 3 });
      expect(page.title).toBe('About Us');
      expect(page.parent_id).toBe(3);
    });

    it('consecutive calls produce different IDs', () => {
      const p1 = createPage();
      const p2 = createPage();
      expect(p1.id).not.toBe(p2.id);
    });
  });
});

// ---------------------------------------------------------------------------
// Cleanup utilities
// ---------------------------------------------------------------------------

describe('Cleanup utilities', () => {
  it('createTmpDir creates a directory that exists', () => {
    const dir = createTmpDir();
    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.statSync(dir).isDirectory()).toBe(true);
    // Clean up
    removeTmpDir(dir);
  });

  it('createTmpDir creates directory with custom prefix', () => {
    const dir = createTmpDir('custom-prefix-');
    expect(fs.existsSync(dir)).toBe(true);
    expect(dir).toContain('custom-prefix-');
    removeTmpDir(dir);
  });

  it('removeTmpDir removes the directory', () => {
    const dir = createTmpDir();
    expect(fs.existsSync(dir)).toBe(true);

    // Write a file inside so we verify recursive removal
    fs.writeFileSync(`${dir}/test-file.txt`, 'hello');
    expect(fs.existsSync(`${dir}/test-file.txt`)).toBe(true);

    removeTmpDir(dir);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it('removeTmpDir handles non-existent directory without error', () => {
    // Should not throw when directory does not exist
    expect(() => removeTmpDir('/tmp/nonexistent-dir-that-does-not-exist-12345')).not.toThrow();
  });
});
