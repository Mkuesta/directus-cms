import type { BreadcrumbItem } from './types.js';

/**
 * Build a breadcrumb trail from path segments.
 * Useful for creating breadcrumbs from URL paths.
 */
export function buildBreadcrumbs(
  baseUrl: string,
  segments: Array<{ label: string; path: string }>,
  includeHome: boolean = true,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  if (includeHome) {
    items.push({ name: 'Home', url: baseUrl });
  }

  let currentPath = '';
  for (const segment of segments) {
    currentPath += segment.path.startsWith('/') ? segment.path : `/${segment.path}`;
    items.push({ name: segment.label, url: `${baseUrl}${currentPath}` });
  }

  return items;
}
