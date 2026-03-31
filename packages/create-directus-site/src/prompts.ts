import * as readline from 'node:readline';

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

export interface SiteOptions {
  siteName: string;
  siteSlug: string;
  collectionPrefix: string;
  baseUrl: string;
  directusUrl: string;
  blogRoute: string;
  includeProducts: boolean;
  productRoute: string;
  categoryRoute: string;
  listingRoute: string;
  currency: string;
  siteId: number;
  includeAdmin: boolean;
  includeSitemap: boolean;
  includeNavigation: boolean;
  includePages: boolean;
  includeForms: boolean;
  includeAnalytics: boolean;
  includeRedirects: boolean;
  includeMedia: boolean;
  includeBanners: boolean;
  includeSeo: boolean;
  includeSearch: boolean;
  includeTags: boolean;
  includePreview: boolean;
  includeWebhooks: boolean;
  includeI18n: boolean;
  includeStripe: boolean;
  includeAuth: boolean;
  includeEmail: boolean;
  includeNewsletter: boolean;
  includeNotifications: boolean;
  locales: string[];
  defaultLocale: string;
}

export async function promptUser(): Promise<SiteOptions> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('\n🚀 Create Directus Site\n');

    const siteName = await ask(rl, 'Site name', 'My Site');
    const siteSlug = await ask(rl, 'Site slug (for directory name)', siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const collectionPrefix = await ask(rl, 'Directus collection prefix', siteSlug.replace(/-/g, '_'));
    const baseUrl = await ask(rl, 'Base URL', `https://${siteSlug}.com`);
    const directusUrl = await ask(rl, 'Directus URL', process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://your-directus-instance.com');
    const blogRoute = await ask(rl, 'Blog route', 'blog');

    console.log('\n--- Features ---');
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
    const includeNewsletter = await askYesNo(rl, 'Include newsletter?', false);
    const includeNotifications = await askYesNo(rl, 'Include notifications (toasts)?', false);

    const includeStripe = await askYesNo(rl, 'Include Stripe payments?', false);
    const includeAuth = await askYesNo(rl, 'Include user authentication (Supabase)?', false);
    const includeEmail = await askYesNo(rl, 'Include transactional email (Resend)?', false);

    const includeI18n = await askYesNo(rl, 'Include i18n?', false);
    let locales = ['en'], defaultLocale = 'en';
    if (includeI18n) {
      defaultLocale = await ask(rl, 'Default locale', 'en');
      const localesStr = await ask(rl, 'All locales (comma-separated)', `${defaultLocale},de,fr`);
      locales = localesStr.split(',').map((l) => l.trim());
    }

    return {
      siteName, siteSlug, collectionPrefix, baseUrl, directusUrl, blogRoute,
      includeProducts, productRoute, categoryRoute, listingRoute, currency, siteId,
      includeAdmin, includeSitemap, includeNavigation, includePages, includeForms,
      includeAnalytics, includeRedirects, includeMedia, includeBanners,
      includeSeo, includeSearch, includeTags, includePreview, includeWebhooks,
      includeStripe, includeAuth, includeEmail,
      includeNewsletter, includeNotifications,
      includeI18n, locales, defaultLocale,
    };
  } finally {
    rl.close();
  }
}
