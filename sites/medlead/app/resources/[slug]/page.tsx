import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/medicoreach/blogpost/Hero';
import BlogPost from '@/components/medicoreach/blogpost/BlogPost';
import SocialSidebar from '@/components/medicoreach/blogpost/SocialSidebar';
import Sidebar from '@/components/medicoreach/blogpost/Sidebar';
import { ArticleSchema } from '@/components/medicoreach/blogpost/ArticleSchema';
import { PreviewBanner } from '@mkuesta/preview/components';
import { cms } from '@/lib/cms';
import { preview } from '@/lib/preview';
import { tags as tagClient } from '@/lib/tags';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io';

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await cms.getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  const categorySlug = post.blogCategory?.slug || post.category || 'blog';
  return cms.getArticleMetadata(slug, categorySlug);
}

export async function generateStaticParams() {
  const { posts } = await cms.getPosts({ pageSize: 1000 });
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();

  // In preview mode, use the preview client which can fetch drafts
  const getPost = isPreview
    ? () => preview.getPreviewPost(slug).then((p) => p as Awaited<ReturnType<typeof cms.getPostBySlug>>)
    : () => cms.getPostBySlug(slug);

  const [post, settings, tagCounts] = await Promise.all([
    getPost(),
    cms.getSettings(),
    tagClient.getTagCounts().catch(() => []),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.tags?.length
    ? await tagClient.getRelatedByTags(post.tags, post.slug, 3).catch(() => [])
    : [];

  const categoryName = post.blogCategory?.name || post.category || 'General';
  const categorySlug = post.blogCategory?.slug || post.category || 'blog';

  return (
    <>
      {isPreview && <PreviewBanner exitUrl="/api/preview/exit" className="" />}
      <ArticleSchema
        post={post}
        settings={settings}
        categoryName={categoryName}
        categorySlug={categorySlug}
        baseUrl={BASE_URL}
        route="resources"
        urls={cms.config.urls}
        breadcrumbLabel="Resources"
      />
      <Hero post={post} />
      <section className="py-16 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Social Sidebar */}
            <div className="hidden lg:block lg:w-16">
              <SocialSidebar />
            </div>
            {/* Blog Post Content */}
            <div className="flex-1 min-w-0">
              <BlogPost post={post} />
            </div>
            {/* Right Sidebar */}
            <div className="w-full lg:w-80">
              <Sidebar tags={tagCounts} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">You might also like</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/resources/${related.slug}`} className="no-underline group">
                  <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    {related.featuredImage ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={related.featuredImage}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-teal-300/50">{related.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="p-4 flex-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{related.excerpt}</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
