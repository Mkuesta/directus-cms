import * as fs from 'node:fs';
import * as path from 'node:path';
import type { EnvVar } from './types.js';

export function detectRequiredEnvVars(dir: string): EnvVar[] {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`No package.json found in ${dir}`);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const envVars: EnvVar[] = [];

  // Core is always required
  envVars.push(
    { key: 'NEXT_PUBLIC_DIRECTUS_URL', value: '', required: true },
    { key: 'DIRECTUS_STATIC_TOKEN', value: '', required: true },
  );

  // Admin package
  if (deps['@directus-cms/admin']) {
    envVars.push(
      { key: 'ADMIN_PASSWORD', value: '', required: true },
      { key: 'ADMIN_SECRET', value: '', required: true },
    );
  }

  // Preview package
  if (deps['@directus-cms/preview']) {
    envVars.push(
      { key: 'PREVIEW_SECRET', value: '', required: true },
      { key: 'DIRECTUS_ADMIN_TOKEN', value: '', required: true },
    );
  }

  // Webhooks package
  if (deps['@directus-cms/webhooks']) {
    envVars.push(
      { key: 'WEBHOOK_SECRET', value: '', required: true },
    );
  }

  // Stripe package
  if (deps['@directus-cms/stripe']) {
    envVars.push(
      { key: 'STRIPE_SECRET_KEY', value: '', required: true },
      { key: 'STRIPE_WEBHOOK_SECRET', value: '', required: true },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: '', required: true },
    );
  }

  // Auth package
  if (deps['@directus-cms/auth']) {
    envVars.push(
      { key: 'NEXT_PUBLIC_SUPABASE_URL', value: '', required: true },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: '', required: true },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', value: '', required: true },
    );
  }

  // Email package
  if (deps['@directus-cms/email']) {
    envVars.push(
      { key: 'RESEND_API_KEY', value: '', required: true },
      { key: 'EMAIL_FROM', value: '', required: true },
    );
  }

  return envVars;
}

export function readEnvLocal(dir: string): Record<string, string> {
  const envPath = path.join(dir, '.env.local');
  if (!fs.existsSync(envPath)) return {};

  const content = fs.readFileSync(envPath, 'utf-8');
  const vars: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }

  return vars;
}

export function hasDirectusCmsDep(dir: string): boolean {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return !!deps['@directus-cms/core'];
}
