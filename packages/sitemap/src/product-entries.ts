import type { SitemapConfig, SitemapEntry } from './types';

export async function getProductEntries(config: SitemapConfig): Promise<SitemapEntry[]> {
  if (!config.products) return [];

  const entries: SitemapEntry[] = [];
  const { productRoute, categoryRoute, listingRoute } = config.products.config;

  // Product listing page
  entries.push({
    url: `${config.baseUrl.trim()}/${listingRoute}`,
    changeFrequency: config.defaultChangeFrequency ?? 'daily',
    priority: 0.8,
  });

  // Fetch products and categories in parallel
  const [productsResult, categories] = await Promise.all([
    config.products.getProducts({ pageSize: 100000 }),
    config.products.getProductCategories(),
  ]);

  // Product categories
  for (const category of categories) {
    entries.push({
      url: `${config.baseUrl.trim()}/${categoryRoute}/${category.slug}`,
      changeFrequency: config.defaultChangeFrequency ?? 'weekly',
      priority: 0.6,
    });
  }

  // Individual products
  for (const product of productsResult.products) {
    entries.push({
      url: `${config.baseUrl.trim()}/${productRoute}/${product.slug}`,
      lastModified: product.updatedAt ?? product.createdAt,
      changeFrequency: config.defaultChangeFrequency ?? 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}
