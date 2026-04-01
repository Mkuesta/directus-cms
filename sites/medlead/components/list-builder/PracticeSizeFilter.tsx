'use client';

import { useListBuilderStore, PRACTICE_SIZES } from '@/stores/listBuilderStore';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE_LABELS: Record<string, string> = {
  solo: 'Solo',
  '2-5': '2-5',
  '6-10': '6-10',
  '11-25': '11-25',
  '26-50': '26-50',
  '51-100': '51-100',
  '100+': '100+',
};

export function PracticeSizeFilter() {
  const { practiceSizes, togglePracticeSize } = useListBuilderStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-900 dark:text-white">Practice Size</span>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-2">
          {PRACTICE_SIZES.map((size) => {
            const isSelected = practiceSizes.includes(size);
            return (
              <label
                key={size}
                className={cn(
                  'flex items-center justify-center py-2.5 px-2 border rounded-lg cursor-pointer transition-all text-center',
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePracticeSize(size)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{SIZE_LABELS[size] || size}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
