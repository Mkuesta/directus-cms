let _postId = 1;

export function resetPostCounter() { _postId = 1; }

export function createDirectusPost(overrides?: Record<string, any>) {
  const id = String(_postId++);
  return {
    id,
    title: `Test Post ${id}`,
    slug: `test-post-${id}`,
    excerpt: `Excerpt for test post ${id}`,
    content: `<p>Content for test post ${id}</p>`,
    author: 'Test Author',
    author_title: 'Test Author Title',
    author_type: 'Person',
    author_image: null,
    author_url: null,
    author_twitter: null,
    published_date: '2024-01-15T10:00:00Z',
    updated_date: null,
    scheduled_publish_date: null,
    status: 'published',
    category: 1,
    tags: ['test', 'fixture'],
    read_time: 5,
    article_type: 'blog',
    featured_image: null,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    faqs_json: null,
    howto_json: null,
    tables_json: null,
    itemlists_json: null,
    language: 'en',
    ...overrides,
  };
}

export function createPost(overrides?: Record<string, any>) {
  const id = String(_postId++);
  return {
    id,
    title: `Test Post ${id}`,
    slug: `test-post-${id}`,
    excerpt: `Excerpt for test post ${id}`,
    content: `<p>Content for test post ${id}</p>`,
    author: 'Test Author',
    authorTitle: 'Test Author Title',
    authorType: 'Person' as const,
    publishedDate: '2024-01-15T10:00:00Z',
    status: 'published' as const,
    category: '1',
    tags: ['test', 'fixture'],
    readingTime: 5,
    articleType: 'blog' as const,
    featuredImage: undefined,
    seo: {
      title: undefined,
      description: undefined,
      keywords: undefined,
    },
    ...overrides,
  };
}
