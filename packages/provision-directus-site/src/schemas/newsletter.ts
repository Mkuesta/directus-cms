import type { CollectionSchema } from '../types.js';

export function newsletterSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_subscribers`;
  return {
    collection,
    group: 'data',
    fields: [
      { field: 'email', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: "Subscriber's email address. Must be unique." } },
      { field: 'name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: "Subscriber's display name. Optional." } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'pending' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Pending', value: 'pending' }, { text: 'Active', value: 'active' }, { text: 'Unsubscribed', value: 'unsubscribed' }] },
          note: "'pending' awaiting confirmation; 'active' confirmed; 'unsubscribed' opted out.",
        },
      },
      { field: 'token', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', hidden: true, width: 'half', note: 'Internal confirmation token for double opt-in. Auto-generated.' } },
      { field: 'source', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Where the subscription came from. Example: homepage, blog-sidebar, footer' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy.' } },
      { field: 'site_name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Human-readable site name.' } },
      { field: 'ip', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'IP address at time of subscription. Auto-captured.' } },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, note: 'Auto-generated timestamp when the subscriber signed up. Do not edit.' } },
      { field: 'date_confirmed', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', note: 'When the subscriber confirmed via double opt-in.' } },
    ],
  };
}
