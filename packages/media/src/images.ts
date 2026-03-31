import type { MediaConfig, ImageTransform, SrcSetEntry, ResponsiveImage, NextImageProps } from './types';

const DEFAULT_WIDTHS = [320, 640, 768, 1024, 1280, 1536, 1920];

function buildTransformParams(transform: ImageTransform): string {
  const params = new URLSearchParams();
  if (transform.width) params.set('width', String(transform.width));
  if (transform.height) params.set('height', String(transform.height));
  if (transform.fit) params.set('fit', transform.fit);
  if (transform.quality) params.set('quality', String(transform.quality));
  if (transform.format) params.set('format', transform.format);
  const str = params.toString();
  return str ? `?${str}` : '';
}

export function getImageUrl(config: MediaConfig, fileId: string, transform?: ImageTransform): string {
  const base = `${config.directusUrl}/assets/${fileId}`;
  if (!transform) return base;
  return `${base}${buildTransformParams(transform)}`;
}

export function getSrcSet(
  config: MediaConfig,
  fileId: string,
  widths?: number[],
  options?: Omit<ImageTransform, 'width'>,
): SrcSetEntry[] {
  const sizes = widths ?? DEFAULT_WIDTHS;
  return sizes.map((width) => {
    const url = getImageUrl(config, fileId, { ...options, width });
    return { url, width, descriptor: `${width}w` };
  });
}

export function getResponsiveImage(
  config: MediaConfig,
  fileId: string,
  options?: {
    widths?: number[];
    sizes?: string;
    defaultWidth?: number;
    transform?: Omit<ImageTransform, 'width'>;
  },
): ResponsiveImage {
  const widths = options?.widths ?? DEFAULT_WIDTHS;
  const defaultWidth = options?.defaultWidth ?? 1024;
  const entries = getSrcSet(config, fileId, widths, options?.transform);

  return {
    src: getImageUrl(config, fileId, { ...options?.transform, width: defaultWidth }),
    srcSet: entries.map((e) => `${e.url} ${e.descriptor}`).join(', '),
    sizes: options?.sizes ?? '100vw',
    blurDataUrl: getBlurDataUrl(config, fileId),
  };
}

export function getBlurDataUrl(config: MediaConfig, fileId: string): string {
  return getImageUrl(config, fileId, {
    width: 20,
    quality: 20,
    format: 'webp',
    fit: 'cover',
  });
}

export function getNextImageProps(
  config: MediaConfig,
  fileId: string,
  options?: { alt?: string; width?: number; height?: number; quality?: number },
): NextImageProps {
  const result: NextImageProps = {
    src: getImageUrl(config, fileId, options?.quality ? { quality: options.quality } : undefined),
    blurDataURL: getBlurDataUrl(config, fileId),
    placeholder: 'blur',
    alt: options?.alt ?? '',
  };

  if (options?.width) result.width = options.width;
  if (options?.height) result.height = options.height;

  return result;
}

export function createDirectusLoader(
  directusUrl: string,
): (p: { src: string; width: number; quality?: number }) => string {
  return ({ src, width, quality }) =>
    `${directusUrl}/assets/${src}?width=${width}&quality=${quality || 75}`;
}
