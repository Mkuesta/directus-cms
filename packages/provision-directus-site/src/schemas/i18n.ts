import type { CollectionSchema } from '../types.js';

export function i18nSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_translations`;
  return {
    collection,
    group: 'config',
    fields: [
      { field: 'key', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Translation key used in code to look up this string. Use dot notation. Example: common.read_more' } },
      { field: 'locale', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Language/locale code for this translation. Use ISO 639-1. Example: en, es, fr, de' } },
      { field: 'value', type: 'text', schema: { is_nullable: false }, meta: { interface: 'input-multiline', required: true, note: 'The translated text string. This is what visitors see on the site in the corresponding language.' } },
      { field: 'namespace', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Optional grouping for organizing translations. Example: common, blog, products' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
    ],
  };
}
