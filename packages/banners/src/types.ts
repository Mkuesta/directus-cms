import type { RestClient } from '@directus/sdk';

export interface BannerCollections {
  banners: string;
}

export interface BannerConfig {
  directus: RestClient<any>;
  collections: BannerCollections;
  directusUrl: string;
  siteId?: number;
}

export type BannerType = 'announcement' | 'promotion' | 'popup' | 'info' | 'warning';
export type BannerPosition = 'top' | 'bottom' | 'popup';

export interface DirectusBanner {
  id: number;
  title: string;
  slug: string;
  content: string;
  type: BannerType;
  position: BannerPosition;
  link_url?: string;
  link_text?: string;
  background_color?: string;
  text_color?: string;
  dismissible: boolean;
  start_date?: string;
  end_date?: string;
  target_pages?: string[];
  status: 'published' | 'draft';
  sort?: number;
  site?: number | null;
}

export interface Banner {
  id: number;
  title: string;
  slug: string;
  content: string;
  type: BannerType;
  position: BannerPosition;
  linkUrl?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  dismissible: boolean;
  startDate?: string;
  endDate?: string;
  targetPages?: string[];
  sort: number;
}

export interface BannerClient {
  config: BannerConfig;
  /** Get all currently active banners (within date range) */
  getActiveBanners(): Promise<Banner[]>;
  /** Get active banners for a specific page path */
  getBannersForPage(pathname: string): Promise<Banner[]>;
  /** Get a specific banner by slug */
  getBanner(slug: string): Promise<Banner | null>;
}
