'use client';

import { useListBuilderStore } from '@/stores/listBuilderStore';
import { Settings, Mail, Phone, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DataRequirements() {
  const { dataRequirements, setDataRequirement } = useListBuilderStore();

  const requirements = [
    {
      key: 'emailVerified' as const,
      label: 'Verified Email',
      description: '100% deliverability guarantee',
      icon: Mail,
    },
    {
      key: 'phoneVerified' as const,
      label: 'Verified Phone',
      description: 'Direct line, no switchboard',
      icon: Phone,
    },
    {
      key: 'npiVerified' as const,
      label: 'NPI Verified',
      description: 'National Provider Identifier confirmed',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-900 dark:text-white">Data Quality</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Verification Requirements
        </p>
        <div className="space-y-2">
          {requirements.map((req) => {
            const isActive = dataRequirements[req.key];
            return (
              <label
                key={req.key}
                className={cn(
                  'flex items-start cursor-pointer p-2 rounded-lg border transition-all',
                  isActive
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'
                )}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setDataRequirement(req.key, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
                />
                <div className="ml-2.5 flex-1 min-w-0">
                  <span className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                  )}>
                    {req.label}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{req.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
