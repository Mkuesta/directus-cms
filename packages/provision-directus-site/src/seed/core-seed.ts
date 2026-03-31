import type { ProvisionConfig } from '../types.js';
import { createItem, updateSingleton } from '../directus-api.js';

export async function seedCore(config: ProvisionConfig): Promise<{ count: number; errors: string[] }> {
  let count = 0;
  const errors: string[] = [];
  const prefix = config.prefix;

  // Seed settings singleton
  const settingsRes = await updateSingleton(config, `${prefix}_settings`, {
    site_name: config.prefix.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    site_title: 'Welcome to our site',
    site_description: 'A modern website powered by Directus CMS',
    default_author_name: 'Admin',
    default_language: 'en',
    theme_color: '#ffffff',
    default_meta_robots: 'index, follow',
  });
  if (settingsRes.created) count++;
  else if (settingsRes.error) errors.push(settingsRes.error);

  // Seed blog categories
  const categories = [
    { name: 'General', slug: 'general', description: 'General posts', status: 'published', sort: 1 },
    { name: 'Tutorials', slug: 'tutorials', description: 'How-to guides and tutorials', status: 'published', sort: 2 },
    { name: 'News', slug: 'news', description: 'Latest news and updates', status: 'published', sort: 3 },
  ];

  for (const cat of categories) {
    const res = await createItem(config, `${prefix}_blog_categories`, cat);
    if (res.created) count++;
    else if (res.error) errors.push(res.error);
  }

  // Seed posts
  const posts = [
    {
      title: 'Getting Started',
      slug: 'getting-started',
      excerpt: 'Learn how to get started with your new website.',
      content: '<h2>Welcome</h2><p>This is your first blog post. Edit or delete it to get started.</p>',
      status: 'published',
      published_date: new Date().toISOString(),
      author: 'Admin',
      article_type: 'Article',
      language: 'en',
    },
    {
      title: 'Building with Directus',
      slug: 'building-with-directus',
      excerpt: 'How to build a modern website with Directus as your headless CMS.',
      content: '<h2>Why Directus?</h2><p>Directus is a powerful headless CMS that gives you full control over your content and data model.</p>',
      status: 'published',
      published_date: new Date().toISOString(),
      author: 'Admin',
      article_type: 'BlogPosting',
      language: 'en',
    },
    {
      title: 'Draft Post Example',
      slug: 'draft-post-example',
      excerpt: 'This is a draft post that is not yet published.',
      content: '<p>This post is still in draft mode.</p>',
      status: 'draft',
      author: 'Admin',
      language: 'en',
    },
  ];

  for (const post of posts) {
    const res = await createItem(config, `${prefix}_posts`, post);
    if (res.created) count++;
    else if (res.error) errors.push(res.error);
  }

  return { count, errors };
}
