import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@mkuesta/core';
import { media } from '@/lib/media';

interface FeaturedPostProps {
  post: Post;
  categorySlug?: string;
  basePath?: string;
}

function getResponsiveProps(imageUrl: string, widths: number[], sizes: string, defaultWidth: number) {
  const fileId = imageUrl.split('/assets/')[1]?.split('?')[0];
  if (!fileId) return {};
  const responsive = media.getResponsiveImage(fileId, { widths, sizes, defaultWidth, transform: { quality: 85, format: 'webp' } });
  return { srcSet: responsive.srcSet, sizes: responsive.sizes };
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ post, categorySlug, basePath = '/blog' }) => {
  const categoryName = post.category || 'General';
  const publishedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="h-64 md:h-auto relative overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100 dark:from-slate-700 dark:to-slate-600">
          {post.featuredImage?.url ? (
            <img
              src={post.featuredImage.url}
              {...getResponsiveProps(post.featuredImage.url, [480, 768, 1024], '(max-width: 768px) 100vw, 50vw', 768)}
              alt={post.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-teal-300/50">{post.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
            Featured
          </div>
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm text-primary mb-3 font-medium">
            <span className="bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">{categoryName}</span>
            {publishedDate && (
              <>
                <span className="text-gray-400">&bull;</span>
                <span className="text-gray-500 dark:text-gray-400">{publishedDate}</span>
              </>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-base md:text-lg leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div>
            <Link href={`${basePath}/${post.slug}`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-teal-700 transition shadow-sm">
              Read Article <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;
