import type { CollectionSchema } from '../types.js';

export function galleriesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_galleries`;
  return {
    collection,
    group: 'content',
    fields: [
      { field: 'title', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Gallery name displayed as the heading. Example: Before & After Results' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier. Auto-generated from title. Example: before-after-results' } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short description of the gallery. Shown above the image grid. 1-2 sentences.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] },
          note: '"published" makes the gallery visible; "draft" hides it.',
        },
      },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
  };
}
