import type { RestClient } from '@directus/sdk';

export interface RedirectCollections {
  redirects: string;
}

export interface RedirectConfig {
  directus: RestClient<any>;
  collections: RedirectCollections;
  directusUrl: string;
  siteId?: number;
  /** Cache TTL in milliseconds (default 60000) */
  cacheTtl?: number;
}

export interface DirectusRedirect {
  id: number;
  source: string;
  destination: string;
  status_code: 301 | 302 | 307 | 308;
  is_regex: boolean;
  active: boolean;
  site?: number | null;
  sort?: number;
}

export interface Redirect {
  id: number;
  source: string;
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
  isRegex: boolean;
}

export interface RedirectMatch {
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
}

export interface RedirectClient {
  config: RedirectConfig;
  /** Get all active redirects */
  getRedirects(): Promise<Redirect[]>;
  /** Match a pathname against redirect rules, returns destination + status or null */
  matchRedirect(pathname: string): Promise<RedirectMatch | null>;
  /** Clear the redirect cache (e.g. after editing redirects in Directus) */
  clearCache(): void;
}
