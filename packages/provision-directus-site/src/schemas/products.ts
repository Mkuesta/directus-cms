import type { CollectionSchema } from '../types.js';

export function productsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_products`;
  const categoryCollection = `${prefix}_categories`;
  return {
    collection,
    group: 'content',
    fields: [
      { field: 'title', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Product name as displayed to customers. Keep clear and descriptive. Example: Vitamin C Brightening Serum' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier, auto-generated from title. Lowercase and hyphens. Example: vitamin-c-brightening-serum' } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-rich-text-html', note: 'Full product description. Supports Markdown or HTML. Include benefits, ingredients, usage instructions.' } },
      { field: 'short_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Brief summary shown in product cards and search results. 1-2 sentences, under 160 characters.' } },
      { field: 'price', type: 'decimal', schema: { is_nullable: false, numeric_precision: 10, numeric_scale: 2 }, meta: { interface: 'input', width: 'half', required: true, note: 'Current selling price in the site\'s default currency. Use decimal format. Example: 29.99' } },
      { field: 'compare_at_price', type: 'decimal', schema: { is_nullable: true, numeric_precision: 10, numeric_scale: 2 }, meta: { interface: 'input', width: 'half', note: 'Original/retail price shown with a strikethrough to indicate a discount. Leave empty if no discount. Example: 39.99' } },
      { field: 'file_format', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Format of the downloadable file (for digital products). Example: PDF, EPUB, ZIP' } },
      { field: 'file_size', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Size of the downloadable file. Example: 2.5 MB' } },
      { field: 'file_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Direct download URL for digital products. Leave empty for physical products.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] },
          note: '"published" makes the product visible on the site; "draft" keeps it hidden.',
        },
      },
      { field: 'featured', type: 'boolean', schema: { is_nullable: false, default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Mark as featured to highlight this product on the homepage or in promotional sections.' } },
      { field: 'sku', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Stock Keeping Unit — unique product identifier for inventory tracking. Example: VC-SERUM-30ML' } },
      { field: 'publisher', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Brand or publisher name. Shown on the product page. Example: DrLogist Labs' } },
      { field: 'vat_included', type: 'boolean', schema: { is_nullable: true, default_value: true }, meta: { interface: 'boolean', width: 'half', note: 'Whether the displayed price includes VAT/tax. Enable if price already includes tax.' } },
      { field: 'vat_rate', type: 'float', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'VAT/tax rate as a decimal. Example: 0.20 for 20% VAT. Only used if vat_included is off.' } },
      { field: 'average_rating', type: 'float', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Average customer rating (1-5). Updated manually or via integration. Example: 4.5' } },
      { field: 'review_count', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Total number of customer reviews. Example: 127' } },
      { field: 'target_audience', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Who this product is designed for. Used in structured data. Example: Adults with acne-prone skin' } },
      { field: 'features', type: 'json', schema: { is_nullable: true }, meta: { interface: 'tags', special: ['cast-json'], note: 'Key product features as a list. One feature per tag. Example: Paraben-free, Vegan, Cruelty-free' } },
      { field: 'tags', type: 'json', schema: { is_nullable: true }, meta: { interface: 'tags', special: ['cast-json'], note: 'Keywords for filtering and search. Example: serum, vitamin c, brightening' } },
      { field: 'category', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'select-dropdown-m2o', width: 'half', note: 'Primary product category. Select from existing categories.' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
      { field: 'image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Main product image. Upload a high-quality photo. Recommended: 800×800px, square format.' } },
      { field: 'preview_images', type: 'json', schema: { is_nullable: true }, meta: { interface: 'files', special: ['cast-json'], note: 'Additional product images shown in a gallery. Upload multiple angles or detail shots.' } },
      { field: 'seo_article', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-rich-text-html', note: 'Long-form SEO content displayed below the product details. Supports Markdown or HTML.' } },
      { field: 'seo_article_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Title for the SEO article section. Example: Everything You Need to Know About Vitamin C Serums' } },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half', note: 'Auto-generated timestamp when the product was created. Do not edit.' } },
      { field: 'date_updated', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-updated'], readonly: true, width: 'half', note: 'Auto-generated timestamp of the last update. Do not edit.' } },
      { field: 'scheduled_publish_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Future date to auto-publish this product. Leave empty to publish immediately when status is set to published.' } },
    ],
    relations: [
      { collection, field: 'image', related_collection: 'directus_files' },
      {
        collection, field: 'category', related_collection: categoryCollection,
        meta: { one_field: null, sort_field: null, one_deselect_action: 'nullify' },
        schema: { on_delete: 'SET NULL' },
      },
    ],
  };
}
