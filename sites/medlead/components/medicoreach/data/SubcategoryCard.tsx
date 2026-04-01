import React from 'react';
import Link from 'next/link';
import type { DirectusCategory } from '@mkuesta/core';

interface SubcategoryCardProps {
  subcategory: DirectusCategory;
  parentSlug: string;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ subcategory, parentSlug }) => {
  const icon = subcategory.icon || 'person';

  return (
    <Link
      href={`/data/${parentSlug}/${subcategory.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
          {subcategory.name}
        </h3>
      </div>

      {subcategory.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1 mb-3">
          {subcategory.description}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 text-sm font-semibold text-primary flex items-center gap-1">
        View Email List
        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </Link>
  );
};

export default SubcategoryCard;
