# @directus-cms/navigation

Dynamic navigation menus from Directus for Next.js sites. Fetches menu items from a single Directus collection, builds nested trees from flat parent/child references, and supports multiple menu locations (header, footer, sidebar, etc.) with multi-tenancy.

Data only — no UI components or styling.

## Prerequisites

- A Directus instance with a navigation items collection set up
- `@directus/sdk` installed in your site

## Installation

```bash
npm install ../../directus-cms-navigation --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/navigation": "file:../../directus-cms-navigation"
  }
}
```

## Setup

### 1. Directus Collection

Create a `navigation_items` collection (or `{prefix}_navigation_items`) in Directus with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `label` | String | Display text |
| `path` | String | Internal route (e.g. `/about`, `/blog`) |
| `url` | String | External URL (e.g. `https://example.com`) |
| `type` | Dropdown | `internal` or `external` |
| `target` | Dropdown | `_self` or `_blank` |
| `menu` | String | Menu location: `"header"`, `"footer"`, `"sidebar"`, etc. |
| `parent_id` | M2O (self) | Parent item for nesting (self-referencing) |
| `sort` | Integer | Sort order |
| `status` | Dropdown | `published` or `draft` |
| `icon` | String | Optional icon name (e.g. for icon libraries) |
| `css_class` | String | Optional CSS class for custom styling |
| `site` | Integer | Optional multi-tenant site ID |

### 2. Navigation Config

Create `lib/navigation.ts` in your site:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createNavigationClient } from '@directus-cms/navigation';

const COLLECTION_PREFIX = 'stopabo_de';

export const nav = createNavigationClient({
  directus: createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest()),
  collections: {
    items: `${COLLECTION_PREFIX}_navigation_items`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  siteId: 4, // optional, for multi-tenancy
});
```

## Usage

### Get a Specific Menu

```ts
const headerItems = await nav.getMenu('header');
// → [
//   { id: 1, label: 'Home', url: '/', external: false, target: '_self', children: [] },
//   { id: 2, label: 'Products', url: '/products', external: false, target: '_self', children: [
//     { id: 3, label: 'Templates', url: '/products/templates', ... },
//     { id: 4, label: 'Tools', url: '/products/tools', ... },
//   ]},
//   { id: 5, label: 'Blog', url: '/blog', external: false, target: '_self', children: [] },
// ]
```

### Shorthand Methods

```ts
const header = await nav.getHeaderMenu();  // same as nav.getMenu('header')
const footer = await nav.getFooterMenu();  // same as nav.getMenu('footer')
```

### Get All Menus at Once

```ts
const menus = await nav.getMenus();
// → {
//   header: [{ label: 'Home', ... }, ...],
//   footer: [{ label: 'Privacy', ... }, ...],
//   sidebar: [{ label: 'Dashboard', ... }, ...],
// }
```

### Rendering Example

The package returns data only. Render it however you want:

```tsx
// components/Header.tsx
import { nav } from '@/lib/navigation';

export async function Header() {
  const items = await nav.getHeaderMenu();

  return (
    <nav>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target={item.target}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className={item.cssClass}
            >
              {item.icon && <span className={`icon-${item.icon}`} />}
              {item.label}
            </a>
            {item.children.length > 0 && (
              <ul>
                {item.children.map((child) => (
                  <li key={child.id}>
                    <a href={child.url} target={child.target}>
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Caching

All items are fetched once and cached for 60 seconds using a WeakMap keyed by the Directus client instance. Calling `getMenu('header')` and `getMenu('footer')` in the same request only fetches from Directus once.

## Multi-Tenancy

When `siteId` is set, only items matching that site ID are returned. This allows multiple sites to share a single Directus instance with separate navigation.

## API Reference

### `createNavigationClient(config: NavigationConfig): NavigationClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `getMenu(slug)` | `Promise<MenuItem[]>` | Get nested menu items by location slug |
| `getMenus()` | `Promise<Record<string, MenuItem[]>>` | All menus grouped by location |
| `getHeaderMenu()` | `Promise<MenuItem[]>` | Shorthand for `getMenu('header')` |
| `getFooterMenu()` | `Promise<MenuItem[]>` | Shorthand for `getMenu('footer')` |

### `MenuItem`

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Item ID |
| `label` | `string` | Display text |
| `url` | `string` | Resolved URL (internal path or external URL) |
| `external` | `boolean` | Whether this is an external link |
| `target` | `'_self' \| '_blank'` | Link target |
| `children` | `MenuItem[]` | Nested child items |
| `sort` | `number` | Sort order |
| `icon` | `string \| undefined` | Optional icon name |
| `cssClass` | `string \| undefined` | Optional CSS class |

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl`, `resiliax_fr` |
| `collections.items` | `"stopabo_de_navigation_items"` |
| `siteId` | `4`, `7` (or omit for single-tenant) |
