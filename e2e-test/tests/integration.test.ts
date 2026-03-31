import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getSchemas } from '../../provision-directus-site/src/schemas/index.js';
import { provision } from '../../provision-directus-site/src/provisioner.js';
import { detectRequiredEnvVars } from '../../deploy-directus-site/src/env-vars.js';
import { generatePackageJson } from '../../create-directus-site/src/generators.js';
import { scaffoldSite } from './helpers/scaffold.js';
import { createTmpDir, removeTmpDir } from './helpers/cleanup.js';
import {
  createCoreOnlySiteOptions,
  createFullSiteOptions,
  createCoreOnlyFeatures,
  createAllFeatures,
  createDryRunProvisionConfig,
} from './helpers/fixtures.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTmpDir();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  removeTmpDir(tmpDir);
});

describe('full pipeline integration', () => {
  it('scaffold core-only → provision dry-run → detect env vars: all pass, counts match', async () => {
    const opts = createCoreOnlySiteOptions();
    scaffoldSite(tmpDir, opts);

    // Provision dry-run
    const config = createDryRunProvisionConfig(opts.collectionPrefix, createCoreOnlyFeatures());
    const result = await provision(config);
    expect(result.errors).toHaveLength(0);
    expect(result.collectionsCreated).toHaveLength(3);

    // Deploy env var detection
    const envVars = detectRequiredEnvVars(tmpDir);
    expect(envVars).toHaveLength(2);
  });

  it('scaffold all-features → provision dry-run → detect env vars: 18 collections, 15 env vars', async () => {
    const opts = createFullSiteOptions();
    scaffoldSite(tmpDir, opts);

    const config = createDryRunProvisionConfig(opts.collectionPrefix, createAllFeatures());
    const result = await provision(config);
    expect(result.errors).toHaveLength(0);
    expect(result.collectionsCreated).toHaveLength(18);

    const envVars = detectRequiredEnvVars(tmpDir);
    expect(envVars).toHaveLength(15);
  });

  it('every file: dependency resolves to a sibling package whose name matches', () => {
    const opts = createFullSiteOptions();
    const pkgJson = JSON.parse(generatePackageJson(opts));
    const repoRoot = path.resolve(__dirname, '../..');

    for (const [depName, depValue] of Object.entries(pkgJson.dependencies)) {
      if (typeof depValue === 'string' && depValue.startsWith('file:')) {
        const dirName = depValue.replace('file:../../', '');
        const pkgDir = path.join(repoRoot, dirName);
        expect(fs.existsSync(pkgDir), `directory ${dirName} should exist`).toBe(true);

        const siblingPkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
        expect(siblingPkg.name).toBe(depName);
      }
    }
  });

  it('feature flag consistency: each enabled feature has both a dependency AND provisioned collections', () => {
    const opts = createFullSiteOptions();
    const pkgJson = JSON.parse(generatePackageJson(opts));
    const deps = Object.keys(pkgJson.dependencies);
    const schemas = getSchemas(opts.collectionPrefix, createAllFeatures());
    const collectionNames = schemas.map((s) => s.collection);

    // Features that have both a package dep and provisioned collections
    const featureMapping: [string, string, string[]][] = [
      ['includeProducts', '@directus-cms/products', ['_categories', '_products']],
      ['includeNavigation', '@directus-cms/navigation', ['_navigation_items']],
      ['includePages', '@directus-cms/pages', ['_pages']],
      ['includeForms', '@directus-cms/forms', ['_form_submissions']],
      ['includeAnalytics', '@directus-cms/analytics', ['_analytics_settings']],
      ['includeRedirects', '@directus-cms/redirects', ['_redirects']],
      ['includeMedia', '@directus-cms/media', ['_galleries', '_gallery_items']],
      ['includeBanners', '@directus-cms/banners', ['_banners']],
      ['includeI18n', '@directus-cms/i18n', ['_translations']],
      ['includeStripe', '@directus-cms/stripe', ['_orders']],
      ['includeAuth', '@directus-cms/auth', ['_user_profiles']],
      ['includeEmail', '@directus-cms/email', ['_email_templates', '_email_log']],
    ];

    for (const [_flag, depName, collectionSuffixes] of featureMapping) {
      // Has the dependency
      expect(deps, `${depName} should be in dependencies`).toContain(depName);
      // Has matching collections
      for (const suffix of collectionSuffixes) {
        const expected = `${opts.collectionPrefix}${suffix}`;
        expect(collectionNames, `collection ${expected} should exist`).toContain(expected);
      }
    }
  });

  it('collection prefix flows through scaffold configs and provision schemas', () => {
    const prefix = 'custom_prefix';
    const opts = createCoreOnlySiteOptions({ collectionPrefix: prefix });
    scaffoldSite(tmpDir, opts);

    // Check scaffold output
    const cmsConfig = fs.readFileSync(path.join(tmpDir, 'lib', 'cms.ts'), 'utf-8');
    expect(cmsConfig).toContain(`'${prefix}'`);

    // Check provision schemas
    const schemas = getSchemas(prefix, createCoreOnlyFeatures());
    for (const schema of schemas) {
      expect(schema.collection).toMatch(new RegExp(`^${prefix}_`));
    }
  });
});
