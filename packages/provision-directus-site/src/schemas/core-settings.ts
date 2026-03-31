import type { CollectionSchema } from '../types.js';

export function coreSettingsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_settings`;
  return {
    collection,
    singleton: true,
    group: 'config',
    fields: [
      { field: 'site_name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'The short name of your site. Used in meta tags and the browser tab. Example: DrLogist' } },
      { field: 'site_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Full site title used in the homepage <title> tag. Example: DrLogist — Expert Skin & Hair Care' } },
      { field: 'site_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Default meta description for the homepage. Appears in search results. Keep under 160 characters.' } },
      { field: 'site_tagline', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'A short tagline or slogan. May appear in headers or footers. Example: Expert Skin & Hair Care' } },
      { field: 'default_author_name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Fallback author name used when an article has no specific author. Example: Editorial Team' } },
      { field: 'default_author_title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Fallback author title/role. Example: Content Team' } },
      { field: 'default_author_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Fallback URL for the author\'s profile page. Example: /about' } },
      { field: 'default_author_twitter', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Fallback Twitter/X handle (without @) for articles without a specific author.' } },
      { field: 'default_author_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Fallback author headshot photo. Upload a square image, minimum 200×200px.' } },
      { field: 'organization_description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short description of your organization for Schema.org structured data. 1-2 sentences.' } },
      { field: 'twitter_handle', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site-wide Twitter/X handle without the @. Used for Twitter Cards site attribution. Example: drlogist' } },
      { field: 'linkedin_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Full URL to your LinkedIn company page. Example: https://linkedin.com/company/drlogist' } },
      { field: 'default_article_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Fallback featured image for articles that don\'t have one. Recommended: 1200×630px.' } },
      { field: 'default_og_image', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Default Open Graph image used when pages/articles don\'t have their own. Recommended: 1200×630px.' } },
      { field: 'default_logo', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Main site logo image. Upload an SVG or PNG with transparent background. Recommended height: 40-60px.' } },
      { field: 'favicon', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Site favicon. Upload a square PNG or ICO file, 32×32px or 64×64px.' } },
      { field: 'apple_touch_icon', type: 'uuid', schema: { is_nullable: true }, meta: { interface: 'file-image', special: ['file'], note: 'Apple touch icon for iOS home screen bookmarks. Upload a square PNG, 180×180px.' } },
      { field: 'theme_color', type: 'string', schema: { is_nullable: true, default_value: '#ffffff' }, meta: { interface: 'input', width: 'half', note: 'Browser theme color (hex). Used in mobile browser chrome. Example: #0066cc' } },
      { field: 'primary_color', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Primary brand color (hex) used across the site. Example: #0066cc' } },
      { field: 'secondary_color', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Secondary brand color (hex) for accents and buttons. Example: #ff6600' } },
      { field: 'default_language', type: 'string', schema: { is_nullable: true, default_value: 'en' }, meta: { interface: 'input', width: 'half', note: 'Default language for the site. ISO 639-1 code. Example: en' } },
      { field: 'homepage_keywords', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Comma-separated keywords for the homepage meta tag. Example: skincare, dermatology, hair care' } },
      { field: 'default_meta_robots', type: 'string', schema: { is_nullable: true, default_value: 'index, follow' }, meta: { interface: 'input', note: 'Default robots meta tag for all pages. Example: index, follow' } },
      { field: 'logo_initials', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Short initials used as a text-based logo fallback. Example: DL' } },
      { field: 'contact_page_path', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Relative path to the contact page. Used in navigation and footers. Example: /contact' } },
      { field: 'sitemap_path', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Path to the XML sitemap. Example: /sitemap.xml' } },
    ],
    relations: [
      { collection, field: 'default_author_image', related_collection: 'directus_files' },
      { collection, field: 'default_article_image', related_collection: 'directus_files' },
      { collection, field: 'default_og_image', related_collection: 'directus_files' },
      { collection, field: 'default_logo', related_collection: 'directus_files' },
      { collection, field: 'favicon', related_collection: 'directus_files' },
      { collection, field: 'apple_touch_icon', related_collection: 'directus_files' },
    ],
  };
}
