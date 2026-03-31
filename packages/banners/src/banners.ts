import { readItems } from '@directus/sdk';
import type { BannerConfig, DirectusBanner, Banner } from './types';

const _cache = new WeakMap<object, { data: Banner[]; expires: number }>();
const CACHE_TTL = 60_000;

function transform(raw: DirectusBanner): Banner {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    content: raw.content,
    type: raw.type,
    position: raw.position,
    linkUrl: raw.link_url,
    linkText: raw.link_text,
    backgroundColor: raw.background_color,
    textColor: raw.text_color,
    dismissible: raw.dismissible,
    startDate: raw.start_date,
    endDate: raw.end_date,
    targetPages: raw.target_pages,
    sort: raw.sort ?? 0,
  };
}

function isActive(banner: Banner): boolean {
  const now = new Date();
  if (banner.startDate && new Date(banner.startDate) > now) return false;
  if (banner.endDate && new Date(banner.endDate) < now) return false;
  return true;
}

async function fetchBanners(config: BannerConfig): Promise<Banner[]> {
  const cached = _cache.get(config.directus);
  if (cached && cached.expires > Date.now()) return cached.data;

  const filter: Record<string, any> = { status: { _eq: 'published' } };
  if (config.siteId != null) {
    filter.site = { _eq: config.siteId };
  }

  const items = await config.directus.request(
    readItems(config.collections.banners as any, {
      fields: [
        'id', 'title', 'slug', 'content', 'type', 'position',
        'link_url', 'link_text', 'background_color', 'text_color',
        'dismissible', 'start_date', 'end_date', 'target_pages',
        'status', 'sort', 'site',
      ],
      filter,
      sort: ['sort', 'id'],
      limit: -1,
    } as any)
  ) as unknown as DirectusBanner[];

  const banners = items.map(transform);
  _cache.set(config.directus, { data: banners, expires: Date.now() + CACHE_TTL });
  return banners;
}

export async function getActiveBanners(config: BannerConfig): Promise<Banner[]> {
  const banners = await fetchBanners(config);
  return banners.filter(isActive);
}

export async function getBannersForPage(config: BannerConfig, pathname: string): Promise<Banner[]> {
  const active = await getActiveBanners(config);
  return active.filter((banner) => {
    // No target pages = show everywhere
    if (!banner.targetPages || banner.targetPages.length === 0) return true;
    return banner.targetPages.some((pattern) => {
      if (pattern === '*') return true;
      if (pattern.endsWith('*')) {
        return pathname.startsWith(pattern.slice(0, -1));
      }
      return pathname === pattern;
    });
  });
}

export async function getBanner(config: BannerConfig, slug: string): Promise<Banner | null> {
  const banners = await fetchBanners(config);
  return banners.find((b) => b.slug === slug && isActive(b)) ?? null;
}
