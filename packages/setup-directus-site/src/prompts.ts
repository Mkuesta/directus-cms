import * as readline from 'node:readline';
import * as crypto from 'node:crypto';
import { testConnection } from 'provision-directus-site/lib';
import type { SetupOptions } from './types.js';

function ask(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`  ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askYesNo(rl: readline.Interface, question: string, defaultValue: boolean = true): Promise<boolean> {
  const hint = defaultValue ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`  ${question} (${hint}): `, (answer) => {
      const a = answer.trim().toLowerCase();
      if (!a) return resolve(defaultValue);
      resolve(a === 'y' || a === 'yes');
    });
  });
}

function askRequired(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve) => {
    const tryAsk = () => {
      const suffix = defaultValue ? ` (${defaultValue})` : '';
      rl.question(`  ${question}${suffix}: `, (answer) => {
        const val = answer.trim() || defaultValue || '';
        if (!val) {
          console.log('    This field is required.');
          tryAsk();
        } else {
          resolve(val);
        }
      });
    };
    tryAsk();
  });
}

export async function askSetup(): Promise<SetupOptions> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    // --- Site identity ---
    console.log('\n  --- Site Identity ---');
    const siteName = await ask(rl, 'Site name', 'My Site');
    const siteSlug = await ask(rl, 'Site slug (directory name)', siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const collectionPrefix = await ask(rl, 'Collection prefix', siteSlug.replace(/-/g, '_'));
    const baseUrl = await ask(rl, 'Base URL', `https://${siteSlug}.com`);

    // --- Directus connection ---
    console.log('\n  --- Directus Connection ---');
    const directusUrl = await askRequired(rl, 'Directus URL', process.env.DIRECTUS_URL || 'https://your-directus-instance.com');
    const directusAdminToken = await askRequired(rl, 'Admin token (for provisioning)');
    const directusStaticToken = await ask(rl, 'Static token (for the site, leave blank to use admin token)', directusAdminToken);

    // Validate connection
    let connected = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      process.stdout.write(`  Testing connection (attempt ${attempt}/3)...`);
      connected = await testConnection({ url: directusUrl, token: directusAdminToken, prefix: '', seed: false, dryRun: false, features: { includeProducts: false, includeNavigation: false, includePages: false, includeForms: false, includeAnalytics: false, includeRedirects: false, includeMedia: false, includeBanners: false, includeI18n: false } });
      if (connected) {
        console.log(' connected.');
        break;
      }
      console.log(' failed.');
      if (attempt < 3) {
        console.log('  Retrying...');
      }
    }
    if (!connected) {
      console.error('\n  Could not connect to Directus. Please check your URL and token.');
      process.exit(1);
    }

    // --- Features ---
    console.log('\n  --- Features ---');
    const blogRoute = await ask(rl, 'Blog route', 'blog');

    const includeProducts = await askYesNo(rl, 'Include products?', false);
    let productRoute = 'product', categoryRoute = 'category', listingRoute = 'products', currency = 'EUR', siteId = 1;
    if (includeProducts) {
      productRoute = await ask(rl, 'Product route', 'product');
      categoryRoute = await ask(rl, 'Category route', 'category');
      listingRoute = await ask(rl, 'Listing route', 'products');
      currency = await ask(rl, 'Currency', 'EUR');
      siteId = parseInt(await ask(rl, 'Site ID (for multi-tenancy)', '1'), 10);
    }

    const includeAdmin = await askYesNo(rl, 'Include admin panel?');
    const includeSitemap = await askYesNo(rl, 'Include sitemap?');
    const includeNavigation = await askYesNo(rl, 'Include navigation?');
    const includePages = await askYesNo(rl, 'Include dynamic pages?');
    const includeForms = await askYesNo(rl, 'Include forms?');
    const includeAnalytics = await askYesNo(rl, 'Include analytics?');
    const includeRedirects = await askYesNo(rl, 'Include redirects?');
    const includeMedia = await askYesNo(rl, 'Include media/galleries?', false);
    const includeBanners = await askYesNo(rl, 'Include banners?', false);
    const includeSeo = await askYesNo(rl, 'Include SEO utilities?');
    const includeSearch = await askYesNo(rl, 'Include search?', false);
    const includeTags = await askYesNo(rl, 'Include tags?', false);
    const includePreview = await askYesNo(rl, 'Include preview mode?', false);
    const includeWebhooks = await askYesNo(rl, 'Include webhooks/ISR?', false);

    const includeI18n = await askYesNo(rl, 'Include i18n?', false);
    let locales = ['en'], defaultLocale = 'en';
    if (includeI18n) {
      defaultLocale = await ask(rl, 'Default locale', 'en');
      const localesStr = await ask(rl, 'All locales (comma-separated)', `${defaultLocale},de,fr`);
      locales = localesStr.split(',').map((l) => l.trim());
    }

    // --- Provisioning ---
    console.log('\n  --- Provisioning ---');
    const seedData = await askYesNo(rl, 'Seed sample data?');

    // --- Deployment ---
    console.log('\n  --- Deployment ---');
    const deployToVercel = await askYesNo(rl, 'Deploy to Vercel?', false);
    let vercelProjectName = siteSlug;
    if (deployToVercel) {
      vercelProjectName = await ask(rl, 'Vercel project name', siteSlug);
    }

    // --- Admin credentials ---
    let adminPassword = '', adminSecret = '';
    if (includeAdmin) {
      console.log('\n  --- Admin Credentials ---');
      adminPassword = await ask(rl, 'Admin password', crypto.randomBytes(16).toString('hex'));
      adminSecret = await ask(rl, 'Admin JWT secret', crypto.randomBytes(32).toString('hex'));
    }

    return {
      siteName, siteSlug, collectionPrefix, baseUrl, directusUrl, blogRoute,
      includeProducts, productRoute, categoryRoute, listingRoute, currency, siteId,
      includeAdmin, includeSitemap, includeNavigation, includePages, includeForms,
      includeAnalytics, includeRedirects, includeMedia, includeBanners,
      includeSeo, includeSearch, includeTags, includePreview, includeWebhooks,
      includeI18n, locales, defaultLocale,
      directusAdminToken, directusStaticToken,
      seedData, deployToVercel, vercelProjectName,
      adminPassword, adminSecret,
    };
  } finally {
    rl.close();
  }
}
