import type { CollectionSchema } from '../types.js';

export function userProfilesSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_user_profiles`;
  return {
    collection,
    group: 'data',
    fields: [
      { field: 'supabase_uid', type: 'string', schema: { is_nullable: false, is_unique: true }, meta: { interface: 'input', required: true, note: 'Supabase Auth user ID. Unique identifier linking this profile to a Supabase user.' } },
      { field: 'email', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'User email address. Kept in sync with Supabase Auth.' } },
      { field: 'display_name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'User display name shown on the site. Example: John Doe' } },
      { field: 'avatar_url', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'URL to the user avatar image. Can be a Supabase Storage URL or external URL.' } },
      {
        field: 'role', type: 'string', schema: { is_nullable: false, default_value: 'user' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'User', value: 'user' }, { text: 'Editor', value: 'editor' }, { text: 'Admin', value: 'admin' }] },
          note: 'User role for access control. "user" is the default for new registrations.',
        },
      },
      { field: 'bio', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline', note: 'Short user biography or description.' } },
      { field: 'preferences', type: 'json', schema: { is_nullable: true }, meta: { interface: 'input-code', special: ['cast-json'], note: 'User preferences stored as JSON (theme, notifications, etc).' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half', note: 'Auto-generated timestamp when the profile was created. Do not edit.' } },
      { field: 'date_updated', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-updated'], readonly: true, width: 'half', note: 'Auto-generated timestamp of the last update. Do not edit.' } },
    ],
  };
}
