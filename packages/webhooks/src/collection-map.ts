import type { CollectionMapping } from './types.js';

/**
 * Generate sensible default collection mappings for a given prefix.
 * Covers common content types with standard revalidation paths.
 */
export function defaultCollectionMappings(prefix: string): CollectionMapping[] {
  return [
    {
      collection: `${prefix}_posts`,
      actions: [
        { type: 'revalidatePath', path: '/blog', mode: 'layout' },
        { type: 'revalidatePath', path: '/sitemap.xml' },
        { type: 'revalidateTag', tag: 'posts' },
      ],
    },
    {
      collection: `${prefix}_blog_categories`,
      actions: [
        { type: 'revalidatePath', path: '/blog', mode: 'layout' },
        { type: 'revalidateTag', tag: 'blog-categories' },
      ],
    },
    {
      collection: `${prefix}_settings`,
      actions: [
        { type: 'revalidatePath', path: '/', mode: 'layout' },
        { type: 'revalidateTag', tag: 'settings' },
      ],
    },
    {
      collection: `${prefix}_products`,
      actions: [
        { type: 'revalidatePath', path: '/products', mode: 'layout' },
        { type: 'revalidatePath', path: '/sitemap.xml' },
        { type: 'revalidateTag', tag: 'products' },
      ],
    },
    {
      collection: `${prefix}_categories`,
      actions: [
        { type: 'revalidatePath', path: '/products', mode: 'layout' },
        { type: 'revalidateTag', tag: 'product-categories' },
      ],
    },
    {
      collection: `${prefix}_pages`,
      actions: [
        { type: 'revalidatePath', path: '/', mode: 'layout' },
        { type: 'revalidatePath', path: '/sitemap.xml' },
        { type: 'revalidateTag', tag: 'pages' },
      ],
    },
    {
      collection: `${prefix}_navigation_items`,
      actions: [
        { type: 'revalidatePath', path: '/', mode: 'layout' },
        { type: 'revalidateTag', tag: 'navigation' },
      ],
    },
    {
      collection: `${prefix}_banners`,
      actions: [
        { type: 'revalidatePath', path: '/', mode: 'layout' },
        { type: 'revalidateTag', tag: 'banners' },
      ],
    },
    {
      collection: `${prefix}_redirects`,
      actions: [
        { type: 'revalidateTag', tag: 'redirects' },
      ],
    },
    {
      collection: `${prefix}_subscribers`,
      actions: [
        { type: 'revalidateTag', tag: 'newsletter-subscribers' },
      ],
    },
    {
      collection: `${prefix}_notification_templates`,
      actions: [
        { type: 'revalidateTag', tag: 'notification-templates' },
      ],
    },
  ];
}
