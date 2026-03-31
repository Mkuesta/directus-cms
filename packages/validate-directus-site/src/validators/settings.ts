import type { ValidateConfig, CheckResult } from '../types.js';

export async function validateSettings(config: ValidateConfig): Promise<CheckResult> {
  const collection = `${config.prefix}_settings`;

  try {
    const res = await fetch(`${config.url}/items/${collection}`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (!res.ok) {
      return {
        name: 'Settings',
        status: 'warn',
        message: `Cannot read settings: HTTP ${res.status}`,
        details: [],
        fixable: false,
      };
    }

    const data = await res.json();
    const settings = data.data;

    if (!settings || !settings.site_name) {
      return {
        name: 'Settings',
        status: 'warn',
        message: 'Settings singleton exists but site_name is empty',
        details: [{ message: 'Set site_name in Directus admin' }],
        fixable: false,
      };
    }

    return {
      name: 'Settings',
      status: 'pass',
      message: `Settings configured (site: ${settings.site_name})`,
      details: [],
      fixable: false,
    };
  } catch (err) {
    return {
      name: 'Settings',
      status: 'warn',
      message: `Error reading settings: ${err instanceof Error ? err.message : String(err)}`,
      details: [],
      fixable: false,
    };
  }
}
