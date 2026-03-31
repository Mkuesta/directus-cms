import type { ProvisionConfig, FieldDef, RelationDef } from './types.js';

async function request(
  config: ProvisionConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${config.url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Some endpoints return empty body
  }

  return { ok: res.ok, status: res.status, data };
}

export async function testConnection(config: ProvisionConfig): Promise<boolean> {
  try {
    const res = await request(config, 'GET', '/server/info');
    if (!res.ok) {
      console.error(`Connection failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`Connection failed: ${err.message}`);
    return false;
  }
}

export async function getExistingCollections(config: ProvisionConfig): Promise<Set<string>> {
  const res = await request(config, 'GET', '/collections');
  if (!res.ok) return new Set();
  const collections = res.data?.data || [];
  return new Set(collections.map((c: any) => c.collection));
}

export async function createCollectionFolder(
  config: ProvisionConfig,
  folder: string,
  group?: string,
  icon?: string,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create folder: ${folder}${group ? ` (in ${group})` : ''}`);
    return { created: true };
  }

  const body: any = {
    collection: folder,
    meta: {
      collection: folder,
      icon: icon || 'folder',
      note: null,
      hidden: false,
      singleton: false,
      translations: null,
      group: group || null,
    },
    schema: null,
  };

  const res = await request(config, 'POST', '/collections', body);
  if (res.ok) return { created: true };
  if (res.status === 409) return { created: false };
  return { created: false, error: `${res.status}: ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}

export async function createCollection(
  config: ProvisionConfig,
  collection: string,
  singleton: boolean = false,
  hasSortField: boolean = false,
  hasStatusField: boolean = false,
  group?: string,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create collection: ${collection}${singleton ? ' (singleton)' : ''}${group ? ` (in ${group})` : ''}`);
    return { created: true };
  }

  const body: any = {
    collection,
    meta: {
      collection,
      icon: 'box',
      note: null,
      hidden: false,
      singleton,
      translations: null,
      archive_field: hasStatusField ? 'status' : null,
      archive_value: hasStatusField ? 'archived' : null,
      unarchive_value: hasStatusField ? 'draft' : null,
      sort_field: hasSortField ? 'sort' : null,
      group: group || null,
    },
    schema: {},
  };

  const res = await request(config, 'POST', '/collections', body);
  if (res.ok) return { created: true };
  if (res.status === 409) return { created: false };
  return { created: false, error: `${res.status}: ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}

export async function createField(
  config: ProvisionConfig,
  collection: string,
  field: FieldDef,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create field: ${collection}.${field.field} (${field.type})`);
    return { created: true };
  }

  const res = await request(config, 'POST', `/fields/${collection}`, field);
  if (res.ok) return { created: true };
  if (res.status === 409) return { created: false };
  return { created: false, error: `${collection}.${field.field}: ${res.status} - ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}

export async function createRelation(
  config: ProvisionConfig,
  relation: RelationDef,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create relation: ${relation.collection}.${relation.field} -> ${relation.related_collection}`);
    return { created: true };
  }

  const res = await request(config, 'POST', '/relations', relation);
  if (res.ok) return { created: true };
  if (res.status === 409) return { created: false };
  return { created: false, error: `${relation.collection}.${relation.field}: ${res.status} - ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}

export async function createPermission(
  config: ProvisionConfig,
  permission: Record<string, any>,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create permission: ${permission.collection} (${permission.action})`);
    return { created: true };
  }

  const res = await request(config, 'POST', '/permissions', permission);
  if (res.ok) return { created: true };
  if (res.status === 409) return { created: false };
  return { created: false, error: `permission ${permission.collection}: ${res.status} - ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}

export async function createItem(
  config: ProvisionConfig,
  collection: string,
  data: Record<string, any>,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would seed item in: ${collection}`);
    return { created: true };
  }

  const res = await request(config, 'POST', `/items/${collection}`, data);
  if (res.ok) return { created: true };
  return { created: false, error: `seed ${collection}: ${res.status} - ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}

export async function updateSingleton(
  config: ProvisionConfig,
  collection: string,
  data: Record<string, any>,
): Promise<{ created: boolean; error?: string }> {
  if (config.dryRun) {
    console.log(`  [dry-run] Would seed singleton: ${collection}`);
    return { created: true };
  }

  const res = await request(config, 'PATCH', `/items/${collection}`, data);
  if (res.ok) return { created: true };
  return { created: false, error: `seed ${collection}: ${res.status} - ${JSON.stringify(res.data?.errors?.[0]?.message || res.data)}` };
}
