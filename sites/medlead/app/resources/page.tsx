import type { Metadata } from 'next';
import Hero from '@/components/medicoreach/blog/Hero';
import FeaturedPost from '@/components/medicoreach/blog/FeaturedPost';
import ArticleGrid from '@/components/medicoreach/blog/ArticleGrid';
import Sidebar from '@/components/medicoreach/blog/Sidebar';
import { cms } from '@/lib/cms';
import { tags as tagClient } from '@/lib/tags';

export async function generateMetadata(): Promise<Metadata> {
  return cms.getBlogIndexMetadata();
}

export default async function BlogPage() {
  const [{ posts }, tagCounts] = await Promise.all([
    cms.getPosts({ pageSize: 100 }),
    tagClient.getTagCounts().catch(() => []),
  ]);

  const featuredPost = posts[0] || null;
  const remainingPosts = posts.slice(1);

  return (
    <>
      <Hero />
      <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {featuredPost && (
            <FeaturedPost post={featuredPost} basePath="/resources" />
          )}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-12">
            <div className="lg:w-3/4">
              <ArticleGrid
                posts={remainingPosts}
                totalCount={posts.length}
                basePath="/resources"
              />
            </div>
            <div className="lg:w-1/4">
              <Sidebar tags={tagCounts} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
