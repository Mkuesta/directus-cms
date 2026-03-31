let _productId = 1;

export function resetProductCounter() { _productId = 1; }

export function createDirectusProduct(overrides?: Record<string, any>) {
  const id = _productId++;
  return {
    id,
    title: `Test Product ${id}`,
    slug: `test-product-${id}`,
    description: `<p>Description for test product ${id}</p>`,
    short_description: `Short description for product ${id}`,
    price: 29.99,
    compare_at_price: 39.99,
    status: 'published',
    featured: false,
    sku: `SKU-${id}`,
    publisher: 'Test Publisher',
    category: 1,
    site: 1,
    image: null,
    tags: ['test'],
    features: ['Feature 1', 'Feature 2'],
    average_rating: 4.5,
    review_count: 10,
    date_created: '2024-01-15T10:00:00Z',
    date_updated: null,
    ...overrides,
  };
}

export function createProduct(overrides?: Record<string, any>) {
  const id = _productId++;
  return {
    id,
    title: `Test Product ${id}`,
    slug: `test-product-${id}`,
    description: `<p>Description for test product ${id}</p>`,
    shortDescription: `Short description for product ${id}`,
    price: 29.99,
    compareAtPrice: 39.99,
    status: 'published' as const,
    featured: false,
    sku: `SKU-${id}`,
    publisher: 'Test Publisher',
    category: { id: 1, name: 'Test Category', slug: 'test-category' },
    imageUrl: '',
    tags: ['test'],
    features: ['Feature 1', 'Feature 2'],
    averageRating: 4.5,
    reviewCount: 10,
    ...overrides,
  };
}
