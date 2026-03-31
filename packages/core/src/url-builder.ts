import type { CmsConfig, CmsUrlBuilders } from './types';

// ── Config-based resolvers (used by metadata functions) ─────────────────────

export function resolvePostPath(config: CmsConfig, slug: string, categorySlug?: string): string {
  if (config.urls?.post) return config.urls.post(slug, categorySlug);
  return categorySlug ? `/${config.route}/${categorySlug}/${slug}` : `/${config.route}/${slug}`;
}

export function resolveCategoryPath(config: CmsConfig, categorySlug: string): string | null {
  if (config.urls?.category) return config.urls.category(categorySlug);
  return `/${config.route}/${categorySlug}`;
}

export function resolveIndexPath(config: CmsConfig): string {
  if (config.urls?.index) return config.urls.index();
  return `/${config.route}`;
}

// ── Builders-based resolvers (used by components that receive props) ────────

export function resolvePostPathFromBuilders(
  urls: CmsUrlBuilders | undefined,
  route: string,
  slug: string,
  categorySlug?: string,
): string {
  if (urls?.post) return urls.post(slug, categorySlug);
  return categorySlug ? `/${route}/${categorySlug}/${slug}` : `/${route}/${slug}`;
}

export function resolveCategoryPathFromBuilders(
  urls: CmsUrlBuilders | undefined,
  route: string,
  categorySlug: string,
): string | null {
  if (urls?.category) return urls.category(categorySlug);
  return `/${route}/${categorySlug}`;
}

export function resolveIndexPathFromBuilders(
  urls: CmsUrlBuilders | undefined,
  route: string,
): string {
  if (urls?.index) return urls.index();
  return `/${route}`;
}
