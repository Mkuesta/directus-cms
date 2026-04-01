'use client';

import { useListBuilderStore, FACILITY_TYPES } from '@/stores/listBuilderStore';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FACILITY_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  private_practice: 'Private Practice',
  group_practice: 'Group Practice',
  urgent_care: 'Urgent Care',
  pharmacy: 'Pharmacy',
  nursing_facility: 'Nursing Facility',
  lab: 'Lab / Diagnostic',
};

export function FacilityTypeFilter() {
  const { facilityTypes, toggleFacilityType } = useListBuilderStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-900 dark:text-white">Facility Type</span>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {FACILITY_TYPES.map((type) => {
            const isSelected = facilityTypes.includes(type);
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
                  onChange={() => toggleFacilityType(type)}
                  className="sr-only"
                />
                <span className="text-xs font-medium">{FACILITY_LABELS[type] || type}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
