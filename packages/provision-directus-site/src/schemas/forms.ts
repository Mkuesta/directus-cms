import type { CollectionSchema } from '../types.js';

export function formsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_form_submissions`;
  return {
    collection,
    group: 'data',
    fields: [
      { field: 'form', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Identifier for which form was submitted. Example: contact, newsletter, feedback' } },
      { field: 'data', type: 'json', schema: { is_nullable: false }, meta: { interface: 'input-code', special: ['cast-json'], options: { language: 'json' }, note: 'The submitted form data stored as JSON. Contains all field values from the submission.' } },
      { field: 'ip', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'IP address of the visitor who submitted the form. Auto-captured for spam prevention.' } },
      { field: 'user_agent', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Browser user-agent string of the submitter. Auto-captured for analytics and debugging.' } },
      { field: 'referrer', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'The page URL the visitor was on when they submitted the form. Auto-captured.' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Identifies which site the submission came from.' } },
      { field: 'site_name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Human-readable site name for quick reference. Example: DrLogist' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'new' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'New', value: 'new' }, { text: 'Read', value: 'read' }, { text: 'Archived', value: 'archived' }, { text: 'Spam', value: 'spam' }] },
          note: '"new" for unread submissions; "read" after reviewed; "archived" to hide; "spam" to flag.',
        },
      },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, note: 'Auto-generated timestamp when the form was submitted. Do not edit.' } },
    ],
  };
}
