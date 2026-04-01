'use client';

import React, { useState } from 'react';
import Hero from '@/components/medicoreach/blog/Hero';
import CategoryBrowser from './CategoryBrowser';
import type { DirectusCategory } from '@mkuesta/core';

interface DataPageClientProps {
  categories: DirectusCategory[];
}

export default function DataPageClient({ categories }: DataPageClientProps) {
  const [search, setSearch] = useState('');

  return (
    <>
      <Hero search={search} onSearchChange={setSearch} />
      <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryBrowser categories={categories} search={search} />
        </div>
      </section>
    </>
  );
}
