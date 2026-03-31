import { readItems } from '@directus/sdk';
import type { RedirectConfig, DirectusRedirect, Redirect, RedirectMatch } from './types';

const _cache = new WeakMap<object, { data: Redirect[]; expires: number }>();

function transform(raw: DirectusRedirect): Redirect {
  return {
    id: raw.id,
    source: raw.source,
    destination: raw.destination,
    statusCode: raw.status_code,
    isRegex: raw.is_regex,
  };
}

export async function getRedirects(config: RedirectConfig): Promise<Redirect[]> {
  const cached = _cache.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;

  const filter: Record<string, any> = { active: { _eq: true } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.redirects as any, {
      fields: ['id', 'source', 'destination', 'status_code', 'is_regex', 'active', 'site', 'sort'],
      filter,
      sort: ['sort', 'id'],
      limit: -1,
    } as any)
  ) as unknown as DirectusRedirect[];

  const redirects = items.map(transform);
  const ttl = config.cacheTtl ?? 60_000;
  _cache.set(config.directus, { data: redirects, expires: Date.now() + ttl });

  return redirects;
}

export async function matchRedirect(
  config: RedirectConfig,
  pathname: string,
): Promise<RedirectMatch | null> {
  const redirects = await getRedirects(config);

  for (const redirect of redirects) {
    if (redirect.isRegex) {
      try {
        // SECURITY: Validate regex source — reject overly complex patterns
        if (redirect.source.length > 200) {
          console.warn(`[redirects] Regex source too long (${redirect.source.length} chars), skipping`);
          continue;
        }
        // Reject patterns known to cause catastrophic backtracking
        if (/(\([^)]*[+*][^)]*\))[+*]/.test(redirect.source)) {
          console.warn(`[redirects] Potentially unsafe regex pattern detected, skipping: "${redirect.source}"`);
          continue;
        }
        const regex = new RegExp(`^${redirect.source}$`);
        const match = pathname.match(regex);
        if (match) {
          // Support capture group replacements ($1, $2, etc.)
          let destination = redirect.destination;
          for (let i = 1; i < match.length; i++) {
            destination = destination.replace(`$${i}`, match[i] ?? '');
          }
          return { destination, statusCode: redirect.statusCode };
        }
      } catch {
        // Invalid regex, skip
      }
    } else {
      if (pathname === redirect.source) {
        return { destination: redirect.destination, statusCode: redirect.statusCode };
      }
    }
  }

  return null;
}

export function clearCache(config: RedirectConfig): void {
  _cache.delete(config.directus);
}
