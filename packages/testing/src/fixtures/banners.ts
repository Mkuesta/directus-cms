let _bannerId = 1;

export function resetBannerCounter() { _bannerId = 1; }

export function createDirectusBanner(overrides?: Record<string, any>) {
  const id = _bannerId++;
  return {
    id,
    title: `Banner ${id}`,
    message: `Banner message ${id}`,
    type: 'info',
    url: null,
    url_text: null,
    dismissible: true,
    start_date: null,
    end_date: null,
    pages: null,
    status: 'published',
    sort: id,
    site: null,
    ...overrides,
  };
}

export function createBanner(overrides?: Record<string, any>) {
  const id = _bannerId++;
  return {
    id,
    title: `Banner ${id}`,
    message: `Banner message ${id}`,
    type: 'info' as const,
    url: undefined,
    urlText: undefined,
    dismissible: true,
    startDate: undefined,
    endDate: undefined,
    pages: undefined,
    ...overrides,
  };
}
