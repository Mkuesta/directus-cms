import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ArticleGrid from '@/components/medicoreach/blog/ArticleGrid';
import Sidebar from '@/components/medicoreach/blog/Sidebar';
import { tags as tagClient } from '@/lib/tags';
import { cms } from '@/lib/cms';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `Posts tagged "${decoded}" | Medlead Blog`,
    description: `Browse all blog posts tagged with "${decoded}" on the Medlead blog.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const [posts, tagCounts] = await Promise.all([
    tagClient.getPostsByTag(decoded, 100).catch(() => []),
    tagClient.getTagCounts().catch(() => []),
  ]);

  if (posts.length === 0) {
    notFound();
  }

  // Map tagged posts to the Post shape expected by ArticleGrid
  const mappedPosts = await Promise.all(
    posts.map(async (tp) => {
      const post = await cms.getPostBySlug(tp.slug).catch(() => null);
      return post;
    })
  );
  const validPosts = mappedPosts.filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/resources" className="no-underline inline-flex items-center gap-1 text-sm text-primary hover:text-teal-700 mb-4">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Posts tagged <span className="text-primary">#{decoded}</span>
          </h1>
          <p className="text-gray-500 mt-2">{validPosts.length} article{validPosts.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-3/4">
            <ArticleGrid
              posts={validPosts}
              totalCount={validPosts.length}
              basePath="/resources"
            />
          </div>
          <div className="lg:w-1/4">
            <Sidebar tags={tagCounts} />
          </div>
        </div>
      </div>
    </section>
  );
}
