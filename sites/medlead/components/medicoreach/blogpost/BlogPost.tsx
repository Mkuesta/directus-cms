import React from 'react';
import type { Post } from '@mkuesta/core';
import { media } from '@/lib/media';

interface BlogPostProps {
  post: Post;
}

function getResponsiveProps(imageUrl: string, widths: number[], sizes: string, defaultWidth: number) {
  const fileId = imageUrl.split('/assets/')[1]?.split('?')[0];
  if (!fileId) return {};
  const responsive = media.getResponsiveImage(fileId, { widths, sizes, defaultWidth, transform: { quality: 85, format: 'webp' } });
  return { srcSet: responsive.srcSet, sizes: responsive.sizes };
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  return (
    <article className="prose prose-lg prose-teal dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-6 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-6 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-primary hover:prose-a:text-teal-700 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-table:min-w-full prose-thead:bg-surface-light dark:prose-thead:bg-surface-dark prose-th:px-6 prose-th:py-4 prose-th:text-left prose-th:text-sm prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-gray-900 dark:prose-th:text-white prose-td:px-6 prose-td:py-4 prose-td:text-sm prose-td:text-gray-700 dark:prose-td:text-gray-300 prose-img:rounded-xl prose-img:shadow-lg">
      {/* Featured Image */}
      {post.featuredImage?.url && (
        <div className="rounded-2xl overflow-hidden mb-10 shadow-lg border border-gray-100 dark:border-slate-700">
          <img
            src={post.featuredImage.url}
            {...getResponsiveProps(post.featuredImage.url, [640, 960, 1200], '(max-width: 768px) 100vw, 65vw', 960)}
            alt={post.featuredImage.alt || post.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Post Content */}
      {post.content ? (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">
          This article has no content yet.
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Share */}
      <div className="lg:hidden flex gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
        <span className="font-bold text-gray-900 dark:text-white">Share this article:</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">FB</button>
          <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">TW</button>
          <button className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">LI</button>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
