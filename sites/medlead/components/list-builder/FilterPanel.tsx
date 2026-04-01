'use client';

import { SpecialtyFilter } from './SpecialtyFilter';
import { LocationTabs } from './LocationTabs';
import { ProviderTypeFilter } from './ProviderTypeFilter';
import { FacilityTypeFilter } from './FacilityTypeFilter';
import { PracticeSizeFilter } from './PracticeSizeFilter';
import { DataRequirements } from './DataRequirements';
import { PricingPanel } from './PricingPanel';
import { HelpCard } from './HelpCard';

export function FilterPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SpecialtyFilter />
        <LocationTabs />
        <div className="space-y-4">
          <DataRequirements />
          <PracticeSizeFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProviderTypeFilter />
        <FacilityTypeFilter />
      </div>

      <div className="xl:hidden space-y-4">
        <PricingPanel />
        <HelpCard />
      </div>
    </div>
  );
}
