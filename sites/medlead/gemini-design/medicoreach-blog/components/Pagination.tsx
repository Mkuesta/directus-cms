import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination: React.FC = () => {
  return (
    <div className="flex justify-center">
      <nav className="flex items-center gap-2">
        <a href="#" className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 disabled:opacity-50">
          <ChevronLeft size={16} />
        </a>
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-medium">1</a>
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition">2</a>
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition">3</a>
        <span className="text-gray-400 px-1">...</span>
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition">8</a>
        <a href="#" className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500">
          <ChevronRight size={16} />
        </a>
      </nav>
    </div>
  );
};