import type { CollectionSchema } from '../types.js';

export function galleryItemsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_gallery_items`;
  const galleryCollection = `${prefix}_galleries`;
  return {
    collection,
    group: 'content',
    fields: [
      { field: 'gallery', type: 'integer', schema: { is_nullable: false }, meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', note: 'The gallery this image belongs to. Select an existing gallery.' } },
      { field: 'image', type: 'uuid', schema: { is_nullable: false }, meta: { interface: 'file-image', special: ['file'], required: true, note: 'The image file. Upload a high-quality photo. Recommended: at least 800px wide.' } },
      { field: 'title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Image title/caption displayed below or on hover. Keep short. Example: 3-Month Progress' } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Longer image description or alt text for accessibility. Describe what the image shows.' } },
      { field: 'sort', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', hidden: true, note: 'Display order within the gallery. Lower numbers appear first.' } },
    ],
    relations: [
      { collection, field: 'image', related_collection: 'directus_files' },
      {
        collection, field: 'gallery', related_collection: galleryCollection,
        meta: { one_field: null, sort_field: 'sort', one_deselect_action: 'nullify' },
        schema: { on_delete: 'CASCADE' },
      },
    ],
  };
}
