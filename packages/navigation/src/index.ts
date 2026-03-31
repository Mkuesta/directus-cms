import type { NavigationConfig, NavigationClient } from './types';
import { getMenu, getMenus } from './menus';

/**
 * Creates a navigation client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const nav = createNavigationClient({ directus, collections: { items: 'navigation_items' }, ... });
 *   const header = await nav.getHeaderMenu();
 */
export function createNavigationClient(config: NavigationConfig): NavigationClient {
  return {
    config,
    getMenu: (slug) => getMenu(config, slug),
    getMenus: () => getMenus(config),
    getHeaderMenu: () => getMenu(config, 'header'),
    getFooterMenu: () => getMenu(config, 'footer'),
  };
}

// Re-export all types
export type {
  NavigationConfig,
  NavigationCollections,
  NavigationClient,
  DirectusNavigationItem,
  MenuItem,
} from './types';

// Re-export standalone functions
export { getMenu, getMenus } from './menus';
