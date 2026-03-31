import type { BannerConfig, BannerClient } from './types';
import { getActiveBanners, getBannersForPage, getBanner } from './banners';

export function createBannerClient(config: BannerConfig): BannerClient {
  return {
    config,
    getActiveBanners: () => getActiveBanners(config),
    getBannersForPage: (pathname) => getBannersForPage(config, pathname),
    getBanner: (slug) => getBanner(config, slug),
  };
}

export type {
  BannerConfig,
  BannerCollections,
  BannerClient,
  DirectusBanner,
  Banner,
  BannerType,
  BannerPosition,
} from './types';

export { getActiveBanners, getBannersForPage, getBanner } from './banners';
