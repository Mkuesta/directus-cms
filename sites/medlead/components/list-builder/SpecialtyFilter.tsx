'use client';

import { useState, useMemo } from 'react';
import { Stethoscope, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useListBuilderStore, Specialty } from '@/stores/listBuilderStore';
import { cn } from '@/lib/utils';

export function SpecialtyFilter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { specialties, selectedSpecialties, toggleSpecialty, isLoadingOptions } = useListBuilderStore();

  const filteredSpecialties = useMemo(() => {
    if (!searchTerm) return specialties;
    const term = searchTerm.toLowerCase();
    return specialties.filter((spec) => {
      if (spec.name.toLowerCase().includes(term)) return true;
      if (spec.subcategories?.some(sub => sub.name.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [specialties, searchTerm]);

  const totalCount = useMemo(() => {
    return specialties.reduce((sum, spec) => {
      const parentCount = spec.count;
      const childrenCount = spec.subcategories?.reduce((s, c) => s + c.count, 0) || 0;
      return sum + parentCount + childrenCount;
    }, 0);
  }, [specialties]);

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const toggleExpanded = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const hasSelectedChildren = (specialty: Specialty) => {
    return specialty.subcategories?.some(sub => selectedSpecialties.includes(sub.id)) || false;
  };

  const getSelectedCount = (specialty: Specialty) => {
    let count = selectedSpecialties.includes(specialty.id) ? 1 : 0;
    count += specialty.subcategories?.filter(sub => selectedSpecialties.includes(sub.id)).length || 0;
    return count;
  };

  useMemo(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const toExpand = specialties
        .filter(spec => spec.subcategories?.some(sub => sub.name.toLowerCase().includes(term)))
        .map(spec => spec.id);
      setExpandedCategories(prev => [...new Set([...prev, ...toExpand])]);
    }
  }, [searchTerm, specialties]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[420px]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Specialties
          </label>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {formatCount(totalCount)}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
            placeholder="Search (e.g., Cardiology)"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {isLoadingOptions ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSpecialties.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-500">
            No specialties found
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filteredSpecialties.map((specialty) => {
              const hasSubcategories = specialty.subcategories && specialty.subcategories.length > 0;
              const isExpanded = expandedCategories.includes(specialty.id);
              const isSelected = selectedSpecialties.includes(specialty.id);
              const selectedChildCount = getSelectedCount(specialty);

              return (
                <li key={specialty.id}>
                  <div className="flex items-center">
                    {hasSubcategories && (
                      <button
                        onClick={() => toggleExpanded(specialty.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    )}
                    <label
                      className={cn(
                        "flex-1 flex items-center px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group transition-colors",
                        !hasSubcategories && "ml-5"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSpecialty(specialty.id)}
                        className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 accent-primary"
                      />
                      <span className={cn(
                        "ml-3 text-sm group-hover:text-slate-900 dark:group-hover:text-white font-medium",
                        isSelected || hasSelectedChildren(specialty) ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {specialty.name}
                      </span>
                      {selectedChildCount > 0 && !isSelected && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {selectedChildCount}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-slate-400">
                        {formatCount(specialty.count + (specialty.subcategories?.reduce((s, c) => s + c.count, 0) || 0))}
                      </span>
                    </label>
                  </div>

                  {hasSubcategories && isExpanded && (
                    <ul className="ml-5 border-l-2 border-slate-100 dark:border-slate-700 pl-2 mt-1 space-y-0.5">
                      {specialty.subcategories?.map((sub) => {
                        const isSubSelected = selectedSpecialties.includes(sub.id);
                        if (searchTerm && !sub.name.toLowerCase().includes(searchTerm.toLowerCase())) return null;
                        return (
                          <li key={sub.id}>
                            <label className="flex items-center px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group transition-colors">
                              <input
                                type="checkbox"
                                checked={isSubSelected}
                                onChange={() => toggleSpecialty(sub.id)}
                                className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 accent-primary"
                              />
                              <span className={cn(
                                "ml-3 text-sm group-hover:text-slate-900 dark:group-hover:text-white",
                                isSubSelected ? "font-medium text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                              )}>
                                {sub.name}
                              </span>
                              <span className="ml-auto text-xs text-slate-400">{formatCount(sub.count)}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {filteredSpecialties.length > 6 && (
          <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}
