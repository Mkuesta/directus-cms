import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ValidateConfig, CheckResult, CheckDetail } from '../types.js';

export function validateEnvVars(config: ValidateConfig): CheckResult {
  if (!config.dir) {
    return {
      name: 'Environment Variables',
      status: 'warn',
      message: 'No project directory specified (use --dir)',
      details: [],
      fixable: false,
    };
  }

  const envPath = path.join(config.dir, '.env.local');
  if (!fs.existsSync(envPath)) {
    return {
      name: 'Environment Variables',
      status: 'fail',
      message: `.env.local not found in ${config.dir}`,
      details: [],
      fixable: false,
    };
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const vars = parseEnvFile(content);
  const details: CheckDetail[] = [];
  let issues = 0;

  const required = [
    { key: 'NEXT_PUBLIC_DIRECTUS_URL', placeholder: ['your-directus-url', 'https://example.com'] },
    { key: 'DIRECTUS_STATIC_TOKEN', placeholder: ['your-directus-token-here', 'your-token'] },
  ];

  for (const { key, placeholder } of required) {
    const value = vars[key];
    if (!value) {
      details.push({ message: `${key} is not set` });
      issues++;
    } else if (placeholder.some((p) => value.includes(p))) {
      details.push({ message: `${key} appears to be a placeholder value` });
      issues++;
    } else {
      details.push({ message: `${key} is set` });
    }
  }

  return {
    name: 'Environment Variables',
    status: issues === 0 ? 'pass' : 'fail',
    message: issues === 0
      ? 'All required env vars configured'
      : `${issues} env var issue(s)`,
    details,
    fixable: false,
  };
}

function parseEnvFile(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}
