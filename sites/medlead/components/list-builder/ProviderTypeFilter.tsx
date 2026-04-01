'use client';

import { useListBuilderStore, PROVIDER_TYPES } from '@/stores/listBuilderStore';
import { UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  physician: 'Physician',
  nurse_practitioner: 'Nurse Practitioner',
  physician_assistant: 'Physician Assistant',
  pharmacist: 'Pharmacist',
  dentist: 'Dentist',
  optometrist: 'Optometrist',
  chiropractor: 'Chiropractor',
  therapist: 'Therapist',
};

export function ProviderTypeFilter() {
  const { providerTypes, toggleProviderType } = useListBuilderStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-900 dark:text-white">Provider Type</span>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {PROVIDER_TYPES.map((type) => {
            const isSelected = providerTypes.includes(type);
            return (
              <label
                key={type}
                className={cn(
                  'flex items-center justify-center py-2 px-2 border rounded-lg cursor-pointer transition-all text-center',
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProviderType(type)}
                  className="sr-only"
                />
                <span className="text-xs font-medium">{TYPE_LABELS[type] || type}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
