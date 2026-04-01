'use client';

import { useMemo, useState, useEffect } from 'react';
import { Filter, X, RotateCcw, CheckCircle, Stethoscope, MapPin, Users, Navigation, Building2, UserCheck } from 'lucide-react';
import { useListBuilderStore } from '@/stores/listBuilderStore';
import { cn } from '@/lib/utils';

interface FilterChip {
  id: string;
  label: string;
  type: 'specialty' | 'state' | 'location' | 'radius' | 'provider' | 'facility' | 'practice' | 'data';
  icon?: React.ComponentType<{ className?: string }>;
  onRemove: () => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  physician: 'Physician', nurse_practitioner: 'NP', physician_assistant: 'PA',
  pharmacist: 'Pharmacist', dentist: 'Dentist', optometrist: 'Optometrist',
  chiropractor: 'Chiropractor', therapist: 'Therapist',
};

const FACILITY_LABELS: Record<string, string> = {
  hospital: 'Hospital', clinic: 'Clinic', private_practice: 'Private Practice',
  group_practice: 'Group Practice', urgent_care: 'Urgent Care', pharmacy: 'Pharmacy',
  nursing_facility: 'Nursing Facility', lab: 'Lab',
};

export function ActiveFilters() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    selectedSpecialties, selectedStates, selectedLocations, radiusSearch,
    providerTypes, facilityTypes, practiceSizes, dataRequirements,
    specialties, states, locations,
    toggleSpecialty, toggleState, toggleLocation, setRadiusSearch,
    toggleProviderType, toggleFacilityType, togglePracticeSize,
    setDataRequirement, resetFilters, hasActiveFilters,
  } = useListBuilderStore();

  const chips = useMemo(() => {
    const result: FilterChip[] = [];

    selectedSpecialties.forEach((id) => {
      const spec = specialties.find((s) => s.id === id);
      if (spec) {
        result.push({ id: `spec-${id}`, label: spec.name, type: 'specialty', icon: Stethoscope, onRemove: () => toggleSpecialty(id) });
      }
    });

    selectedStates.forEach((code) => {
      const st = states.find((s) => s.code === code);
      result.push({ id: `state-${code}`, label: st?.name || code, type: 'state', icon: MapPin, onRemove: () => toggleState(code) });
    });

    if (radiusSearch) {
      result.push({ id: 'radius', label: `${radiusSearch.radiusMiles >= 9999 ? 'All' : `${radiusSearch.radiusMiles} mi`} around ${radiusSearch.zip}`, type: 'radius', icon: Navigation, onRemove: () => setRadiusSearch(null) });
    }

    selectedLocations.forEach((id) => {
      const loc = locations.find((l) => l.id === id);
      if (loc) result.push({ id: `loc-${id}`, label: loc.name, type: 'location', icon: MapPin, onRemove: () => toggleLocation(id) });
    });

    providerTypes.forEach((type) => {
      result.push({ id: `prov-${type}`, label: PROVIDER_LABELS[type] || type, type: 'provider', icon: UserCheck, onRemove: () => toggleProviderType(type) });
    });

    facilityTypes.forEach((type) => {
      result.push({ id: `fac-${type}`, label: FACILITY_LABELS[type] || type, type: 'facility', icon: Building2, onRemove: () => toggleFacilityType(type) });
    });

    practiceSizes.forEach((size) => {
      result.push({ id: `size-${size}`, label: `Size: ${size}`, type: 'practice', icon: Users, onRemove: () => togglePracticeSize(size) });
    });

    if (dataRequirements.emailVerified) result.push({ id: 'data-email', label: 'Email Verified', type: 'data', icon: CheckCircle, onRemove: () => setDataRequirement('emailVerified', false) });
    if (dataRequirements.phoneVerified) result.push({ id: 'data-phone', label: 'Phone Verified', type: 'data', icon: CheckCircle, onRemove: () => setDataRequirement('phoneVerified', false) });
    if (dataRequirements.npiVerified) result.push({ id: 'data-npi', label: 'NPI Verified', type: 'data', icon: CheckCircle, onRemove: () => setDataRequirement('npiVerified', false) });

    return result;
  }, [selectedSpecialties, selectedStates, selectedLocations, radiusSearch, providerTypes, facilityTypes, practiceSizes, dataRequirements, specialties, states, locations, toggleSpecialty, toggleState, toggleLocation, setRadiusSearch, toggleProviderType, toggleFacilityType, togglePracticeSize, setDataRequirement]);

  if (!mounted || !hasActiveFilters()) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-4 h-4" /> Active Filters:
        </span>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <span key={chip.id} className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                chip.type === 'data' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                  : chip.type === 'radius' ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                  : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              )}>
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {chip.label}
                <button onClick={chip.onRemove} className="ml-1.5 hover:opacity-70" aria-label={`Remove: ${chip.label}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      </div>
      <button onClick={resetFilters} className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
        <RotateCcw className="w-3.5 h-3.5" /> Reset All
      </button>
    </div>
  );
}
