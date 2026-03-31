import type { RedirectConfig, RedirectClient } from './types';
import { getRedirects, matchRedirect, clearCache } from './redirects';

export function createRedirectClient(config: RedirectConfig): RedirectClient {
  return {
    config,
    getRedirects: () => getRedirects(config),
    matchRedirect: (pathname) => matchRedirect(config, pathname),
    clearCache: () => clearCache(config),
  };
}

export type {
  RedirectConfig,
  RedirectCollections,
  RedirectClient,
  DirectusRedirect,
  Redirect,
  RedirectMatch,
} from './types';

export { getRedirects, matchRedirect, clearCache } from './redirects';
