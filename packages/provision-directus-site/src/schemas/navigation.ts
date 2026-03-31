import type { CollectionSchema } from '../types.js';

export function navigationSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_navigation_items`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'label', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Text displayed in the navigation menu. Keep short and clear. Example: About Us' } },
      { field: 'path', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Internal route path for site pages. Example: /about' } },
      { field: 'url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'External URL for off-site links. Use full URL with https://. Example: https://shop.example.com' } },
      {
        field: 'type', type: 'string', schema: { is_nullable: false, default_value: 'internal' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Internal', value: 'internal' }, { text: 'External', value: 'external' }] },
          note: '"internal" for site pages (uses path), "external" for off-site links (uses url).',
        },
      },
      {
        field: 'target', type: 'string', schema: { is_nullable: true, default_value: '_self' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Self', value: '_self' }, { text: 'Blank', value: '_blank' }] },
          note: '"_self" opens in the same tab (default); "_blank" opens in a new tab. Use _blank for external links.',
        },
      },
      { field: 'menu', type: 'string', schema: { is_nullable: false, default_value: 'main' }, meta: { interface: 'input', width: 'half', note: 'Menu location identifier. Groups items into menus. Example: main, footer, sidebar' } },
      { field: 'parent_id', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'select-dropdown-m2o', width: 'half', note: 'Parent navigation item for creating dropdown/nested menus. Leave empty for top-level.' } },
      { field: 'sort', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', hidden: true, note: 'Display order within the menu. Lower numbers appear first. Example: 1' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] },
          note: '"published" shows the item in navigation; "draft" hides it.',
        },
      },
      { field: 'icon', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Optional icon identifier. Depends on your frontend icon library. Example: home, info-circle' } },
      { field: 'css_class', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Optional CSS class(es) added to this menu item for custom styling. Example: highlight-btn' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
    relations: [
      {
        collection, field: 'parent_id', related_collection: collection,
        meta: { one_field: null, sort_field: 'sort', one_deselect_action: 'nullify' },
        schema: { on_delete: 'SET NULL' },
      },
    ],
  };
}
