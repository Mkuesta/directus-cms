import type { RestClient } from '@directus/sdk';

// ── NavigationConfig: passed to createNavigationClient() ─────────────────────

export interface NavigationCollections {
  /** Directus collection name for navigation items (e.g. "navigation_items") */
  items: string;
}

export interface NavigationConfig {
  /** A Directus SDK client instance (created with createDirectus().with(rest())) */
  directus: RestClient<any>;
  /** Maps logical collection names to prefixed Directus collection names */
  collections: NavigationCollections;
  /** URL of the Directus instance (e.g. "https://cms.drlogist.com") */
  directusUrl: string;
  /** Multi-tenant site ID for filtering (optional) */
  siteId?: number;
  /** Public base URL for resolving internal paths (optional) */
  baseUrl?: string;
}

// ── Directus raw types ───────────────────────────────────────────────────────

export interface DirectusNavigationItem {
  id: number;
  label: string;
  /** Internal route path (e.g. "/about", "/blog") */
  path?: string;
  /** External URL (e.g. "https://example.com") */
  url?: string;
  /** Link type */
  type: 'internal' | 'external';
  /** Link target */
  target?: '_self' | '_blank';
  /** Menu location identifier (e.g. "header", "footer", "sidebar") */
  menu: string;
  /** Parent item ID for nesting */
  parent_id?: number | null;
  /** Sort order */
  sort?: number;
  /** Publication status */
  status: 'published' | 'draft';
  /** Optional icon name */
  icon?: string;
  /** Optional CSS class */
  css_class?: string;
  /** Multi-tenant site ID */
  site?: number | null;
}

// ── Transformed types (used by consumers) ────────────────────────────────────

export interface MenuItem {
  id: number;
  label: string;
  /** Resolved URL — internal path or external URL */
  url: string;
  /** Whether this links externally */
  external: boolean;
  /** Link target */
  target: '_self' | '_blank';
  /** Nested children */
  children: MenuItem[];
  /** Sort order */
  sort: number;
  /** Optional icon name */
  icon?: string;
  /** Optional CSS class */
  cssClass?: string;
}

// ── NavigationClient: returned by createNavigationClient() ───────────────────

export interface NavigationClient {
  config: NavigationConfig;
  /** Get menu items by menu location slug (e.g. "header", "footer") */
  getMenu(slug: string): Promise<MenuItem[]>;
  /** Get all menus as a map of slug → items */
  getMenus(): Promise<Record<string, MenuItem[]>>;
  /** Shorthand for getMenu('header') */
  getHeaderMenu(): Promise<MenuItem[]>;
  /** Shorthand for getMenu('footer') */
  getFooterMenu(): Promise<MenuItem[]>;
}
