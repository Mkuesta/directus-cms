import type { ValidateConfig, CheckResult, CheckDetail } from '../types.js';

export async function validateFields(config: ValidateConfig): Promise<CheckResult> {
  const details: CheckDetail[] = [];
  let issues = 0;

  // Check critical fields on core collections
  const criticalFields: Record<string, string[]> = {
    [`${config.prefix}_posts`]: ['title', 'slug', 'content', 'status', 'category', 'tags', 'published_date'],
    [`${config.prefix}_settings`]: ['site_name'],
    [`${config.prefix}_blog_categories`]: ['name', 'slug'],
  };

  if (config.features.includeProducts) {
    criticalFields[`${config.prefix}_products`] = ['title', 'slug', 'price', 'status', 'category', 'site'];
    criticalFields[`${config.prefix}_categories`] = ['name', 'slug'];
  }

  if (config.features.includePages) {
    criticalFields[`${config.prefix}_pages`] = ['title', 'slug', 'content', 'status'];
  }

  for (const [collection, expectedFields] of Object.entries(criticalFields)) {
    try {
      const res = await fetch(`${config.url}/fields/${collection}`, {
        headers: { Authorization: `Bearer ${config.token}` },
      });

      if (!res.ok) {
        details.push({ message: `Cannot read fields for ${collection}: HTTP ${res.status}` });
        issues++;
        continue;
      }

      const data = await res.json();
      const existingFields = new Set((data.data || []).map((f: any) => f.field));

      for (const field of expectedFields) {
        if (!existingFields.has(field)) {
          details.push({
            field: `${collection}.${field}`,
            message: `Missing field: ${collection}.${field}`,
          });
          issues++;
        }
      }
    } catch (err) {
      details.push({ message: `Error checking ${collection}: ${err instanceof Error ? err.message : String(err)}` });
      issues++;
    }
  }

  return {
    name: 'Fields',
    status: issues === 0 ? 'pass' : 'fail',
    message: issues === 0
      ? 'All critical fields present'
      : `${issues} field issue(s) found`,
    details,
    fixable: true,
  };
}
