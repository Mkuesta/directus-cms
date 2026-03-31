import type { CollectionSchema } from '../types.js';

export function bannersSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_banners`;
  return {
    collection,
    group: 'content',
    fields: [
      { field: 'title', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Internal name for this banner. Not shown to visitors — for admin reference only. Example: Summer Sale 2024' } },
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'URL-friendly identifier. Auto-generated from title. Used for tracking and targeting.' } },
      { field: 'content', type: 'text', schema: { is_nullable: false }, meta: { interface: 'input-rich-text-html', required: true, note: 'Banner message displayed to visitors. Keep short and actionable. Supports HTML. Example: Free shipping on orders over $50!' } },
      {
        field: 'type', type: 'string', schema: { is_nullable: false, default_value: 'announcement' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: {
            choices: [
              { text: 'Announcement', value: 'announcement' },
              { text: 'Promotion', value: 'promotion' },
              { text: 'Popup', value: 'popup' },
              { text: 'Info', value: 'info' },
              { text: 'Warning', value: 'warning' },
            ],
          },
          note: '"announcement" for news, "promotion" for sales, "popup" for modal overlays, "info" for neutral messages, "warning" for alerts.',
        },
      },
      {
        field: 'position', type: 'string', schema: { is_nullable: false, default_value: 'top' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Top', value: 'top' }, { text: 'Bottom', value: 'bottom' }, { text: 'Popup', value: 'popup' }] },
          note: '"top" shows a fixed bar at the top of the page, "bottom" at the bottom, "popup" shows a modal overlay.',
        },
      },
      { field: 'link_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'URL the banner links to when clicked. Example: /sale or https://shop.example.com/deals' } },
      { field: 'link_text', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Call-to-action button text. Example: Shop Now, Learn More, Get Started' } },
      { field: 'background_color', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Banner background color as a hex code. Example: #ff6600 for orange, #333333 for dark gray.' } },
      { field: 'text_color', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Banner text color as a hex code. Ensure good contrast with the background. Example: #ffffff for white.' } },
      { field: 'dismissible', type: 'boolean', schema: { is_nullable: false, default_value: true }, meta: { interface: 'boolean', width: 'half', note: 'Allow visitors to close/dismiss the banner. Disable to keep it always visible.' } },
      { field: 'start_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Date and time when the banner starts showing. Leave empty to show immediately.' } },
      { field: 'end_date', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', width: 'half', note: 'Date and time when the banner stops showing. Leave empty to show indefinitely.' } },
      { field: 'target_pages', type: 'json', schema: { is_nullable: true }, meta: { interface: 'tags', special: ['cast-json'], note: 'Page paths where this banner should appear. One per tag. Use * for all pages. Example: /products, /blog/*' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] },
          note: '"published" makes the banner active; "draft" hides it.',
        },
      },
      { field: 'sort', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', hidden: true, note: 'Display priority when multiple banners are active. Lower numbers have higher priority.' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
  };
}
