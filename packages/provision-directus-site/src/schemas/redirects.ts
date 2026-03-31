import type { CollectionSchema } from '../types.js';

export function redirectsSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_redirects`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'source', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'URL path to redirect from. Relative to the site root. Example: /old-page or /blog/old-slug' } },
      { field: 'destination', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'URL to redirect to. Can be relative (/new-page) or absolute (https://example.com/page).' } },
      {
        field: 'status_code', type: 'integer', schema: { is_nullable: false, default_value: 301 },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: '301 Permanent', value: 301 }, { text: '302 Temporary', value: 302 }, { text: '307 Temporary', value: 307 }, { text: '308 Permanent', value: 308 }] },
          note: 'HTTP redirect status code. 301 = permanent (SEO passes link juice), 302 = temporary, 307/308 = strict method preservation.',
        },
      },
      { field: 'is_regex', type: 'boolean', schema: { is_nullable: false, default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Enable to treat the source as a regular expression pattern. Use for wildcard redirects. Example: /blog/(.*) → /articles/$1' } },
      { field: 'active', type: 'boolean', schema: { is_nullable: false, default_value: true }, meta: { interface: 'boolean', width: 'half', note: 'Toggle this redirect on or off. Disabled redirects are ignored.' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
      { field: 'sort', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', hidden: true, note: 'Priority order. Lower numbers are evaluated first. Important when redirect rules may overlap.' } },
    ],
  };
}
