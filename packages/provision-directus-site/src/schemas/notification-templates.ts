import type { CollectionSchema } from '../types.js';

export function notificationTemplatesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_notification_templates`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'slug', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Unique identifier for the notification template. Example: order-success, login-welcome' } },
      {
        field: 'type', type: 'string', schema: { is_nullable: false, default_value: 'info' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Success', value: 'success' }, { text: 'Error', value: 'error' }, { text: 'Info', value: 'info' }, { text: 'Warning', value: 'warning' }] },
          note: 'Visual style of the notification toast.',
        },
      },
      { field: 'title', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Optional title shown above the message in the toast.' } },
      { field: 'message', type: 'text', schema: { is_nullable: false }, meta: { interface: 'input-multiline', required: true, note: 'The notification message displayed to users.' } },
      { field: 'duration', type: 'integer', schema: { is_nullable: true, default_value: 5000 }, meta: { interface: 'input', width: 'half', note: 'Auto-dismiss duration in milliseconds. Default 5000. Set to 0 to require manual dismiss.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'active' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Draft', value: 'draft' }] },
          note: 'Only active templates are returned by the API.',
        },
      },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy.' } },
    ],
  };
}
