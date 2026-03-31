import type { RestClient } from '@directus/sdk';

export interface MediaCollections {
  /** Directus collection for galleries (optional) */
  galleries?: string;
  /** Directus collection for gallery items (optional) */
  galleryItems?: string;
}

export interface MediaConfig {
  directus: RestClient<any>;
  collections: MediaCollections;
  directusUrl: string;
  siteId?: number;
}

export interface ImageTransform {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'avif' | 'auto';
}

export interface SrcSetEntry {
  url: string;
  width: number;
  descriptor: string;
}

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  sizes?: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
}

export interface DirectusGallery {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status: 'published' | 'draft';
  site?: number | null;
}

export interface DirectusGalleryItem {
  id: number;
  gallery: number;
  image: { id: string; width?: number; height?: number; title?: string; description?: string };
  title?: string;
  description?: string;
  sort?: number;
}

export interface GalleryImage {
  id: number;
  url: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  sort: number;
}

export interface Gallery {
  id: number;
  title: string;
  slug: string;
  description?: string;
  images: GalleryImage[];
}

export interface NextImageProps {
  src: string;
  width?: number;
  height?: number;
  blurDataURL: string;
  placeholder: 'blur';
  alt: string;
}

export interface MediaClient {
  config: MediaConfig;
  /** Build a Directus asset URL with transforms */
  getImageUrl(fileId: string, transform?: ImageTransform): string;
  /** Generate srcSet entries for responsive images */
  getSrcSet(fileId: string, widths?: number[], options?: Omit<ImageTransform, 'width'>): SrcSetEntry[];
  /** Get a full responsive image object (src, srcSet, sizes) */
  getResponsiveImage(fileId: string, options?: {
    widths?: number[];
    sizes?: string;
    defaultWidth?: number;
    transform?: Omit<ImageTransform, 'width'>;
  }): ResponsiveImage;
  /** Get a tiny blur placeholder URL (20px wide, low quality) */
  getBlurDataUrl(fileId: string): string;
  /** Get a gallery by slug (requires gallery collections) */
  getGallery(slug: string): Promise<Gallery | null>;
  /** Get all galleries (requires gallery collections) */
  getGalleries(): Promise<Gallery[]>;
  /** Get props ready to spread onto Next.js <Image> */
  getNextImageProps(fileId: string, options?: { alt?: string; width?: number; height?: number; quality?: number }): NextImageProps;
  /** Create a Next.js image loader function for next.config.js */
  createDirectusLoader(): (p: { src: string; width: number; quality?: number }) => string;
}
