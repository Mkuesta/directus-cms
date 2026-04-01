import Link from 'next/link';
import { cms } from '@/lib/cms';
import { BLOG_ROUTE, PRODUCT_ROUTE } from '@/lib/directus/config';

export default async function HomePage() {
  const [{ posts }, settings] = await Promise.all([
    cms.getPosts({ pageSize: 3 }),
    cms.getSettings(),
  ]);

  return (
    <div>
      <h1>{settings.siteName}</h1>
      <p>{settings.siteDescription}</p>

      <h2>Latest Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/${BLOG_ROUTE}/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>

      <Link href={`/${BLOG_ROUTE}`}>View all posts →</Link>
      <br />
      <Link href={`/${PRODUCT_ROUTE}`}>View products →</Link>
    </div>
  );
}
