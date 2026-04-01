import React from 'react';
import Link from 'next/link';
import { FileText, Clock } from 'lucide-react';
import type { Post } from '@mkuesta/core';
import { media } from '@/lib/media';

interface ArticleGridProps {
  posts: Post[];
  totalCount: number;
  categorySlug?: string;
  basePath?: string;
}

function getResponsiveProps(imageUrl: string, widths: number[], sizes: string, defaultWidth: number) {
  const fileId = imageUrl.split('/assets/')[1]?.split('?')[0];
  if (!fileId) return {};
  const responsive = media.getResponsiveImage(fileId, { widths, sizes, defaultWidth, transform: { quality: 80, format: 'webp' } });
  return { srcSet: responsive.srcSet, sizes: responsive.sizes };
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ posts, totalCount, categorySlug, basePath = '/blog' }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No articles yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Check back soon for new content.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="text-primary" size={24} /> Latest Articles
        </h3>
        <div className="text-sm text-gray-500">
          Showing {posts.length} of {totalCount} articles
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {posts.map((post) => (
          <article key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <Link href={`${basePath}/${post.slug}`} className="h-48 relative overflow-hidden group block">
              {post.featuredImage?.url ? (
                <img
                  src={post.featuredImage.url}
                  {...getResponsiveProps(post.featuredImage.url, [320, 480, 640], '(max-width: 768px) 100vw, 33vw', 480)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center group-hover:scale-110 transition duration-500">
                  <span className="text-4xl font-bold text-teal-300/50">{post.title.charAt(0)}</span>
                </div>
              )}
              {post.category && (
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 text-primary text-xs font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm">
                  {post.category}
                </span>
              )}
            </Link>

            <div className="p-5 flex-1 flex flex-col">
              <Link href={`${basePath}/${post.slug}`}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary cursor-pointer transition">
                  {post.title}
                </h3>
              </Link>
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {formatDate(post.publishedDate)}
                </span>
                <Link href={`${basePath}/${post.slug}`} className="font-semibold text-primary hover:underline">Read</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ArticleGrid;
