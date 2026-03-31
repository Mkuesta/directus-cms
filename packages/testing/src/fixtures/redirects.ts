let _redirectId = 1;

export function resetRedirectCounter() { _redirectId = 1; }

export function createDirectusRedirect(overrides?: Record<string, any>) {
  const id = _redirectId++;
  return {
    id,
    source: `/old-page-${id}`,
    destination: `/new-page-${id}`,
    status_code: 301,
    is_regex: false,
    status: 'published',
    site: null,
    ...overrides,
  };
}

export function createRedirect(overrides?: Record<string, any>) {
  const id = _redirectId++;
  return {
    id,
    source: `/old-page-${id}`,
    destination: `/new-page-${id}`,
    statusCode: 301,
    isRegex: false,
    ...overrides,
  };
}
