let _pageId = 1;

export function resetPageCounter() { _pageId = 1; }

export function createDirectusPage(overrides?: Record<string, any>) {
  const id = _pageId++;
  return {
    id,
    title: `Page ${id}`,
    slug: `page-${id}`,
    content: `<p>Content for page ${id}</p>`,
    excerpt: `Excerpt for page ${id}`,
    featured_image: null,
    parent_id: null,
    template: 'default',
    status: 'published',
    sort: id,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    published_date: '2024-01-15T10:00:00Z',
    updated_date: null,
    site: null,
    ...overrides,
  };
}

export function createPage(overrides?: Record<string, any>) {
  const id = _pageId++;
  return {
    id,
    title: `Page ${id}`,
    slug: `page-${id}`,
    content: `<p>Content for page ${id}</p>`,
    excerpt: `Excerpt for page ${id}`,
    featuredImage: undefined,
    parentId: undefined,
    template: 'default',
    status: 'published' as const,
    seo: {
      title: undefined,
      description: undefined,
      keywords: undefined,
    },
    publishedDate: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}
