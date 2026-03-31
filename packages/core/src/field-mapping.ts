// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Maps logical field names (what the package expects) to actual Directus
 * field names (what the instance uses).
 *
 * Key   = package-expected name (e.g. "title")
 * Value = actual Directus field name (e.g. "name")
 *
 * Fields not listed are assumed to match (identity mapping).
 */
export type FieldMapping = Record<string, string>;

/**
 * Per-collection field mappings.
 * Key = logical collection name (e.g. "posts", "products", "categories")
 */
export type CollectionFieldMappings = Record<string, FieldMapping>;

// ── Utilities ──────────────────────────────────────────────────────────────

/**
 * Remap a Directus query field list.
 * Replaces logical field names with actual Directus field names.
 * Handles dotted relation paths ('category.name') by remapping only the root.
 * Wildcards ('*') pass through unchanged.
 */
export function remapFields(
  fields: readonly string[],
  mapping: FieldMapping | undefined,
): string[] {
  if (!mapping) return [...fields];
  return fields.map((f) => {
    if (f === '*') return f;
    const dot = f.indexOf('.');
    if (dot > 0) {
      const root = f.slice(0, dot);
      const rest = f.slice(dot);
      return (mapping[root] ?? root) + rest;
    }
    return mapping[f] ?? f;
  });
}

/**
 * Remap a raw Directus item so its keys match what the package transform expects.
 * Returns a new object (does not mutate the input).
 *
 * mapping: { packageField: 'directusField' }
 * The function inverts the map: for { title: 'name' }, reads item['name']
 * and writes result['title'].
 *
 * Fields present on the item that are NOT in the mapping and not in
 * knownFields are collected into result.__extras.
 */
export function remapItem<T extends Record<string, any>>(
  item: T,
  mapping: FieldMapping | undefined,
  knownFields?: ReadonlySet<string>,
): T & { __extras?: Record<string, unknown> } {
  if (!mapping) {
    if (!knownFields) return item;
    return collectExtras(item, knownFields);
  }

  // Build inverse map: directusField -> packageField
  const inverse = new Map<string, string>();
  for (const [packageField, directusField] of Object.entries(mapping)) {
    inverse.set(directusField, packageField);
  }

  const result: Record<string, any> = {};
  const extras: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(item)) {
    if (inverse.has(key)) {
      result[inverse.get(key)!] = value;
    } else if (knownFields && !knownFields.has(key)) {
      extras[key] = value;
    } else {
      result[key] = value;
    }
  }

  if (Object.keys(extras).length > 0) {
    result.__extras = extras;
  }

  return result as T & { __extras?: Record<string, unknown> };
}

/**
 * Remap filter/sort keys that reference Directus field names.
 */
export function remapFilter(
  filter: Record<string, any>,
  mapping: FieldMapping | undefined,
): Record<string, any> {
  if (!mapping) return filter;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(filter)) {
    if (key === '_and' || key === '_or') {
      result[key] = Array.isArray(value)
        ? value.map((v: Record<string, any>) => remapFilter(v, mapping))
        : value;
    } else {
      result[mapping[key] ?? key] = value;
    }
  }
  return result;
}

/**
 * Remap sort field names (handles '-' prefix for descending).
 */
export function remapSort(
  sort: readonly string[],
  mapping: FieldMapping | undefined,
): string[] {
  if (!mapping) return [...sort];
  return sort.map((s) => {
    const desc = s.startsWith('-');
    const field = desc ? s.slice(1) : s;
    const remapped = mapping[field] ?? field;
    return desc ? `-${remapped}` : remapped;
  });
}

// ── Internal ───────────────────────────────────────────────────────────────

function collectExtras<T extends Record<string, any>>(
  item: T,
  knownFields: ReadonlySet<string>,
): T & { __extras?: Record<string, unknown> } {
  const extras: Record<string, unknown> = {};
  for (const key of Object.keys(item)) {
    if (!knownFields.has(key)) {
      extras[key] = item[key];
    }
  }
  if (Object.keys(extras).length > 0) {
    return { ...item, __extras: extras } as any;
  }
  return item;
}
