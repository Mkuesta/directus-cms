import React from 'react';
import Link from 'next/link';
import type { DirectusPost, DirectusBlogCategory } from '@mkuesta/core';

interface PostHeroProps {
  post: DirectusPost;
  category?: DirectusBlogCategory | null;
}

const PostHero: React.FC<PostHeroProps> = ({ post, category }) => {
  const publishedDate = post.published_date
    ? new Date(post.published_date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
    : '';

  return (
    <section className="relative bg-gradient-to-br from-[#005c5c] to-teal-600 dark:from-slate-900 dark:to-teal-900 overflow-hidden text-center py-16 transition-colors duration-300">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <nav aria-label="Breadcrumb" className="flex justify-center text-teal-100 text-sm mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center hover:text-white transition">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <Link href="/data" className="hover:text-white transition">Data</Link>
              </div>
            </li>
            {category && (
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <Link href={`/data/${category.slug}`} className="hover:text-white transition">{category.name}</Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-white font-medium">{post.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg text-teal-50 max-w-2xl mx-auto">
          {publishedDate && (
            <>Published: <span className="font-semibold text-white">{publishedDate}</span></>
          )}
          {publishedDate && post.read_time && <span className="mx-2">&bull;</span>}
          {post.read_time && (
            <span className="font-semibold text-secondary">{post.read_time} min read</span>
          )}
        </p>
      </div>
    </section>
  );
};

export default PostHero;
