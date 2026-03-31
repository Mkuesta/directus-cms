import type { ProductConfig, ProductClient } from './types';
import * as products from './products';
import * as categories from './categories';
import * as productMetadata from './product-metadata';
import * as productStaticParams from './product-static-params';
import { processProductSeoContent } from './product-content';
import * as pricing from './pricing';

/**
 * Creates a product CMS client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const productCms = createProductClient({ directus, collections, siteName, baseUrl, ... });
 *   const product = await productCms.getProductBySlug('my-product');
 */
export function createProductClient(config: ProductConfig): ProductClient {
  return {
    config,

    // Products
    getProducts: (opts) => products.getProducts(config, opts),
    getProductBySlug: (slug) => products.getProductBySlug(config, slug),
    getRelatedProducts: (productId, categorySlug, limit) =>
      products.getRelatedProducts(config, productId, categorySlug, limit),

    // Categories
    getProductCategories: () => categories.getProductCategories(config),
    getProductCategoryBySlug: (slug) => categories.getProductCategoryBySlug(config, slug),

    // Metadata
    getProductMetadata: (slug) => productMetadata.getProductMetadata(config, slug),
    getCategoryMetadata: (categorySlug) => productMetadata.getCategoryMetadata(config, categorySlug),
    getProductIndexMetadata: () => productMetadata.getProductIndexMetadata(config),

    // Static params
    getProductStaticParams: () => productStaticParams.getProductStaticParams(config),
    getCategoryStaticParams: () => productStaticParams.getCategoryStaticParams(config),

    // Content processing
    processProductSeoContent,

    // Images
    getDirectusAssetUrl: (fileId) => {
      if (!fileId) return '';
      return `${config.directusUrl}/assets/${fileId}`;
    },

    // Pricing utilities — use config.currency and config.locale as defaults
    formatPrice: (amount, currency?, locale?) =>
      pricing.formatPrice(amount, currency || config.currency, locale || config.locale),
    formatPriceCents: (amountCents, currency?, locale?) =>
      pricing.formatPriceCents(amountCents, currency || config.currency, locale || config.locale),
    getDiscountPercent: pricing.getDiscountPercent,
    isOnSale: pricing.isOnSale,
    getSavings: pricing.getSavings,
    calculateVat: pricing.calculateVat,
    isValidVatFormat: pricing.isValidVatFormat,
    getFileInfo: pricing.getFileInfo,
    isDigitalProduct: pricing.isDigitalProduct,
  };
}

// Re-export all types
export type {
  ProductConfig,
  ProductCollections,
  OrganizationConfig,
  ProductClient,
  Product,
  ProductCategory,
  ProductFilterOptions,
  ProductsResult,
  ProductSortOption,
  DirectusSite,
  DirectusProductCategory,
  DirectusProductFull,
  ProductFAQ,
  ProductHowToStep,
  ProductTable,
  ProductItemList,
} from './types';

// Re-export pricing types
export type { VatBreakdown, ProductFileInfo } from './pricing';

// Re-export standalone functions
export { transformProduct, getProducts, getProductBySlug, getRelatedProducts } from './products';
export { getProductCategories, getProductCategoryBySlug } from './categories';
export { getProductMetadata, getCategoryMetadata, getProductIndexMetadata } from './product-metadata';
export { getProductStaticParams, getCategoryStaticParams } from './product-static-params';
export { processProductSeoContent } from './product-content';

// Re-export pricing utilities
export {
  formatPrice,
  formatPriceCents,
  getDiscountPercent,
  isOnSale,
  getSavings,
  calculateVat,
  isValidVatFormat,
  getFileInfo,
  isDigitalProduct,
} from './pricing';

// Re-export components
export { ProductSchema } from './components/ProductSchema';
export { CategoryListSchema } from './components/CategoryListSchema';
