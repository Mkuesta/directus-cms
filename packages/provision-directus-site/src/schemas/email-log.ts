import type { CollectionSchema } from '../types.js';

export function emailLogSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_email_log`;
  return {
    collection,
    group: 'data',
    fields: [
      { field: 'template_slug', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Slug of the email template used (if any). Null for ad-hoc emails.' } },
      { field: 'to_email', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Recipient email address(es). Comma-separated if multiple.' } },
      { field: 'from_email', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Sender email address.' } },
      { field: 'subject', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Email subject line as sent.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'sent' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Sent', value: 'sent' }, { text: 'Failed', value: 'failed' }, { text: 'Bounced', value: 'bounced' }] },
          note: 'Delivery status of this email.',
        },
      },
      { field: 'resend_id', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Resend API message ID for tracking.' } },
      { field: 'error', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Error message if sending failed.' } },
      { field: 'metadata', type: 'json', schema: { is_nullable: true }, meta: { interface: 'input-code', special: ['cast-json'], note: 'Additional metadata stored with this log entry.' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy.' } },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half', note: 'Auto-generated timestamp when the email was sent. Do not edit.' } },
    ],
  };
}
