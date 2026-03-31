import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSchemas } from '../../provision-directus-site/src/schemas/index.js';
import { provision } from '../../provision-directus-site/src/provisioner.js';
import {
  createCoreOnlyFeatures,
  createAllFeatures,
  createDryRunProvisionConfig,
} from './helpers/fixtures.js';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// getSchemas()
// ---------------------------------------------------------------------------
describe('getSchemas', () => {
  it('core-only features return 3 collections', () => {
    const schemas = getSchemas('test', createCoreOnlyFeatures());
    expect(schemas).toHaveLength(3);
    expect(schemas.map((s) => s.collection)).toEqual([
      'test_settings',
      'test_blog_categories',
      'test_posts',
    ]);
  });

  it('all features return 18 collections', () => {
    const schemas = getSchemas('test', createAllFeatures());
    expect(schemas).toHaveLength(18);
  });

  it('core fields total = 74', () => {
    const schemas = getSchemas('test', createCoreOnlyFeatures());
    const total = schemas.reduce((sum, s) => sum + s.fields.length, 0);
    expect(total).toBe(74);
  });

  it('all features fields total = 244', () => {
    const schemas = getSchemas('test', createAllFeatures());
    const total = schemas.reduce((sum, s) => sum + s.fields.length, 0);
    expect(total).toBe(244);
  });

  it('all features relations total = 17', () => {
    const schemas = getSchemas('test', createAllFeatures());
    const total = schemas.reduce((sum, s) => sum + (s.relations?.length ?? 0), 0);
    expect(total).toBe(17);
  });

  it('settings and analytics_settings are singletons', () => {
    const schemas = getSchemas('test', createAllFeatures());
    const singletons = schemas.filter((s) => s.singleton);
    expect(singletons).toHaveLength(2);
    expect(singletons.map((s) => s.collection).sort()).toEqual([
      'test_analytics_settings',
      'test_settings',
    ]);
  });

  it('products feature adds exactly 2 collections', () => {
    const base = getSchemas('test', createCoreOnlyFeatures());
    const withProducts = getSchemas('test', { ...createCoreOnlyFeatures(), includeProducts: true });
    const added = withProducts.filter((s) => !base.find((b) => b.collection === s.collection));
    expect(added).toHaveLength(2);
    expect(added.map((s) => s.collection).sort()).toEqual(['test_categories', 'test_products']);
  });

  it('media feature adds exactly 2 collections', () => {
    const base = getSchemas('test', createCoreOnlyFeatures());
    const withMedia = getSchemas('test', { ...createCoreOnlyFeatures(), includeMedia: true });
    const added = withMedia.filter((s) => !base.find((b) => b.collection === s.collection));
    expect(added).toHaveLength(2);
    expect(added.map((s) => s.collection).sort()).toEqual(['test_galleries', 'test_gallery_items']);
  });

  it('all relations reference correct prefixed collection names', () => {
    const schemas = getSchemas('myprefix', createAllFeatures());
    const allCollections = new Set(schemas.map((s) => s.collection));
    allCollections.add('directus_files'); // system collection

    for (const schema of schemas) {
      for (const rel of schema.relations ?? []) {
        expect(allCollections.has(rel.collection), `relation collection ${rel.collection} should exist`).toBe(true);
        if (rel.related_collection) {
          expect(allCollections.has(rel.related_collection), `related_collection ${rel.related_collection} should exist`).toBe(true);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// provision() dry-run
// ---------------------------------------------------------------------------
describe('provision dry-run', () => {
  it('core-only dry-run: 0 errors, 3 collections, 74 fields', async () => {
    const config = createDryRunProvisionConfig('drytest', createCoreOnlyFeatures());
    const result = await provision(config);

    expect(result.errors).toHaveLength(0);
    expect(result.collectionsCreated).toHaveLength(3);
    expect(result.fieldsCreated).toBe(74);
  });

  it('all-features dry-run: 0 errors, 18 collections, 244 fields, 17 relations, 19 permissions', async () => {
    const config = createDryRunProvisionConfig('drytest', createAllFeatures());
    const result = await provision(config);

    expect(result.errors).toHaveLength(0);
    expect(result.collectionsCreated).toHaveLength(18);
    expect(result.fieldsCreated).toBe(244);
    expect(result.relationsCreated).toBe(17);
    expect(result.permissionsCreated).toBe(19);
  });

  it('form_submissions gets extra create permission (15 total vs 14 read-only)', async () => {
    // Without forms: all collections get read-only = N permissions
    const noForms = { ...createAllFeatures(), includeForms: false };
    const configNoForms = createDryRunProvisionConfig('drytest', noForms);
    const resultNoForms = await provision(configNoForms);

    const withForms = createAllFeatures();
    const configWithForms = createDryRunProvisionConfig('drytest', withForms);
    const resultWithForms = await provision(configWithForms);

    // Adding forms adds 1 collection (1 read perm) + 1 create perm = 2 more
    expect(resultWithForms.permissionsCreated - resultNoForms.permissionsCreated).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Real Directus (conditional)
// ---------------------------------------------------------------------------
describe.skipIf(!process.env.DIRECTUS_TEST_URL)('provision against real Directus', () => {
  it('provision with unique prefix creates collections with 0 errors', async () => {
    const prefix = `e2e_test_${Date.now()}`;
    const config = {
      url: process.env.DIRECTUS_TEST_URL!,
      token: process.env.DIRECTUS_TEST_TOKEN!,
      prefix,
      seed: false,
      dryRun: false,
      features: createCoreOnlyFeatures(),
    };
    const result = await provision(config);
    expect(result.errors).toHaveLength(0);
    expect(result.collectionsCreated.length).toBeGreaterThan(0);
  });

  it('re-provision same prefix skips collections, 0 created', async () => {
    const prefix = `e2e_test_${Date.now()}`;
    const config = {
      url: process.env.DIRECTUS_TEST_URL!,
      token: process.env.DIRECTUS_TEST_TOKEN!,
      prefix,
      seed: false,
      dryRun: false,
      features: createCoreOnlyFeatures(),
    };
    await provision(config);
    const result2 = await provision(config);
    expect(result2.collectionsCreated).toHaveLength(0);
    expect(result2.collectionsSkipped.length).toBeGreaterThan(0);
  });
});
