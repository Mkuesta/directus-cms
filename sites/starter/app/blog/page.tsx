import Link from 'next/link';
import { cms } from '@/lib/cms';
import { BLOG_ROUTE } from '@/lib/directus/config';

export async function generateMetadata() {
  return cms.getBlogIndexMetadata();
}

export default async function BlogPage() {
  const { posts } = await cms.getPosts({ pageSize: 100 });

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/${BLOG_ROUTE}/${post.slug}`}>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
