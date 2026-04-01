'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  search?: string;
  onSearchChange?: (value: string) => void;
}

const Hero: React.FC<HeroProps> = ({ search, onSearchChange }) => {
  return (
    <section className="bg-accent-blue dark:bg-slate-900 py-16 md:py-20 relative overflow-hidden transition-colors duration-300">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-100/50 dark:bg-teal-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Insights and Data for <br className="hidden md:block" />Healthcare Marketers
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Discover the latest trends, lead generation strategies, and data hygiene best practices to power your medical marketing campaigns.
        </p>

        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            value={search ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="block w-full pl-12 pr-32 py-4 text-base rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition dark:text-white placeholder-gray-400"
            placeholder="Search specialties..."
          />
          <button className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-teal-700 text-white px-6 rounded-full font-medium transition duration-200 text-sm md:text-base">
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
