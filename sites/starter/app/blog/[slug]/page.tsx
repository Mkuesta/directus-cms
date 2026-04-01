import { notFound } from 'next/navigation';
import { cms } from '@/lib/cms';
import { ArticleSchema } from '@mkuesta/core/components';
import { BASE_URL, BLOG_ROUTE } from '@/lib/directus/config';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return cms.getArticleMetadata(slug, 'blog');
}

export async function generateStaticParams() {
  const { posts } = await cms.getPosts({ pageSize: 1000 });
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    cms.getPostBySlug(slug),
    cms.getSettings(),
  ]);

  if (!post) notFound();

  const categoryName = post.blogCategory?.name || 'Blog';
  const categorySlug = post.blogCategory?.slug || 'blog';

  return (
    <>
      <ArticleSchema
        post={post}
        settings={settings}
        categoryName={categoryName}
        categorySlug={categorySlug}
        baseUrl={BASE_URL}
        route={BLOG_ROUTE}
        breadcrumbLabel={BLOG_ROUTE.charAt(0).toUpperCase() + BLOG_ROUTE.slice(1)}
      />
      <article>
        <h1>{post.title}</h1>
        {post.publishedDate && (
          <time>{new Date(post.publishedDate).toLocaleDateString()}</time>
        )}
        {post.content && (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        )}
      </article>
    </>
  );
}
