'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { DirectusCategory } from '@mkuesta/core';

const iconMap: Record<string, string> = {
  physicians: 'stethoscope',
  nurses: 'medical_services',
  dental: 'dentistry',
  pharmacists: 'local_pharmacy',
  hospitals: 'local_hospital',
  therapists: 'psychology',
  optometrists: 'visibility',
  veterinarians: 'pets',
  chiropractors: 'accessibility_new',
  podiatrists: 'podiatry',
};

interface CategoryBrowserProps {
  categories: DirectusCategory[];
  search?: string;
}

export default function CategoryBrowser({ categories, search = '' }: CategoryBrowserProps) {

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories
      .map((cat) => ({
        ...cat,
        children: cat.children?.filter((child) =>
          child.name.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.children && cat.children.length > 0)
      );
  }, [categories, search]);

  return (
    <div>
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No specialties found for &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCategories.map((category) => {
            const icon = iconMap[category.slug] || category.icon || 'category';

            return (
              <div
                key={category.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 dark:bg-teal-900/30">
                  <div className="w-8 h-8 rounded-md bg-white/60 dark:bg-white/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {category.children?.length ?? 0}
                  </span>
                </div>

                <div>
                  {category.children && category.children.length > 0 ? (
                    category.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/data/${category.slug}/${sub.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        <span className="text-sm">{sub.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      </Link>
                    ))
                  ) : (
                    <Link
                      href={`/data/${category.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <span className="text-sm">View {category.name} Email List</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
