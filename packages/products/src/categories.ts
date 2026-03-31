import { readItems } from '@directus/sdk';
import type { ProductConfig, DirectusProductCategory, ProductCategory } from './types';

/**
 * Transform a raw Directus category into a clean camelCase ProductCategory.
 */
function transformCategory(item: DirectusProductCategory): ProductCategory {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    featured: item.featured,
    displayOrder: item.display_order,
  };
}

/**
 * Get all product categories for the configured site, sorted by display_order.
 */
export async function getProductCategories(config: ProductConfig): Promise<ProductCategory[]> {
  try {
    const categories = await config.directus.request(
      readItems(config.collections.categories as any, {
        fields: ['id', 'name', 'slug', 'description', 'featured', 'display_order', 'site'] as any,
        filter: {
          ...(config.siteId != null ? { site: { _eq: config.siteId } } : {}),
        },
        sort: ['display_order', 'name'] as any,
      })
    );

    return (categories as unknown as DirectusProductCategory[]).map(transformCategory);
  } catch (error) {
    console.error('Error fetching product categories from Directus:', error);
    return [];
  }
}

/**
 * Get a single product category by slug.
 */
export async function getProductCategoryBySlug(config: ProductConfig, slug: string): Promise<ProductCategory | null> {
  try {
    const categories = await config.directus.request(
      readItems(config.collections.categories as any, {
        fields: ['id', 'name', 'slug', 'description', 'featured', 'display_order', 'site'] as any,
        filter: {
          slug: { _eq: slug },
          ...(config.siteId != null ? { site: { _eq: config.siteId } } : {}),
        },
        limit: 1,
      })
    );

    const item = (categories as unknown as DirectusProductCategory[])[0];
    return item ? transformCategory(item) : null;
  } catch (error) {
    console.error(`Error fetching category ${slug} from Directus:`, error);
    return null;
  }
}
