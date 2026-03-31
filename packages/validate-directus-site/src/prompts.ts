import * as readline from 'node:readline';
import type { ValidateConfig, FeatureFlags } from './types.js';

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

export async function promptUser(): Promise<ValidateConfig> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('\nValidate Directus Site\n');

    const url = await ask(rl, 'Directus URL', process.env.DIRECTUS_URL);
    const token = await ask(rl, 'Admin token', process.env.DIRECTUS_ADMIN_TOKEN);
    const prefix = await ask(rl, 'Collection prefix');

    console.log('\n--- Features to validate ---');
    const features: FeatureFlags = {
      includeProducts: await askYesNo(rl, 'Products?', false),
      includeNavigation: await askYesNo(rl, 'Navigation?'),
      includePages: await askYesNo(rl, 'Pages?'),
      includeForms: await askYesNo(rl, 'Forms?'),
      includeAnalytics: await askYesNo(rl, 'Analytics?'),
      includeRedirects: await askYesNo(rl, 'Redirects?'),
      includeMedia: await askYesNo(rl, 'Media?', false),
      includeBanners: await askYesNo(rl, 'Banners?', false),
      includeI18n: await askYesNo(rl, 'I18n?', false),
    };

    const fix = await askYesNo(rl, 'Auto-fix issues?', false);
    const checkData = await askYesNo(rl, 'Check data integrity?', false);

    return { url, token, prefix, features, fix, checkData };
  } finally {
    rl.close();
  }
}
