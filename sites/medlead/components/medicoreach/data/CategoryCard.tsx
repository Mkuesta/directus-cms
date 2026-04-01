import React from 'react';
import Link from 'next/link';
import type { DirectusCategory } from '@mkuesta/core';

const iconMap: Record<string, string> = {
  physicians: 'stethoscope',
  nurses: 'medical_services',
  dental: 'dentistry',
  pharmacists: 'pharmacy',
  hospitals: 'local_hospital',
  therapists: 'psychology',
  optometrists: 'visibility',
  veterinarians: 'pets',
  chiropractors: 'accessibility_new',
  podiatrists: 'podiatry',
};

interface CategoryCardProps {
  category: DirectusCategory & { childCount: number };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const icon = iconMap[category.slug] || category.icon || 'category';

  return (
    <Link
      href={`/data/${category.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className="text-xs font-bold text-primary bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full">
          {category.childCount} {category.childCount === 1 ? 'specialty' : 'specialties'}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
        {category.name}
      </h3>

      {category.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
          {category.description}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm font-semibold text-primary flex items-center gap-1">
        Browse specialties
        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
