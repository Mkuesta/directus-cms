import React from 'react';
import Link from 'next/link';
import type { Post } from '@mkuesta/core';

interface HeroProps {
  post: Post;
}

const Hero: React.FC<HeroProps> = ({ post }) => {
  const categoryName = post.blogCategory?.name ?? post.category ?? 'General';
  const authorInitials = post.author
    ? post.author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';
  const publishedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <section className="bg-[#E6F2F2] dark:bg-slate-900 py-16 md:py-20 relative overflow-hidden border-b border-teal-100 dark:border-slate-800">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-100/50 dark:bg-teal-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-primary font-medium mb-6">
            <Link href="/" className="hover:underline text-gray-500 dark:text-gray-400">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/resources" className="hover:underline text-gray-500 dark:text-gray-400">Resources</Link>
            <span className="text-gray-300">/</span>
            <span className="bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded text-primary border border-teal-100 dark:border-slate-700 shadow-sm">
              {categoryName}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                {authorInitials}
              </div>
              <span className="font-medium">By {post.author || 'Artzdata Team'}</span>
            </div>
            {publishedDate && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                <span>Published: {publishedDate}</span>
              </div>
            )}
            {post.readingTime && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                <span>{post.readingTime} min read</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
