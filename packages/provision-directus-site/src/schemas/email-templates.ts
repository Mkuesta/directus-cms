import type { CollectionSchema } from '../types.js';

export function emailTemplatesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_email_templates`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'slug', type: 'string', schema: { is_nullable: false, is_unique: true }, meta: { interface: 'input', required: true, width: 'half', note: 'Unique identifier used in code to reference this template. Lowercase with hyphens. Example: order-confirmation' } },
      { field: 'name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Human-readable template name for admin display. Example: Order Confirmation Email' } },
      { field: 'subject', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Email subject line. Supports {{variable}} interpolation. Example: Order Confirmation #{{orderId}}' } },
      { field: 'html_body', type: 'text', schema: { is_nullable: false }, meta: { interface: 'input-rich-text-html', required: true, note: 'HTML email body. Supports {{variable}} interpolation. Design for email clients (inline styles recommended).' } },
      { field: 'text_body', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Plain text fallback body. Supports {{variable}} interpolation. Used when HTML is not supported.' } },
      { field: 'variables', type: 'json', schema: { is_nullable: true }, meta: { interface: 'tags', special: ['cast-json'], note: 'List of variable names used in this template (for documentation). Example: orderId, customerName, total' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'draft' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Draft', value: 'draft' }] },
          note: '"active" templates can be used for sending; "draft" templates are hidden from the API.',
        },
      },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half', note: 'Auto-generated timestamp when the template was created. Do not edit.' } },
      { field: 'date_updated', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-updated'], readonly: true, width: 'half', note: 'Auto-generated timestamp of the last update. Do not edit.' } },
    ],
  };
}
