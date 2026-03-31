import type { CollectionSchema } from '../types.js';

export function coreBlogCategoriesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_blog_categories`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Display name of the blog category. Used in navigation and filters. Example: Health Tips' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier, auto-generated from the name. Use lowercase letters and hyphens only. Example: health-tips' } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short description of this category. Shown on category listing pages and used for SEO. 1-2 sentences.' } },
      { field: 'seo_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom page title for this category\'s listing page. Overrides the default. Keep under 60 characters.' } },
      { field: 'seo_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Meta description for this category\'s listing page. Appears in search results. Keep under 160 characters.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] },
          note: '"published" makes it visible on the site; "draft" hides it.',
        },
      },
      { field: 'sort', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', hidden: true, note: 'Display order among categories. Lower numbers appear first. Example: 1' } },
    ],
  };
}
