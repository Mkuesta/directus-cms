import type { ProvisionConfig } from '../types.js';
import { createItem } from '../directus-api.js';

export async function seedProducts(config: ProvisionConfig): Promise<{ count: number; errors: string[] }> {
  let count = 0;
  const errors: string[] = [];
  const prefix = config.prefix;

  // Seed product categories
  const categories = [
    { name: 'Digital Products', slug: 'digital-products', description: 'Downloadable digital products', featured: true, display_order: 1 },
    { name: 'Templates', slug: 'templates', description: 'Ready-to-use templates', featured: false, display_order: 2 },
  ];

  for (const cat of categories) {
    const res = await createItem(config, `${prefix}_categories`, cat);
    if (res.created) count++;
    else if (res.error) errors.push(res.error);
  }

  // Seed products
  const products = [
    {
      title: 'Sample Product',
      slug: 'sample-product',
      description: '<p>A sample product to demonstrate the product catalog.</p>',
      short_description: 'A sample product',
      price: 29.99,
      status: 'published',
      featured: true,
      sku: 'SAMPLE-001',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    {
      title: 'Premium Template',
      slug: 'premium-template',
      description: '<p>A premium template with all the bells and whistles.</p>',
      short_description: 'Premium template pack',
      price: 49.99,
      compare_at_price: 79.99,
      status: 'published',
      featured: false,
      sku: 'TMPL-001',
      file_format: 'ZIP',
      features: ['Responsive design', 'Dark mode', 'SEO optimized'],
    },
  ];

  for (const product of products) {
    const res = await createItem(config, `${prefix}_products`, product);
    if (res.created) count++;
    else if (res.error) errors.push(res.error);
  }

  return { count, errors };
}
