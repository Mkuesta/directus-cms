import * as readline from 'node:readline';
import type { FeatureFlags } from './types.js';

function ask(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askYesNo(rl: readline.Interface, question: string, defaultValue: boolean = true): Promise<boolean> {
  const hint = defaultValue ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`${question} (${hint}): `, (answer) => {
      const a = answer.trim().toLowerCase();
      if (!a) return resolve(defaultValue);
      resolve(a === 'y' || a === 'yes');
    });
  });
}

export interface PromptResult {
  url: string;
  token: string;
  prefix: string;
  seed: boolean;
  features: FeatureFlags;
}

export async function promptUser(): Promise<PromptResult> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('\nProvision Directus Site\n');

    const url = await ask(rl, 'Directus URL', process.env.DIRECTUS_URL || 'https://your-directus-instance.com');
    const token = await ask(rl, 'Admin token', process.env.DIRECTUS_ADMIN_TOKEN || '');
    if (!token) {
      console.error('Error: Admin token is required');
      process.exit(1);
    }
    const prefix = await ask(rl, 'Collection prefix', 'mysite_en');
    const seed = await askYesNo(rl, 'Seed sample data?', false);

    console.log('\n--- Features ---');
    const includeProducts = await askYesNo(rl, 'Include products?', false);
    const includeNavigation = await askYesNo(rl, 'Include navigation?');
    const includePages = await askYesNo(rl, 'Include dynamic pages?');
    const includeForms = await askYesNo(rl, 'Include forms?');
    const includeAnalytics = await askYesNo(rl, 'Include analytics?');
    const includeRedirects = await askYesNo(rl, 'Include redirects?');
    const includeMedia = await askYesNo(rl, 'Include media/galleries?', false);
    const includeBanners = await askYesNo(rl, 'Include banners?', false);
    const includeI18n = await askYesNo(rl, 'Include i18n?', false);

    return {
      url, token, prefix, seed,
      features: {
        includeProducts, includeNavigation, includePages, includeForms,
        includeAnalytics, includeRedirects, includeMedia, includeBanners, includeI18n,
      },
    };
  } finally {
    rl.close();
  }
}
