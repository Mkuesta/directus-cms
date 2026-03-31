import { readItems } from '@directus/sdk';
import type { MediaConfig, DirectusGallery, DirectusGalleryItem, Gallery, GalleryImage } from './types';
import { getImageUrl } from './images';

function transformGalleryImage(config: MediaConfig, raw: DirectusGalleryItem): GalleryImage {
  return {
    id: raw.id,
    url: getImageUrl(config, raw.image.id),
    title: raw.title ?? raw.image.title,
    description: raw.description ?? raw.image.description,
    width: raw.image.width,
    height: raw.image.height,
    sort: raw.sort ?? 0,
  };
}

async function fetchGalleryItems(config: MediaConfig, galleryId: number): Promise<GalleryImage[]> {
  if (!config.collections.galleryItems) return [];

  const items = await config.directus.request(
    readItems(config.collections.galleryItems as any, {
      fields: [
        'id',
        { image: ['id', 'width', 'height', 'title', 'description'] },
        'title',
        'description',
        'sort',
        'gallery',
      ],
      filter: { gallery: { _eq: galleryId } },
      sort: ['sort', 'id'],
      limit: -1,
    } as any)
  ) as unknown as DirectusGalleryItem[];

  return items.map((item) => transformGalleryImage(config, item));
}

export async function getGallery(config: MediaConfig, slug: string): Promise<Gallery | null> {
  if (!config.collections.galleries) return null;

  const filter: Record<string, any> = {
    status: { _eq: 'published' },
    slug: { _eq: slug },
  };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.galleries as any, {
      fields: ['id', 'title', 'slug', 'description', 'status'],
      filter,
      limit: 1,
    } as any)
  ) as unknown as DirectusGallery[];

  if (!items.length) return null;
  const raw = items[0];
  const images = await fetchGalleryItems(config, raw.id);

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    images,
  };
}

export async function getGalleries(config: MediaConfig): Promise<Gallery[]> {
  if (!config.collections.galleries) return [];

  const filter: Record<string, any> = { status: { _eq: 'published' } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const rawGalleries = await config.directus.request(
    readItems(config.collections.galleries as any, {
      fields: ['id', 'title', 'slug', 'description', 'status'],
      filter,
      sort: ['title'],
      limit: -1,
    } as any)
  ) as unknown as DirectusGallery[];

  const galleries: Gallery[] = [];
  for (const raw of rawGalleries) {
    const images = await fetchGalleryItems(config, raw.id);
    galleries.push({
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      images,
    });
  }

  return galleries;
}
