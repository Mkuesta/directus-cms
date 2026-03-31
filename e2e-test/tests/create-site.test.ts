import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  generatePackageJson,
  generateEnvLocal,
  generateCmsConfig,
  generateProductsConfig,
  generateSitemapConfig,
  generateNavigationConfig,
  generatePagesConfig,
  generateFormsConfig,
  generateAnalyticsConfig,
  generateRedirectsConfig,
  generateMediaConfig,
  generateBannersConfig,
  generateI18nConfig,
  generateSeoConfig,
  generateSearchConfig,
  generateTagsConfig,
  generatePreviewConfig,
  generateWebhooksConfig,
  generateStripeConfig,
  generateAuthConfig,
  generateEmailConfig,
  generateMiddleware,
  generateSitemapRoute,
  generateRobotsRoute,
  generateFormsApiRoute,
  generateSearchApiRoute,
  generatePreviewApiRoute,
  generateExitPreviewRoute,
  generateWebhooksApiRoute,
  generateStripeCheckoutRoute,
  generateStripeWebhookRoute,
  generateAuthCallbackRoute,
  generateEmailApiRoute,
  generateLayout,
  generateHomePage,
} from '../../create-directus-site/src/generators.js';
import { createCoreOnlySiteOptions, createFullSiteOptions } from './helpers/fixtures.js';
import { scaffoldSite } from './helpers/scaffold.js';
import { createTmpDir, removeTmpDir } from './helpers/cleanup.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTmpDir();
});

afterEach(() => {
  removeTmpDir(tmpDir);
});

// ---------------------------------------------------------------------------
// generatePackageJson
// ---------------------------------------------------------------------------
describe('generatePackageJson', () => {
  it('core-only config includes only @directus-cms/core dep', () => {
    const json = JSON.parse(generatePackageJson(createCoreOnlySiteOptions()));
    const depNames = Object.keys(json.dependencies);
    const cmsDeps = depNames.filter((d: string) => d.startsWith('@directus-cms/'));
    expect(cmsDeps).toEqual(['@directus-cms/core']);
  });

  it('full config includes all 20 @directus-cms/* dependencies', () => {
    const json = JSON.parse(generatePackageJson(createFullSiteOptions()));
    const cmsDeps = Object.keys(json.dependencies).filter((d: string) => d.startsWith('@directus-cms/'));
    expect(cmsDeps).toHaveLength(20);
    expect(cmsDeps).toContain('@directus-cms/core');
    expect(cmsDeps).toContain('@directus-cms/products');
    expect(cmsDeps).toContain('@directus-cms/admin');
    expect(cmsDeps).toContain('@directus-cms/sitemap');
    expect(cmsDeps).toContain('@directus-cms/navigation');
    expect(cmsDeps).toContain('@directus-cms/pages');
    expect(cmsDeps).toContain('@directus-cms/forms');
    expect(cmsDeps).toContain('@directus-cms/analytics');
    expect(cmsDeps).toContain('@directus-cms/redirects');
    expect(cmsDeps).toContain('@directus-cms/media');
    expect(cmsDeps).toContain('@directus-cms/banners');
    expect(cmsDeps).toContain('@directus-cms/i18n');
    expect(cmsDeps).toContain('@directus-cms/seo');
    expect(cmsDeps).toContain('@directus-cms/search');
    expect(cmsDeps).toContain('@directus-cms/tags');
    expect(cmsDeps).toContain('@directus-cms/preview');
    expect(cmsDeps).toContain('@directus-cms/webhooks');
    expect(cmsDeps).toContain('@directus-cms/stripe');
    expect(cmsDeps).toContain('@directus-cms/auth');
    expect(cmsDeps).toContain('@directus-cms/email');
  });

  it('all @directus-cms deps use file:../../directus-cms-* paths', () => {
    const json = JSON.parse(generatePackageJson(createFullSiteOptions()));
    const deps = json.dependencies;
    for (const [name, value] of Object.entries(deps)) {
      if (name.startsWith('@directus-cms/')) {
        expect(value).toMatch(/^file:\.\.\/\.\.\/directus-cms-/);
      }
    }
  });

  it('each file: dep points to existing sibling directory with matching name', () => {
    const json = JSON.parse(generatePackageJson(createFullSiteOptions()));
    const repoRoot = path.resolve(__dirname, '../..');
    for (const [name, value] of Object.entries(json.dependencies)) {
      if (typeof value === 'string' && value.startsWith('file:')) {
        const relPath = value.replace('file:', '');
        // The file: path is relative to the scaffolded site (sites/<slug>),
        // so ../../directus-cms-X from sites/<slug> = repo root directus-cms-X
        const dirName = relPath.replace('../../', '');
        const pkgDir = path.join(repoRoot, dirName);
        expect(fs.existsSync(pkgDir), `${pkgDir} should exist`).toBe(true);

        const siblingPkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
        expect(siblingPkg.name).toBe(name);
      }
    }
  });

  it.each([
    ['includeProducts', '@directus-cms/products'],
    ['includeAdmin', '@directus-cms/admin'],
    ['includeSitemap', '@directus-cms/sitemap'],
    ['includeNavigation', '@directus-cms/navigation'],
    ['includePages', '@directus-cms/pages'],
    ['includeForms', '@directus-cms/forms'],
    ['includeAnalytics', '@directus-cms/analytics'],
    ['includeRedirects', '@directus-cms/redirects'],
    ['includeMedia', '@directus-cms/media'],
    ['includeBanners', '@directus-cms/banners'],
    ['includeI18n', '@directus-cms/i18n'],
    ['includeSeo', '@directus-cms/seo'],
    ['includeSearch', '@directus-cms/search'],
    ['includeTags', '@directus-cms/tags'],
    ['includePreview', '@directus-cms/preview'],
    ['includeWebhooks', '@directus-cms/webhooks'],
    ['includeStripe', '@directus-cms/stripe'],
    ['includeAuth', '@directus-cms/auth'],
    ['includeEmail', '@directus-cms/email'],
  ] as const)('%s adds exactly %s', (flag, expectedDep) => {
    const baseOpts = createCoreOnlySiteOptions();
    const baseDeps = Object.keys(JSON.parse(generatePackageJson(baseOpts)).dependencies);

    const opts = createCoreOnlySiteOptions({ [flag]: true } as any);
    const newDeps = Object.keys(JSON.parse(generatePackageJson(opts)).dependencies);

    const added = newDeps.filter((d: string) => !baseDeps.includes(d));
    expect(added).toEqual([expectedDep]);
  });
});

// ---------------------------------------------------------------------------
// generateEnvLocal
// ---------------------------------------------------------------------------
describe('generateEnvLocal', () => {
  it('core-only includes NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_STATIC_TOKEN', () => {
    const env = generateEnvLocal(createCoreOnlySiteOptions());
    expect(env).toContain('NEXT_PUBLIC_DIRECTUS_URL=');
    expect(env).toContain('DIRECTUS_STATIC_TOKEN=');
    expect(env).not.toContain('ADMIN_PASSWORD');
    expect(env).not.toContain('ADMIN_SECRET');
  });

  it('with admin adds ADMIN_PASSWORD and ADMIN_SECRET', () => {
    const env = generateEnvLocal(createCoreOnlySiteOptions({ includeAdmin: true }));
    expect(env).toContain('ADMIN_PASSWORD=');
    expect(env).toContain('ADMIN_SECRET=');
  });

  it('with stripe adds STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', () => {
    const env = generateEnvLocal(createCoreOnlySiteOptions({ includeStripe: true }));
    expect(env).toContain('STRIPE_SECRET_KEY=');
    expect(env).toContain('STRIPE_WEBHOOK_SECRET=');
    expect(env).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=');
  });

  it('with auth adds NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY', () => {
    const env = generateEnvLocal(createCoreOnlySiteOptions({ includeAuth: true }));
    expect(env).toContain('NEXT_PUBLIC_SUPABASE_URL=');
    expect(env).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
    expect(env).toContain('SUPABASE_SERVICE_ROLE_KEY=');
  });

  it('with email adds RESEND_API_KEY and EMAIL_FROM', () => {
    const env = generateEnvLocal(createCoreOnlySiteOptions({ includeEmail: true }));
    expect(env).toContain('RESEND_API_KEY=');
    expect(env).toContain('EMAIL_FROM=');
  });
});

// ---------------------------------------------------------------------------
// Config generators (parameterized)
// ---------------------------------------------------------------------------
describe('config generators', () => {
  it.each([
    ['generateCmsConfig', generateCmsConfig, '@directus-cms/core'],
    ['generateProductsConfig', generateProductsConfig, '@directus-cms/products'],
    ['generateSitemapConfig', generateSitemapConfig, '@directus-cms/sitemap'],
    ['generateNavigationConfig', generateNavigationConfig, '@directus-cms/navigation'],
    ['generatePagesConfig', generatePagesConfig, '@directus-cms/pages'],
    ['generateFormsConfig', generateFormsConfig, '@directus-cms/forms'],
    ['generateAnalyticsConfig', generateAnalyticsConfig, '@directus-cms/analytics'],
    ['generateRedirectsConfig', generateRedirectsConfig, '@directus-cms/redirects'],
    ['generateMediaConfig', generateMediaConfig, '@directus-cms/media'],
    ['generateBannersConfig', generateBannersConfig, '@directus-cms/banners'],
    ['generateI18nConfig', generateI18nConfig, '@directus-cms/i18n'],
    ['generateSeoConfig', generateSeoConfig, '@directus-cms/seo'],
    ['generateSearchConfig', generateSearchConfig, '@directus-cms/search'],
    ['generateTagsConfig', generateTagsConfig, '@directus-cms/tags'],
    ['generatePreviewConfig', generatePreviewConfig, '@directus-cms/preview'],
    ['generateWebhooksConfig', generateWebhooksConfig, '@directus-cms/webhooks'],
    ['generateStripeConfig', generateStripeConfig, '@directus-cms/stripe'],
    ['generateAuthConfig', generateAuthConfig, '@directus-cms/auth'],
    ['generateEmailConfig', generateEmailConfig, '@directus-cms/email'],
  ] as const)('%s produces non-empty output containing %s import', (_name, generator, expectedImport) => {
    const opts = createFullSiteOptions();
    const output = generator(opts);
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain(expectedImport);
  });
});

// ---------------------------------------------------------------------------
// Route generators
// ---------------------------------------------------------------------------
describe('route generators', () => {
  it('generateLayout includes siteName and defaultLocale', () => {
    const opts = createFullSiteOptions({ siteName: 'My Custom Site', defaultLocale: 'de' });
    const output = generateLayout(opts);
    expect(output).toContain('My Custom Site');
    expect(output).toContain('lang="de"');
  });

  it('generateHomePage includes siteName', () => {
    const opts = createFullSiteOptions({ siteName: 'My Custom Site' });
    const output = generateHomePage(opts);
    expect(output).toContain('My Custom Site');
  });

  it('generateSitemapRoute contains generateSitemap()', () => {
    const output = generateSitemapRoute();
    expect(output).toContain('generateSitemap()');
  });

  it('generateRobotsRoute contains generateRobots()', () => {
    const output = generateRobotsRoute();
    expect(output).toContain('generateRobots()');
  });

  it('generateFormsApiRoute exports POST', () => {
    const output = generateFormsApiRoute();
    expect(output).toContain('export const POST');
  });

  it('generateStripeCheckoutRoute exports POST', () => {
    const output = generateStripeCheckoutRoute();
    expect(output).toContain('export const POST');
  });

  it('generateStripeWebhookRoute exports POST', () => {
    const output = generateStripeWebhookRoute();
    expect(output).toContain('export const POST');
  });

  it('generateAuthCallbackRoute exports GET', () => {
    const output = generateAuthCallbackRoute();
    expect(output).toContain('export const GET');
  });

  it('generateEmailApiRoute exports POST', () => {
    const output = generateEmailApiRoute();
    expect(output).toContain('export const POST');
  });

  it('generateMiddleware with redirects enabled contains matchRedirect', () => {
    const opts = createCoreOnlySiteOptions({ includeRedirects: true });
    const output = generateMiddleware(opts);
    expect(output).toContain('matchRedirect');
  });

  it('generateMiddleware with redirects disabled returns empty string', () => {
    const opts = createCoreOnlySiteOptions({ includeRedirects: false });
    const output = generateMiddleware(opts);
    expect(output).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Full scaffold to disk
// ---------------------------------------------------------------------------
describe('scaffold to disk', () => {
  const BASE_FILES = [
    'package.json',
    '.env.local',
    '.gitignore',
    'tsconfig.json',
    'next.config.ts',
    'lib/cms.ts',
    'app/layout.tsx',
    'app/page.tsx',
  ];

  const OPTIONAL_FILES = [
    'lib/products.ts',
    'lib/sitemap.ts',
    'lib/navigation.ts',
    'lib/pages.ts',
    'lib/forms.ts',
    'lib/analytics.ts',
    'lib/redirects.ts',
    'lib/media.ts',
    'lib/banners.ts',
    'lib/i18n.ts',
    'lib/seo.ts',
    'lib/search.ts',
    'lib/tags.ts',
    'lib/preview.ts',
    'lib/webhooks.ts',
    'lib/stripe.ts',
    'lib/auth.ts',
    'lib/email.ts',
    'app/sitemap.ts',
    'app/robots.ts',
    'app/api/forms/route.ts',
    'app/api/search/route.ts',
    'app/api/preview/route.ts',
    'app/api/preview/exit/route.ts',
    'app/api/webhooks/directus/route.ts',
    'app/api/checkout/route.ts',
    'app/api/webhooks/stripe/route.ts',
    'app/api/auth/callback/route.ts',
    'app/api/email/route.ts',
    'middleware.ts',
  ];

  it('core-only scaffold creates 8 base files', () => {
    scaffoldSite(tmpDir, createCoreOnlySiteOptions());
    for (const f of BASE_FILES) {
      expect(fs.existsSync(path.join(tmpDir, f)), `${f} should exist`).toBe(true);
    }
    const allFiles = BASE_FILES.concat(OPTIONAL_FILES);
    for (const f of OPTIONAL_FILES) {
      expect(fs.existsSync(path.join(tmpDir, f)), `${f} should NOT exist`).toBe(false);
    }
  });

  it('full scaffold creates all 38 files', () => {
    scaffoldSite(tmpDir, createFullSiteOptions());
    const allFiles = BASE_FILES.concat(OPTIONAL_FILES);
    for (const f of allFiles) {
      expect(fs.existsSync(path.join(tmpDir, f)), `${f} should exist`).toBe(true);
    }
  });

  it('generated package.json is valid JSON', () => {
    scaffoldSite(tmpDir, createFullSiteOptions());
    const raw = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('collection prefix appears in lib/cms.ts', () => {
    const opts = createCoreOnlySiteOptions({ collectionPrefix: 'my_prefix' });
    scaffoldSite(tmpDir, opts);
    const cms = fs.readFileSync(path.join(tmpDir, 'lib', 'cms.ts'), 'utf-8');
    expect(cms).toContain("'my_prefix'");
  });
});
