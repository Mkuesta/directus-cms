import type { ValidateConfig, CheckResult, CheckDetail } from '../types.js';

export async function validateCollections(config: ValidateConfig): Promise<CheckResult> {
  const details: CheckDetail[] = [];
  let allPresent = true;

  // Build expected collection list
  const expected = getExpectedCollections(config.prefix, config.features);

  try {
    const res = await fetch(`${config.url}/collections`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (!res.ok) {
      return {
        name: 'Collections',
        status: 'fail',
        message: `Cannot read collections: HTTP ${res.status}`,
        details: [],
        fixable: false,
      };
    }

    const data = await res.json();
    const existing = new Set((data.data || []).map((c: any) => c.collection));

    for (const col of expected) {
      if (existing.has(col)) {
        details.push({ message: `${col} exists` });
      } else {
        details.push({ message: `${col} is MISSING` });
        allPresent = false;
      }
    }

    return {
      name: 'Collections',
      status: allPresent ? 'pass' : 'fail',
      message: allPresent
        ? `All ${expected.length} expected collections exist`
        : `${details.filter((d) => d.message.includes('MISSING')).length} collections missing`,
      details,
      fixable: true,
    };
  } catch (err) {
    return {
      name: 'Collections',
      status: 'fail',
      message: `Error checking collections: ${err instanceof Error ? err.message : String(err)}`,
      details: [],
      fixable: false,
    };
  }
}

function getExpectedCollections(prefix: string, features: ValidateConfig['features']): string[] {
  const cols = [
    `${prefix}_settings`,
    `${prefix}_blog_categories`,
    `${prefix}_posts`,
  ];

  if (features.includeProducts) {
    cols.push(`${prefix}_categories`, `${prefix}_products`);
  }
  if (features.includeNavigation) cols.push(`${prefix}_navigation_items`);
  if (features.includePages) cols.push(`${prefix}_pages`);
  if (features.includeForms) cols.push(`${prefix}_form_submissions`);
  if (features.includeAnalytics) cols.push(`${prefix}_analytics_settings`);
  if (features.includeRedirects) cols.push(`${prefix}_redirects`);
  if (features.includeMedia) {
    cols.push(`${prefix}_galleries`, `${prefix}_gallery_items`);
  }
  if (features.includeBanners) cols.push(`${prefix}_banners`);
  if (features.includeI18n) cols.push(`${prefix}_translations`);
  if (features.includeTags) {
    cols.push(`${prefix}_tags`, `${prefix}_posts_tags`);
  }

  return cols;
}
