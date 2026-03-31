import type { CollectionSchema } from '../types.js';

export function pagesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_pages`;
  return {
    collection,
    group: 'content',
    fields: [
      { field: 'title', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Page title displayed as the heading and in the browser tab. Example: About Us' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier, auto-generated from title. Example: about-us' } },
      { field: 'content', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-rich-text-html', note: 'The main page body. Supports Markdown or HTML. Use headings (H2, H3) for structure.' } },
      { field: 'excerpt', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short summary of the page. Used in search results and page listings. 1-2 sentences.' } },
      { field: 'featured_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Hero image for the page. Displayed at the top or as a banner. Recommended: 1200×630px.' } },
      { field: 'parent_id', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'select-dropdown-m2o', width: 'half', note: 'Parent page for hierarchical structure. Creates nested URL paths. Example: /about/team' } },
      { field: 'template', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Page template/layout to use. Example: default, landing, full-width. Depends on your frontend.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] },
          note: '"published" makes the page live; "draft" keeps it hidden.',
        },
      },
      { field: 'sort', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', hidden: true, note: 'Display order among sibling pages. Lower numbers appear first.' } },
      { field: 'seo_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom page title for search engines. Overrides the page title. Keep under 60 characters.' } },
      { field: 'seo_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Meta description for search engine results. Keep under 160 characters.' } },
      { field: 'seo_keywords', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Comma-separated keywords for SEO. Example: about us, company, team' } },
      { field: 'meta_robots', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Robots meta tag. Default: index, follow. Use noindex to hide from search engines.' } },
      { field: 'og_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Open Graph image for social media shares. Falls back to featured_image. Recommended: 1200×630px.' } },
      { field: 'published_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Date the page was first published. Used for sitemaps and sorting.' } },
      { field: 'updated_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Date of the most recent update. Used for sitemaps.' } },
      { field: 'scheduled_publish_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Future date to auto-publish this page. Leave empty to publish immediately when status is set to published.' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
    relations: [
      { collection, field: 'featured_image', related_collection: 'directus_files' },
      { collection, field: 'og_image', related_collection: 'directus_files' },
      {
        collection, field: 'parent_id', related_collection: collection,
        meta: { one_field: null, sort_field: 'sort', one_deselect_action: 'nullify' },
        schema: { on_delete: 'SET NULL' },
      },
    ],
  };
}
