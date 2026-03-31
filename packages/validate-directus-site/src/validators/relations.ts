import type { ValidateConfig, CheckResult, CheckDetail } from '../types.js';

export async function validateRelations(config: ValidateConfig): Promise<CheckResult> {
  const details: CheckDetail[] = [];
  let issues = 0;

  // Expected relations
  const expectedRelations = [
    { collection: `${config.prefix}_posts`, field: 'category', related: `${config.prefix}_blog_categories` },
    { collection: `${config.prefix}_posts`, field: 'featured_image', related: 'directus_files' },
    { collection: `${config.prefix}_posts`, field: 'author_image', related: 'directus_files' },
  ];

  if (config.features.includeProducts) {
    expectedRelations.push(
      { collection: `${config.prefix}_products`, field: 'category', related: `${config.prefix}_categories` },
      { collection: `${config.prefix}_products`, field: 'image', related: 'directus_files' },
    );
  }

  if (config.features.includePages) {
    expectedRelations.push(
      { collection: `${config.prefix}_pages`, field: 'featured_image', related: 'directus_files' },
      { collection: `${config.prefix}_pages`, field: 'parent_id', related: `${config.prefix}_pages` },
    );
  }

  try {
    const res = await fetch(`${config.url}/relations`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (!res.ok) {
      return {
        name: 'Relations',
        status: 'warn',
        message: `Cannot read relations: HTTP ${res.status}`,
        details: [],
        fixable: false,
      };
    }

    const data = await res.json();
    const existing = (data.data || []).map((r: any) => ({
      collection: r.collection,
      field: r.field,
      related: r.related_collection,
    }));

    for (const expected of expectedRelations) {
      const found = existing.some(
        (r: any) =>
          r.collection === expected.collection &&
          r.field === expected.field &&
          r.related === expected.related,
      );

      if (found) {
        details.push({ message: `${expected.collection}.${expected.field} -> ${expected.related}` });
      } else {
        details.push({
          message: `Missing relation: ${expected.collection}.${expected.field} -> ${expected.related}`,
        });
        issues++;
      }
    }

    return {
      name: 'Relations',
      status: issues === 0 ? 'pass' : 'warn',
      message: issues === 0
        ? 'All expected relations configured'
        : `${issues} relation(s) missing`,
      details,
      fixable: true,
    };
  } catch (err) {
    return {
      name: 'Relations',
      status: 'warn',
      message: `Error checking relations: ${err instanceof Error ? err.message : String(err)}`,
      details: [],
      fixable: false,
    };
  }
}
