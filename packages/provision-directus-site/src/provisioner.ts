import type { ProvisionConfig, ProvisionResult, CollectionSchema, CollectionGroup } from './types.js';
import {
  testConnection,
  getExistingCollections,
  createCollectionFolder,
  createCollection,
  createField,
  createRelation,
} from './directus-api.js';
import { setupPermissions } from './permissions.js';
import { getSchemas } from './schemas/index.js';
import { seedCore } from './seed/core-seed.js';
import { seedProducts } from './seed/products-seed.js';

const SUBFOLDER_DEFS: { suffix: string; icon: string; group: CollectionGroup }[] = [
  { suffix: 'content', icon: 'edit_note', group: 'content' },
  { suffix: 'config', icon: 'settings', group: 'config' },
  { suffix: 'data', icon: 'database', group: 'data' },
];

export async function provision(config: ProvisionConfig): Promise<ProvisionResult> {
  const result: ProvisionResult = {
    collectionsCreated: [],
    collectionsSkipped: [],
    fieldsCreated: 0,
    fieldsSkipped: 0,
    relationsCreated: 0,
    relationsSkipped: 0,
    permissionsCreated: 0,
    itemsSeeded: 0,
    errors: [],
  };

  // Phase 0: Connection test
  if (!config.dryRun) {
    console.log('\n--- Phase 0: Connection test ---');
    const connected = await testConnection(config);
    if (!connected) {
      result.errors.push('Failed to connect to Directus');
      return result;
    }
    console.log('  Connected to Directus');
  }

  // Get schemas based on feature flags
  const schemas = getSchemas(config.prefix, config.features);
  console.log(`  ${schemas.length} collections to provision`);

  // Get existing collections to skip
  const existing = config.dryRun ? new Set<string>() : await getExistingCollections(config);

  // Phase 1: Create folder + collections
  console.log('\n--- Phase 1: Collections ---');

  // Create the parent folder (virtual collection) to group all collections under the prefix
  const folder = config.prefix;
  if (!existing.has(folder)) {
    const folderRes = await createCollectionFolder(config, folder);
    if (folderRes.created) {
      console.log(`  Created folder: ${folder}`);
    } else if (folderRes.error) {
      console.error(`  Error creating folder: ${folderRes.error}`);
      result.errors.push(folderRes.error);
    } else {
      console.log(`  Skipped (exists): ${folder}`);
    }
  } else {
    console.log(`  Skipped (exists): ${folder}`);
  }

  // Create subfolder collections (content, config, data) under the parent folder
  const subfolderMap: Record<CollectionGroup, string> = {
    content: `${folder}_content`,
    config: `${folder}_config`,
    data: `${folder}_data`,
  };

  for (const def of SUBFOLDER_DEFS) {
    const subfolderName = subfolderMap[def.group];
    if (!existing.has(subfolderName)) {
      const subRes = await createCollectionFolder(config, subfolderName, folder, def.icon);
      if (subRes.created) {
        console.log(`  Created subfolder: ${subfolderName}`);
      } else if (subRes.error) {
        console.error(`  Error creating subfolder: ${subRes.error}`);
        result.errors.push(subRes.error);
      } else {
        console.log(`  Skipped (exists): ${subfolderName}`);
      }
    } else {
      console.log(`  Skipped (exists): ${subfolderName}`);
    }
  }

  for (const schema of schemas) {
    if (existing.has(schema.collection)) {
      console.log(`  Skipped (exists): ${schema.collection}`);
      result.collectionsSkipped.push(schema.collection);
      continue;
    }

    const hasSortField = schema.fields.some((f) => f.field === 'sort');
    const hasStatusField = schema.fields.some((f) => f.field === 'status');
    // Place collection in its subfolder (default to content)
    const collectionGroup = subfolderMap[schema.group || 'content'];
    const res = await createCollection(config, schema.collection, schema.singleton, hasSortField, hasStatusField, collectionGroup);
    if (res.created) {
      console.log(`  Created: ${schema.collection}${schema.singleton ? ' (singleton)' : ''} (in ${collectionGroup})`);
      result.collectionsCreated.push(schema.collection);
    } else if (res.error) {
      console.error(`  Error: ${res.error}`);
      result.errors.push(res.error);
    } else {
      console.log(`  Skipped (exists): ${schema.collection}`);
      result.collectionsSkipped.push(schema.collection);
    }
  }

  // Phase 2: Create fields (non-relational first)
  console.log('\n--- Phase 2: Fields ---');
  for (const schema of schemas) {
    for (const field of schema.fields) {
      const res = await createField(config, schema.collection, field);
      if (res.created) {
        result.fieldsCreated++;
      } else if (res.error) {
        console.error(`  Error: ${res.error}`);
        result.errors.push(res.error);
      } else {
        result.fieldsSkipped++;
      }
    }
    console.log(`  ${schema.collection}: ${schema.fields.length} fields processed`);
  }

  // Phase 3: Create relations
  console.log('\n--- Phase 3: Relations ---');
  for (const schema of schemas) {
    if (!schema.relations?.length) continue;
    for (const relation of schema.relations) {
      const res = await createRelation(config, relation);
      if (res.created) {
        result.relationsCreated++;
        console.log(`  ${relation.collection}.${relation.field} -> ${relation.related_collection}`);
      } else if (res.error) {
        console.error(`  Error: ${res.error}`);
        result.errors.push(res.error);
      } else {
        result.relationsSkipped++;
      }
    }
  }

  // Phase 4: Permissions
  console.log('\n--- Phase 4: Permissions ---');
  const permResult = await setupPermissions(config, schemas);
  result.permissionsCreated = permResult.created;
  result.errors.push(...permResult.errors);
  console.log(`  ${permResult.created} permissions created`);

  // Phase 5: Seed (optional)
  if (config.seed) {
    console.log('\n--- Phase 5: Seed data ---');
    const coreSeeded = await seedCore(config);
    result.itemsSeeded += coreSeeded.count;
    result.errors.push(...coreSeeded.errors);

    if (config.features.includeProducts) {
      const prodSeeded = await seedProducts(config);
      result.itemsSeeded += prodSeeded.count;
      result.errors.push(...prodSeeded.errors);
    }

    console.log(`  ${result.itemsSeeded} items seeded`);
  }

  return result;
}
