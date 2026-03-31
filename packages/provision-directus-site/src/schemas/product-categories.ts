import type { CollectionSchema } from '../types.js';

export function productCategoriesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_categories`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Display name of the product category. Used in navigation and filters. Example: Serums' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier, auto-generated from name. Lowercase and hyphens only. Example: serums' } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short description of this product category. Shown on category pages. 1-2 sentences.' } },
      { field: 'featured', type: 'boolean', schema: { is_nullable: false, default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Mark as featured to highlight this category on the homepage or in navigation.' } },
      { field: 'display_order', type: 'integer', schema: { is_nullable: false, default_value: 0 }, meta: { interface: 'input', width: 'half', note: 'Sort order among product categories. Lower numbers appear first. Example: 1' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
  };
}
