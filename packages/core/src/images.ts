import type { CmsConfig, ImageTransformOptions } from './types';

export const IMAGE_PRESETS = {
  ogImage: { width: 1200, height: 630, fit: 'cover' as const, quality: 80, format: 'jpg' as const },
  articleImage: { width: 1200, fit: 'inside' as const, quality: 80 },
  logo: { width: 512, height: 512, fit: 'contain' as const, quality: 90, format: 'png' as const },
  thumbnail: { width: 300, height: 300, fit: 'cover' as const, quality: 75, format: 'webp' as const },
} as const;

/**
 * Get a simple Directus asset URL (no transforms)
 */
export function getDirectusAssetUrl(config: CmsConfig, fileId: string | undefined | null): string | undefined {
  if (!fileId) return undefined;
  return `${config.directusUrl}/assets/${fileId}`;
}

/**
 * Get a Directus image URL with optional width/height/fit/quality/format transforms
 */
export function getDirectusImageUrl(
  config: CmsConfig,
  fileId: string | undefined | null,
  options?: ImageTransformOptions,
): string | undefined {
  if (!fileId) return undefined;

  const base = `${config.directusUrl}/assets/${fileId}`;
  if (!options) return base;

  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.fit) params.set('fit', options.fit);
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Convert a relative or protocol-relative asset path to an absolute HTTPS URL
 */
export function toAbsoluteAssetUrl(config: CmsConfig, path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('https://') || path.startsWith('http://')) return path;
  if (path.startsWith('//')) return `https:${path}`;

  return path.startsWith('/') ? `${config.baseUrl}${path}` : `${config.baseUrl}/${path}`;
}
