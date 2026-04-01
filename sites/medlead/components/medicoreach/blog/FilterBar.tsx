'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { BlogCategory } from '@mkuesta/core';

interface FilterBarProps {
  categories: BlogCategory[];
  basePath?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ categories, basePath = '/blog' }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="sticky top-20 z-40 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-4 gap-3 hide-scrollbar custom-scrollbar items-center">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2 hidden sm:block whitespace-nowrap">
            Filters:
          </span>
          <Link
            href={basePath}
            onClick={() => setActiveFilter('all')}
            className={`flex-shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? "bg-primary text-white shadow-md"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            All Posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`${basePath}/${category.slug}`}
              onClick={() => setActiveFilter(category.slug)}
              className={`flex-shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                activeFilter === category.slug
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
