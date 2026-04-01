import React from 'react';
import type { DirectusPost } from '@mkuesta/core';

interface PostContentProps {
  post: DirectusPost;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  return (
    <div className="w-full lg:w-2/3">
      <div className="prose prose-lg prose-teal dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-6 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-6 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-primary hover:prose-a:text-teal-700 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-table:min-w-full prose-thead:bg-surface-light dark:prose-thead:bg-surface-dark prose-th:px-6 prose-th:py-4 prose-th:text-left prose-th:text-sm prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-gray-900 dark:prose-th:text-white prose-td:px-6 prose-td:py-4 prose-td:text-sm prose-td:text-gray-700 dark:prose-td:text-gray-300 prose-img:rounded-xl prose-img:shadow-lg">
        {post.featured_image_url && (
          <div className="rounded-2xl overflow-hidden mb-10 shadow-lg border border-gray-100 dark:border-slate-700">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            This article has no content yet.
          </p>
        )}
      </div>

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
    </div>
  );
};

export default PostContent;
