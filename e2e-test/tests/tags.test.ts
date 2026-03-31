import { describe, it, expect } from 'vitest';
import { createTagClient } from '../../directus-cms-tags/src/index.js';
import {
  getAllTags,
  getPostsByTag,
  getRelatedByTags,
  getTagCounts,
} from '../../directus-cms-tags/src/tags.js';

// ---------------------------------------------------------------------------
// Mock Directus client and config helpers
// ---------------------------------------------------------------------------

const MOCK_POSTS = [
  {
    id: '1',
    title: 'Getting Started with React',
    slug: 'getting-started-react',
    excerpt: 'Learn the basics of React development.',
    tags: ['javascript', 'react', 'frontend'],
    published_date: '2024-01-15',
    featured_image: null,
    status: 'published',
  },
  {
    id: '2',
    title: 'Node.js Best Practices',
    slug: 'nodejs-best-practices',
    excerpt: 'Best practices for building Node.js applications.',
    tags: ['javascript', 'node', 'backend'],
    published_date: '2024-02-10',
    featured_image: 'abc-123',
    status: 'published',
  },
  {
    id: '3',
    title: 'Introduction to Python',
    slug: 'intro-to-python',
    excerpt: 'A beginner guide to Python programming.',
    tags: ['python', 'backend'],
    published_date: '2024-03-05',
    featured_image: { id: 'img-456' },
    status: 'published',
  },
  {
    id: '4',
    title: 'Advanced React Patterns',
    slug: 'advanced-react-patterns',
    excerpt: 'Deep dive into advanced React patterns.',
    tags: ['javascript', 'react', 'advanced'],
    published_date: '2024-04-20',
    featured_image: null,
    status: 'published',
  },
];

function createMockConfig(posts: any[] = MOCK_POSTS) {
  // Each config needs a unique directus object to avoid WeakMap cache collisions
  const mockDirectus = {
    request: async () => posts,
  };

  return {
    directus: mockDirectus as any,
    directusUrl: 'https://cms.example.com',
    collections: { posts: 'test_posts' },
  };
}

// ---------------------------------------------------------------------------
// createTagClient — factory shape
// ---------------------------------------------------------------------------
describe('createTagClient', () => {
  it('returns client with all expected methods', () => {
    const config = createMockConfig();
    const client = createTagClient(config);

    expect(client.config).toBe(config);
    expect(typeof client.getAllTags).toBe('function');
    expect(typeof client.getPostsByTag).toBe('function');
    expect(typeof client.getRelatedByTags).toBe('function');
    expect(typeof client.getTagCounts).toBe('function');
  });

  it('config is accessible on client', () => {
    const config = createMockConfig();
    const client = createTagClient(config);

    expect(client.config.directusUrl).toBe('https://cms.example.com');
    expect(client.config.collections.posts).toBe('test_posts');
  });

  it('methods are properly bound (calling without this works)', async () => {
    const config = createMockConfig();
    const client = createTagClient(config);

    // Destructure to lose `this` context
    const { getAllTags: getTags } = client;
    const tags = await getTags();
    expect(Array.isArray(tags)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getAllTags
// ---------------------------------------------------------------------------
describe('getAllTags', () => {
  it('returns unique sorted tags from all posts', async () => {
    const config = createMockConfig();
    const tags = await getAllTags(config);

    expect(tags).toEqual([
      'advanced',
      'backend',
      'frontend',
      'javascript',
      'node',
      'python',
      'react',
    ]);
  });

  it('returns empty array when no posts', async () => {
    const config = createMockConfig([]);
    const tags = await getAllTags(config);
    expect(tags).toEqual([]);
  });

  it('handles posts with empty tags arrays', async () => {
    const config = createMockConfig([
      { id: '1', title: 'No Tags', slug: 'no-tags', tags: [], published_date: '2024-01-01', featured_image: null, status: 'published' },
    ]);
    const tags = await getAllTags(config);
    expect(tags).toEqual([]);
  });

  it('deduplicates tags that appear in multiple posts', async () => {
    const config = createMockConfig();
    const tags = await getAllTags(config);
    // 'javascript' appears in 3 posts but should only appear once
    const jsCount = tags.filter((t) => t === 'javascript').length;
    expect(jsCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getPostsByTag
// ---------------------------------------------------------------------------
describe('getPostsByTag', () => {
  it('returns posts matching the given tag', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'react');

    expect(posts).toHaveLength(2);
    expect(posts.map((p) => p.slug)).toContain('getting-started-react');
    expect(posts.map((p) => p.slug)).toContain('advanced-react-patterns');
  });

  it('performs case-insensitive matching', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'REACT');

    expect(posts).toHaveLength(2);
  });

  it('limits results when limit is provided', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'javascript', 2);

    expect(posts).toHaveLength(2);
  });

  it('returns empty array for non-existent tag', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'nonexistent');

    expect(posts).toEqual([]);
  });

  it('returns all matching posts when no limit', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'javascript');

    expect(posts).toHaveLength(3);
  });

  it('transforms posts to TaggedPost shape', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'python');

    expect(posts).toHaveLength(1);
    const post = posts[0];
    expect(post.id).toBe('3');
    expect(post.title).toBe('Introduction to Python');
    expect(post.slug).toBe('intro-to-python');
    expect(post.tags).toEqual(['python', 'backend']);
    expect(post.publishedDate).toBe('2024-03-05');
  });

  it('constructs image URLs from string image IDs', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'node');

    expect(posts).toHaveLength(1);
    expect(posts[0].featuredImage).toBe('https://cms.example.com/assets/abc-123');
  });

  it('constructs image URLs from object image references', async () => {
    const config = createMockConfig();
    const posts = await getPostsByTag(config, 'python');

    expect(posts).toHaveLength(1);
    expect(posts[0].featuredImage).toBe('https://cms.example.com/assets/img-456');
  });
});

// ---------------------------------------------------------------------------
// getRelatedByTags
// ---------------------------------------------------------------------------
describe('getRelatedByTags', () => {
  it('returns posts sharing tags, sorted by shared count', async () => {
    const config = createMockConfig();
    // Post 1 has ['javascript', 'react', 'frontend']
    // Looking for related to these tags, excluding post-1
    const related = await getRelatedByTags(
      config,
      ['javascript', 'react'],
      'getting-started-react',
    );

    // Post 4 shares both 'javascript' and 'react' (2 matches)
    // Post 2 shares 'javascript' (1 match)
    // Post 3 shares nothing with these tags... wait it doesn't have javascript
    // Actually post 3 has ['python', 'backend']
    expect(related.length).toBeGreaterThan(0);
    // First result should be the one with most shared tags
    expect(related[0].slug).toBe('advanced-react-patterns');
  });

  it('excludes post with given slug', async () => {
    const config = createMockConfig();
    const related = await getRelatedByTags(
      config,
      ['javascript', 'react'],
      'getting-started-react',
    );

    const slugs = related.map((p) => p.slug);
    expect(slugs).not.toContain('getting-started-react');
  });

  it('limits results', async () => {
    const config = createMockConfig();
    const related = await getRelatedByTags(
      config,
      ['javascript'],
      'getting-started-react',
      1,
    );

    expect(related).toHaveLength(1);
  });

  it('returns empty array when no posts share tags', async () => {
    const config = createMockConfig();
    const related = await getRelatedByTags(
      config,
      ['nonexistent-tag'],
      'some-slug',
    );

    expect(related).toEqual([]);
  });

  it('performs case-insensitive tag matching', async () => {
    const config = createMockConfig();
    const related = await getRelatedByTags(
      config,
      ['JAVASCRIPT'],
      'getting-started-react',
    );

    expect(related.length).toBeGreaterThan(0);
  });

  it('uses default limit of 5', async () => {
    // Create many posts sharing tags
    const manyPosts = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      excerpt: `Excerpt ${i + 1}`,
      tags: ['common-tag'],
      published_date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      featured_image: null,
      status: 'published',
    }));
    const config = createMockConfig(manyPosts);
    const related = await getRelatedByTags(config, ['common-tag'], 'post-1');

    expect(related).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// getTagCounts
// ---------------------------------------------------------------------------
describe('getTagCounts', () => {
  it('returns tags with correct counts, sorted by count descending', async () => {
    const config = createMockConfig();
    const counts = await getTagCounts(config);

    // javascript appears in 3 posts
    // react appears in 2 posts
    // backend appears in 2 posts
    // frontend, node, python, advanced each appear in 1 post
    expect(counts[0]).toEqual({ tag: 'javascript', count: 3 });

    // Check counts for known tags
    const reactCount = counts.find((c) => c.tag === 'react');
    expect(reactCount).toEqual({ tag: 'react', count: 2 });

    const backendCount = counts.find((c) => c.tag === 'backend');
    expect(backendCount).toEqual({ tag: 'backend', count: 2 });

    const pythonCount = counts.find((c) => c.tag === 'python');
    expect(pythonCount).toEqual({ tag: 'python', count: 1 });
  });

  it('returns all unique tags', async () => {
    const config = createMockConfig();
    const counts = await getTagCounts(config);

    expect(counts).toHaveLength(7);
    const tagNames = counts.map((c) => c.tag);
    expect(tagNames).toContain('javascript');
    expect(tagNames).toContain('react');
    expect(tagNames).toContain('frontend');
    expect(tagNames).toContain('node');
    expect(tagNames).toContain('backend');
    expect(tagNames).toContain('python');
    expect(tagNames).toContain('advanced');
  });

  it('returns empty array when no posts', async () => {
    const config = createMockConfig([]);
    const counts = await getTagCounts(config);
    expect(counts).toEqual([]);
  });

  it('sorts by count descending', async () => {
    const config = createMockConfig();
    const counts = await getTagCounts(config);

    for (let i = 1; i < counts.length; i++) {
      expect(counts[i - 1].count).toBeGreaterThanOrEqual(counts[i].count);
    }
  });

  it('handles posts with non-array tags gracefully', async () => {
    const config = createMockConfig([
      { id: '1', title: 'Bad Tags', slug: 'bad-tags', tags: 'not-an-array', published_date: '2024-01-01', featured_image: null, status: 'published' },
      { id: '2', title: 'Good Tags', slug: 'good-tags', tags: ['valid'], published_date: '2024-01-02', featured_image: null, status: 'published' },
    ]);
    const counts = await getTagCounts(config);

    // Non-array tags should be treated as empty by the tags.ts transform
    expect(counts).toHaveLength(1);
    expect(counts[0]).toEqual({ tag: 'valid', count: 1 });
  });
});
