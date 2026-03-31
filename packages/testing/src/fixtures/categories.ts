let _categoryId = 1;

export function resetCategoryCounter() { _categoryId = 1; }

export function createDirectusBlogCategory(overrides?: Record<string, any>) {
  const id = _categoryId++;
  return {
    id,
    name: `Category ${id}`,
    slug: `category-${id}`,
    description: `Description for category ${id}`,
    sort: id,
    ...overrides,
  };
}

export function createBlogCategory(overrides?: Record<string, any>) {
  const id = _categoryId++;
  return {
    id,
    name: `Category ${id}`,
    slug: `category-${id}`,
    description: `Description for category ${id}`,
    ...overrides,
  };
}
