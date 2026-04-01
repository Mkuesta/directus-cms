'use client';

import { useListBuilderStore } from '@/stores/listBuilderStore';
import { MailCheck, Phone, ShieldCheck, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  'bg-teal-100 text-teal-700', 'bg-emerald-100 text-emerald-700',
  'bg-cyan-100 text-cyan-700', 'bg-green-100 text-green-700',
  'bg-sky-100 text-sky-700', 'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700', 'bg-slate-100 text-slate-700',
];

function getInitials(name: string): string {
  const words = name.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function PreviewTable() {
  const { previewData, leadCount, isLoadingPreview, hasActiveFilters } = useListBuilderStore();

  if (!hasActiveFilters()) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Select Filters to Preview
        </h3>
        <p className="text-sm text-slate-500">
          Use the filters above to narrow down your target healthcare professionals.
          A preview will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preview</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLoadingPreview ? 'Loading...' : (
              <>
                Showing {previewData.length} of {leadCount.toLocaleString('en-US')} providers found
                <span className="text-slate-400"> (data partially masked)</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        {isLoadingPreview ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : previewData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Stethoscope className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Results</h3>
            <p className="text-sm text-slate-500">
              No providers found with the current filters. Try using fewer filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Provider</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Specialty</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Facility</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Verified</th>
                  <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {previewData.map((lead, index) => (
                  <tr key={lead.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold text-xs', COLORS[index % COLORS.length])}>
                          {getInitials(lead.providerName)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{lead.providerName}</div>
                          <div className="text-xs text-slate-400">{lead.city}, {lead.state} {lead.credential && `· ${lead.credential}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {lead.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{lead.facilityType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span title={lead.emailVerified ? "Email verified" : "Email not verified"}>
                          <MailCheck className={cn("w-4 h-4", lead.emailVerified ? "text-green-500" : "text-slate-300")} />
                        </span>
                        <span title={lead.phoneVerified ? "Phone verified" : "Phone not verified"}>
                          <Phone className={cn("w-4 h-4", lead.phoneVerified ? "text-green-500" : "text-slate-300")} />
                        </span>
                        <span title={lead.npiVerified ? "NPI verified" : "NPI not verified"}>
                          <ShieldCheck className={cn("w-4 h-4", lead.npiVerified ? "text-blue-500" : "text-slate-300")} />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{lead.practiceSize}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {previewData.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center">
            <span className="text-sm text-slate-500">
              After purchase, you&apos;ll get access to all {leadCount.toLocaleString('en-US')} records
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
