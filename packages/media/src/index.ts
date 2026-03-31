import type { MediaConfig, MediaClient } from './types';
import { getImageUrl, getSrcSet, getResponsiveImage, getBlurDataUrl, getNextImageProps, createDirectusLoader } from './images';
import { getGallery, getGalleries } from './galleries';

export function createMediaClient(config: MediaConfig): MediaClient {
  return {
    config,
    getImageUrl: (fileId, transform) => getImageUrl(config, fileId, transform),
    getSrcSet: (fileId, widths, options) => getSrcSet(config, fileId, widths, options),
    getResponsiveImage: (fileId, options) => getResponsiveImage(config, fileId, options),
    getBlurDataUrl: (fileId) => getBlurDataUrl(config, fileId),
    getGallery: (slug) => getGallery(config, slug),
    getGalleries: () => getGalleries(config),
    getNextImageProps: (fileId, options) => getNextImageProps(config, fileId, options),
    createDirectusLoader: () => createDirectusLoader(config.directusUrl),
  };
}

export type {
  MediaConfig,
  MediaCollections,
  MediaClient,
  ImageTransform,
  SrcSetEntry,
  ResponsiveImage,
  NextImageProps,
  DirectusGallery,
  DirectusGalleryItem,
  Gallery,
  GalleryImage,
} from './types';

export { getImageUrl, getSrcSet, getResponsiveImage, getBlurDataUrl, getNextImageProps, createDirectusLoader } from './images';
export { getGallery, getGalleries } from './galleries';
