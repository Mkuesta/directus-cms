import type { ProductConfig } from './types';
import { getProducts } from './products';
import { getProductCategories } from './categories';

/**
 * Returns static params for product detail pages: [{ slug: "product-slug" }, ...]
 */
export async function getProductStaticParams(config: ProductConfig): Promise<{ slug: string }[]> {
  try {
    const { products } = await getProducts(config, { pageSize: 10000 });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

/**
 * Returns static params for product category pages: [{ slug: "category-slug" }, ...]
 */
export async function getCategoryStaticParams(config: ProductConfig): Promise<{ slug: string }[]> {
  try {
    const categories = await getProductCategories(config);
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}
