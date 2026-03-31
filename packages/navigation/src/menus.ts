import { readItems } from '@directus/sdk';
import type { NavigationConfig, DirectusNavigationItem, MenuItem } from './types';

// Cache keyed by directus client identity
const _menuCaches = new WeakMap<object, { data: DirectusNavigationItem[]; expires: number }>();
const CACHE_TTL = 60_000; // 60 seconds

async function fetchAllItems(config: NavigationConfig): Promise<DirectusNavigationItem[]> {
  const cached = _menuCaches.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;

  const filter: Record<string, any> = { status: { _eq: 'published' } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.items as any, {
      fields: [
        'id',
        'label',
        'path',
        'url',
        'type',
        'target',
        'menu',
        'parent_id',
        'sort',
        'status',
        'icon',
        'css_class',
        'site',
      ],
      filter,
      sort: ['sort', 'id'],
      limit: -1,
    } as any)
  ) as unknown as DirectusNavigationItem[];

  _menuCaches.set(config.directus, { data: items, expires: Date.now() + CACHE_TTL });
  return items;
}

function transformItem(raw: DirectusNavigationItem): MenuItem {
  const external = raw.type === 'external';
  return {
    id: raw.id,
    label: raw.label,
    url: external ? (raw.url ?? '') : (raw.path ?? '/'),
    external,
    target: raw.target ?? (external ? '_blank' : '_self'),
    children: [],
    sort: raw.sort ?? 0,
    icon: raw.icon,
    cssClass: raw.css_class,
  };
}

function buildTree(items: DirectusNavigationItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];

  // First pass: transform all items
  for (const raw of items) {
    map.set(raw.id, transformItem(raw));
  }

  // Second pass: build parent-child relationships
  for (const raw of items) {
    const item = map.get(raw.id)!;
    if (raw.parent_id != null && map.has(raw.parent_id)) {
      map.get(raw.parent_id)!.children.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

export async function getMenu(config: NavigationConfig, slug: string): Promise<MenuItem[]> {
  const all = await fetchAllItems(config);
  const filtered = all.filter((item) => item.menu === slug);
  return buildTree(filtered);
}

export async function getMenus(config: NavigationConfig): Promise<Record<string, MenuItem[]>> {
  const all = await fetchAllItems(config);

  // Group by menu slug
  const groups = new Map<string, DirectusNavigationItem[]>();
  for (const item of all) {
    const slug = item.menu;
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug)!.push(item);
  }

  // Build trees per group
  const result: Record<string, MenuItem[]> = {};
  for (const [slug, items] of groups) {
    result[slug] = buildTree(items);
  }
  return result;
}
