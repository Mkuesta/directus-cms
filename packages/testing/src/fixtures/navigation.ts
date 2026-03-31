let _navId = 1;

export function resetNavigationCounter() { _navId = 1; }

export function createDirectusNavigationItem(overrides?: Record<string, any>) {
  const id = _navId++;
  return {
    id,
    label: `Nav Item ${id}`,
    path: `/page-${id}`,
    url: null,
    type: 'internal',
    target: '_self',
    menu: 'header',
    parent_id: null,
    sort: id,
    status: 'published',
    icon: null,
    css_class: null,
    site: null,
    ...overrides,
  };
}

export function createMenuItem(overrides?: Record<string, any>) {
  const id = _navId++;
  return {
    id,
    label: `Nav Item ${id}`,
    url: `/page-${id}`,
    external: false,
    target: '_self' as const,
    children: [],
    sort: id,
    icon: undefined,
    cssClass: undefined,
    ...overrides,
  };
}
