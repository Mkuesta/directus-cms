import type { ValidateConfig, CheckResult } from '../types.js';

export async function validateConnection(config: ValidateConfig): Promise<CheckResult> {
  try {
    const res = await fetch(`${config.url}/server/info`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (res.ok) {
      return {
        name: 'Connection',
        status: 'pass',
        message: `Connected to ${config.url}`,
        details: [],
        fixable: false,
      };
    }

    return {
      name: 'Connection',
      status: 'fail',
      message: `Server responded with ${res.status}`,
      details: [{ message: `HTTP ${res.status}: Check URL and token` }],
      fixable: false,
    };
  } catch (err) {
    return {
      name: 'Connection',
      status: 'fail',
      message: `Cannot reach ${config.url}`,
      details: [{ message: err instanceof Error ? err.message : String(err) }],
      fixable: false,
    };
  }
}
