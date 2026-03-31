import type { CollectionSchema } from '../types.js';

export function corePostsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_posts`;
  const categoryCollection = `${prefix}_blog_categories`;
  return {
    collection,
    group: 'content',
    fields: [
      { field: 'title', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'full', note: 'The headline of the article. Displayed at the top of the page and in listings. Keep under 70 characters for SEO.' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier, auto-generated from the title. Use lowercase and hyphens only. Example: how-to-sleep-better' } },
      { field: 'excerpt', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short summary shown in blog listing cards and RSS feeds. 1-2 sentences, under 160 characters.' } },
      { field: 'content', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-rich-text-html', note: 'The main article body. Supports Markdown or HTML. Use headings (H2, H3) to structure the content.' } },
      { field: 'author', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Author\'s full name as displayed on the article. Example: Dr. Sarah Johnson' } },
      { field: 'author_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Author\'s professional title or role. Shown below the author name. Example: Board-Certified Dermatologist' } },
      {
        field: 'author_type', type: 'string', schema: { is_nullable: true },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Person', value: 'Person' }, { text: 'Organization', value: 'Organization' }] },
          note: 'Type of author for structured data. Choose Person or Organization.',
        },
      },
      { field: 'author_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], width: 'half', note: 'Author\'s headshot photo. Upload a square image, minimum 200×200px. Used in author bio sections.' } },
      { field: 'author_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'URL to the author\'s profile or website. Used in author bio links. Example: https://example.com/dr-johnson' } },
      { field: 'author_twitter', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Author\'s Twitter/X handle without the @. Used for Twitter Cards. Example: drjohnson' } },
      { field: 'author_image_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'External URL for the author\'s image. Use this instead of uploading if the image is hosted elsewhere.' } },
      { field: 'published_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Date the article was first published. Used for sorting and displayed on the article.' } },
      { field: 'updated_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Date of the most recent update. Shows an "Updated on" notice if different from published date.' } },
      { field: 'scheduled_publish_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Future date to auto-publish this article. Leave empty to publish immediately when status is set to published.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }, { text: 'Archived', value: 'archived' }] },
          note: '"published" makes the article live; "draft" keeps it hidden; "archived" removes it from listings but keeps the URL.',
        },
      },
      { field: 'category', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'select-dropdown-m2o', width: 'half', note: 'The primary blog category this article belongs to. Select from existing categories.' } },
      { field: 'tags', type: 'json', schema: { is_nullable: true }, meta: { interface: 'tags', special: ['cast-json'], note: 'Keywords for filtering and related articles. Example: sleep, health, wellness' } },
      { field: 'read_time', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Estimated reading time in minutes. Auto-calculated if left empty. Example: 5' } },
      {
        field: 'article_type', type: 'string', schema: { is_nullable: true },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: {
            choices: [
              { text: 'Article', value: 'Article' },
              { text: 'BlogPosting', value: 'BlogPosting' },
              { text: 'NewsArticle', value: 'NewsArticle' },
              { text: 'TechArticle', value: 'TechArticle' },
              { text: 'HowTo', value: 'HowTo' },
            ],
          },
          note: 'Content type classification. Affects Schema.org structured data output.',
        },
      },
      { field: 'featured_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Main hero image for the article. Displayed at the top and in social shares. Recommended: 1200×630px.' } },
      { field: 'featured_image_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'External URL for the featured image. Use instead of uploading if the image is hosted elsewhere.' } },
      { field: 'seo_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom page title for search engines. Overrides the article title. Keep under 60 characters.' } },
      { field: 'seo_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Meta description for search engine results. Keep under 160 characters. Summarize the article\'s value.' } },
      { field: 'seo_keywords', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Comma-separated SEO keywords. Used for internal reference. Example: sleep tips, insomnia, better rest' } },
      { field: 'meta_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Fallback meta description if seo_description is empty. Keep under 160 characters.' } },
      { field: 'meta_robots', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Robots meta tag directives. Default: index, follow. Use noindex, nofollow to hide from search engines.' } },
      { field: 'meta_tags', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Additional custom meta tags as JSON. For advanced use only.' } },
      { field: 'canonical_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'The canonical URL if this content exists elsewhere. Prevents duplicate content issues. Leave empty for default.' } },
      { field: 'og_image', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom Open Graph image for Facebook/LinkedIn shares. Falls back to featured_image. Recommended: 1200×630px.' } },
      { field: 'og_image_alt', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Alt text for the Open Graph image. Describe the image for accessibility. Example: Doctor explaining sleep tips' } },
      { field: 'og_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom title for social media shares. Falls back to seo_title, then title. Keep under 60 characters.' } },
      { field: 'og_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Custom description for social media shares. Falls back to seo_description. Keep under 160 characters.' } },
      { field: 'twitter_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom title for Twitter/X cards. Falls back to og_title. Keep under 60 characters.' } },
      { field: 'twitter_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Custom description for Twitter/X cards. Falls back to og_description. Keep under 160 characters.' } },
      { field: 'twitter_image', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Custom image for Twitter/X cards. Falls back to og_image. Recommended: 1200×628px.' } },
      { field: 'twitter_image_alt', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Alt text for the Twitter card image. Describe the image for accessibility.' } },
      { field: 'faqs_json', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-code', options: { language: 'json' }, note: 'Structured FAQ data as JSON. Auto-extracted from content if empty. Used for FAQ rich snippets in Google.' } },
      { field: 'howto_json', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-code', options: { language: 'json' }, note: 'Structured HowTo data as JSON. Auto-extracted from content if empty. Used for HowTo rich snippets in Google.' } },
      { field: 'tables_json', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-code', options: { language: 'json' }, note: 'Structured table data extracted from content. Auto-generated — typically no manual editing needed.' } },
      { field: 'itemlists_json', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-code', options: { language: 'json' }, note: 'Structured list data extracted from content. Auto-generated — typically no manual editing needed.' } },
      { field: 'language', type: 'string', schema: { is_nullable: true, default_value: 'en' }, meta: { interface: 'input', width: 'half', note: 'Language code for this article. Use ISO 639-1 format. Example: en, es, fr. Default: en' } },
    ],
    relations: [
      { collection, field: 'author_image', related_collection: 'directus_files' },
      { collection, field: 'featured_image', related_collection: 'directus_files' },
      {
        collection, field: 'category', related_collection: categoryCollection,
        meta: { one_field: null, sort_field: null, one_deselect_action: 'nullify' },
        schema: { on_delete: 'SET NULL' },
      },
    ],
  };
}
