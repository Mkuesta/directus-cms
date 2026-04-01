import { readItems } from '@directus/sdk';
import { extractFAQsFromContent, extractTablesFromContent, extractItemListsFromContent, remapFields, remapItem, remapFilter, remapSort } from '@mkuesta/core';
import type { ProductConfig, DirectusProductFull, Product, ProductCategory, ProductFilterOptions, ProductsResult, ProductSortOption } from './types';
import { processProductSeoContent } from './product-content';

/** Known product fields for extras detection */
const KNOWN_PRODUCT_FIELDS = new Set([
  'id', 'title', 'slug', 'description', 'short_description',
  'price', 'compare_at_price', 'file_format', 'file_size',
  'file_url', 'status', 'featured', 'sku', 'publisher',
  'vat_included', 'vat_rate', 'average_rating', 'review_count',
  'target_audience', 'features', 'tags', 'category', 'site',
  'image', 'preview_images', 'seo_article', 'seo_article_title', 'seo_title', 'seo_description',
  'created_at', 'updated_at', 'date_created', 'date_updated',
]);

/** Fields for product listing queries */
const PRODUCT_FIELDS = [
  'id', 'title', 'slug', 'description', 'short_description',
  'price', 'compare_at_price', 'file_format', 'file_size',
  'file_url', 'status', 'featured', 'sku', 'publisher',
  'vat_included', 'vat_rate', 'average_rating', 'review_count',
  'target_audience', 'seo_article_title', 'seo_title', 'seo_description', 'tags',
  'date_created', 'date_updated',
  'site', 'site.id', 'site.name', 'site.domain',
  'image.id', 'image.title', 'image.filename_disk',
  'category.id', 'category.name', 'category.slug',
] as const;

/** Additional fields for product detail queries */
const PRODUCT_DETAIL_FIELDS = [
  ...PRODUCT_FIELDS,
  'seo_article',
  'preview_images.id', 'preview_images.title', 'preview_images.filename_disk',
] as const;

/** Maps sort options to Directus sort arrays */
const SORT_MAP: Record<ProductSortOption, string[]> = {
  featured: ['-featured'],
  price_asc: ['price'],
  price_desc: ['-price'],
  newest: ['-date_created'],
};

/**
 * Normalize tags from various Directus formats to a flat string array.
 */
function normalizeTags(tags: DirectusProductFull['tags']): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
}

/**
 * Transform a raw Directus product into a clean camelCase Product.
 */
export async function transformProduct(config: ProductConfig, item: DirectusProductFull): Promise<Product> {
  const imageUrl = item.image?.id
    ? `${config.directusUrl}/assets/${item.image.id}`
    : undefined;

  const previewImageUrls = (item.preview_images || [])
    .filter((img) => img?.id)
    .map((img) => `${config.directusUrl}/assets/${img.id}`);

  const category: ProductCategory | undefined = item.category
    ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        description: item.category.description,
        featured: item.category.featured,
        displayOrder: item.category.display_order,
      }
    : undefined;

  // Convert markdown to HTML for description and seo_article
  const processedDescription = item.description
    ? await processProductSeoContent(item.description)
    : undefined;
  const processedSeoArticle = item.seo_article
    ? await processProductSeoContent(item.seo_article)
    : undefined;

  const descHtml = processedDescription?.html;
  const seoHtml = processedSeoArticle?.html;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: descHtml,
    shortDescription: item.short_description,
    price: item.price,
    compareAtPrice: item.compare_at_price,
    fileFormat: item.file_format,
    fileSize: item.file_size,
    fileUrl: item.file_url,
    status: item.status,
    featured: item.featured,
    sku: item.sku,
    publisher: item.publisher,
    vatIncluded: item.vat_included,
    vatRate: item.vat_rate,
    averageRating: item.average_rating,
    reviewCount: item.review_count,
    targetAudience: item.target_audience,
    features: item.features,
    tags: normalizeTags(item.tags),
    category,
    imageUrl,
    previewImageUrls,
    seoArticle: seoHtml,
    seoArticleTitle: item.seo_article_title,
    seoTitle: item.seo_title,
    seoDescription: item.seo_description,
    faqs: extractFAQsFromContent(descHtml) || extractFAQsFromContent(seoHtml),
    tables: extractTablesFromContent(descHtml) || extractTablesFromContent(seoHtml),
    itemLists: extractItemListsFromContent(descHtml) || extractItemListsFromContent(seoHtml),
    createdAt: item.created_at || item.date_created,
    updatedAt: item.updated_at || item.date_updated,
    extras: (item as any).__extras,
  };
}

/**
 * Get products with optional filtering and client-side pagination.
 * Fetches all products with limit: -1, then filters/paginates client-side
 * due to Directus Public role limitations with relational queries.
 */
export async function getProducts(config: ProductConfig, options?: ProductFilterOptions): Promise<ProductsResult> {
  const pageSize = options?.pageSize || 25;
  const page = options?.page || 1;
  const fm = config.fieldMapping?.products;

  const filter: Record<string, any> = {
    status: { _eq: 'published' },
    ...(config.siteId != null ? { site: { _eq: config.siteId } } : {}),
  };

  if (options?.featured !== undefined) {
    filter.featured = { _eq: options.featured };
  }

  if (options?.fileFormats && options.fileFormats.length > 0) {
    filter.file_format = { _in: options.fileFormats };
  }

  if (options?.onSale) {
    filter.compare_at_price = { _nnull: true, _gt: 0 };
  }

  if (options?.free) {
    filter.price = { _eq: 0 };
  }

  // Server-side price range filters
  if (options?.priceMin != null) {
    filter.price = { ...filter.price, _gte: options.priceMin };
  }
  if (options?.priceMax != null) {
    filter.price = { ...filter.price, _lte: options.priceMax };
  }

  // Server-side search filter
  if (options?.search) {
    filter._or = [
      { title: { _icontains: options.search } },
      { description: { _icontains: options.search } },
      { short_description: { _icontains: options.search } },
    ];
  }

  // Determine Directus sort from sort option
  const sortOption = options?.sort || 'featured';
  const directusSort = SORT_MAP[sortOption];

  try {
    const products = await config.directus.request(
      readItems(config.collections.products as any, {
        fields: remapFields(PRODUCT_FIELDS, fm) as any,
        filter: remapFilter(filter, fm),
        limit: -1,
        sort: remapSort(directusSort, fm) as any,
      })
    );

    let items = (products as unknown as Record<string, any>[])
      .map((item) => remapItem(item, fm, KNOWN_PRODUCT_FIELDS) as unknown as DirectusProductFull);

    // Client-side site filtering as fallback (only when siteId is configured)
    if (config.siteId != null) {
      items = items.filter((p) => {
        const siteId = typeof p.site === 'object' && p.site ? p.site.id : p.site;
        return siteId === config.siteId;
      });
    }

    // Client-side category filtering
    if (options?.category) {
      items = items.filter((p) => p.category?.slug === options.category);
    }

    // Client-side tag filtering
    if (options?.tags && options.tags.length > 0) {
      const searchTags = options.tags.map((t) => t.toLowerCase());
      items = items.filter((p) => {
        const productTags = normalizeTags(p.tags).map((t) => t.toLowerCase());
        return searchTags.some((tag) => productTags.includes(tag));
      });
    }

    // Client-side pagination
    const totalItems = items.length;
    const offset = (page - 1) * pageSize;
    const paginatedItems = items.slice(offset, offset + pageSize);

    return {
      products: await Promise.all(paginatedItems.map((item) => transformProduct(config, item))),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching products from Directus:', error);
    return {
      products: [],
      pagination: { page, pageSize, totalItems: 0, totalPages: 0 },
    };
  }
}

/**
 * Get a single product by slug with full detail fields.
 */
export async function getProductBySlug(config: ProductConfig, slug: string): Promise<Product | null> {
  const fm = config.fieldMapping?.products;
  try {
    const products = await config.directus.request(
      readItems(config.collections.products as any, {
        fields: remapFields(PRODUCT_DETAIL_FIELDS, fm) as any,
        filter: remapFilter({
          slug: { _eq: slug },
          status: { _eq: 'published' },
          ...(config.siteId != null ? { site: { _eq: config.siteId } } : {}),
        }, fm),
        limit: 1,
      })
    );

    const raw = (products as unknown as Record<string, any>[])[0];
    const item = raw ? remapItem(raw, fm, KNOWN_PRODUCT_FIELDS) as unknown as DirectusProductFull : undefined;
    return item ? await transformProduct(config, item) : null;
  } catch (error) {
    console.error(`Error fetching product ${slug} from Directus:`, error);
    return null;
  }
}

/**
 * Get related products in the same category, excluding the current product.
 */
export async function getRelatedProducts(
  config: ProductConfig,
  productId: number,
  categorySlug?: string,
  limit: number = 4,
): Promise<Product[]> {
  const fm = config.fieldMapping?.products;
  try {
    const products = await config.directus.request(
      readItems(config.collections.products as any, {
        fields: remapFields(PRODUCT_FIELDS, fm) as any,
        filter: remapFilter({
          status: { _eq: 'published' },
          id: { _neq: productId },
          ...(config.siteId != null ? { site: { _eq: config.siteId } } : {}),
        }, fm),
        limit: -1,
        sort: remapSort(['-featured'], fm) as any,
      })
    );

    let items = (products as unknown as Record<string, any>[])
      .map((item) => remapItem(item, fm, KNOWN_PRODUCT_FIELDS) as unknown as DirectusProductFull);

    // Filter by category
    if (categorySlug) {
      items = items.filter((p) => p.category?.slug === categorySlug);
    }

    if (items.length === 0) return [];

    return Promise.all(items.slice(0, limit).map((item) => transformProduct(config, item)));
  } catch (error) {
    console.error('Error fetching related products from Directus:', error);
    return [];
  }
}
