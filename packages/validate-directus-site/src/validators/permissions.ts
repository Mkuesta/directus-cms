import type { ValidateConfig, CheckResult, CheckDetail } from '../types.js';

export async function validatePermissions(config: ValidateConfig): Promise<CheckResult> {
  const details: CheckDetail[] = [];
  let issues = 0;

  // Collections that need Public read access
  const readCollections = [
    `${config.prefix}_settings`,
    `${config.prefix}_blog_categories`,
    `${config.prefix}_posts`,
  ];

  if (config.features.includeProducts) {
    readCollections.push(`${config.prefix}_categories`, `${config.prefix}_products`);
  }
  if (config.features.includeNavigation) readCollections.push(`${config.prefix}_navigation_items`);
  if (config.features.includePages) readCollections.push(`${config.prefix}_pages`);
  if (config.features.includeAnalytics) readCollections.push(`${config.prefix}_analytics_settings`);
  if (config.features.includeRedirects) readCollections.push(`${config.prefix}_redirects`);
  if (config.features.includeBanners) readCollections.push(`${config.prefix}_banners`);
  if (config.features.includeI18n) readCollections.push(`${config.prefix}_translations`);

  // Collections that need Public create access
  const createCollections: string[] = [];
  if (config.features.includeForms) {
    createCollections.push(`${config.prefix}_form_submissions`);
  }

  try {
    const res = await fetch(`${config.url}/permissions`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (!res.ok) {
      return {
        name: 'Permissions',
        status: 'warn',
        message: `Cannot read permissions: HTTP ${res.status}`,
        details: [],
        fixable: true,
      };
    }

    const data = await res.json();
    const perms = data.data || [];

    // Check public read permissions (role = null means Public role)
    for (const col of readCollections) {
      const hasRead = perms.some(
        (p: any) => p.role === null && p.collection === col && p.action === 'read',
      );
      if (hasRead) {
        details.push({ message: `Public READ on ${col}` });
      } else {
        details.push({ message: `Missing Public READ on ${col}` });
        issues++;
      }
    }

    for (const col of createCollections) {
      const hasCreate = perms.some(
        (p: any) => p.role === null && p.collection === col && p.action === 'create',
      );
      if (hasCreate) {
        details.push({ message: `Public CREATE on ${col}` });
      } else {
        details.push({ message: `Missing Public CREATE on ${col}` });
        issues++;
      }
    }

    return {
      name: 'Permissions',
      status: issues === 0 ? 'pass' : 'warn',
      message: issues === 0
        ? 'All expected permissions configured'
        : `${issues} permission(s) missing`,
      details,
      fixable: true,
    };
  } catch (err) {
    return {
      name: 'Permissions',
      status: 'warn',
      message: `Error checking permissions: ${err instanceof Error ? err.message : String(err)}`,
      details: [],
      fixable: false,
    };
  }
}
