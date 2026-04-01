'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useListBuilderStore } from '@/stores/listBuilderStore';
import {
  FilterPanel,
  ActiveFilters,
  PreviewTable,
  PricingPanel,
  HelpCard,
  StickyFooter,
} from '@/components/list-builder';

export default function ListBuilderPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    selectedSpecialties, selectedStates, selectedLocations,
    radiusSearch, providerTypes, facilityTypes, practiceSizes, dataRequirements,
    setSpecialties, setStates, setLocations,
    setPricingResult, setPreviewData,
    setLoading, setLoadingPreview, setLoadingOptions, setError,
    getFilterConfig, hasActiveFilters,
  } = useListBuilderStore();

  const initialLoadDone = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch specialties and states on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [specialtiesRes, statesRes, locationsRes] = await Promise.all([
          fetch('/api/list-builder/specialties'),
          fetch('/api/list-builder/states'),
          fetch('/api/list-builder/locations'),
        ]);

        if (specialtiesRes.ok) {
          const data = await specialtiesRes.json();
          setSpecialties(data.specialties || []);
        }
        if (statesRes.ok) {
          const data = await statesRes.json();
          setStates(data.states || []);
        }
        if (locationsRes.ok) {
          const data = await locationsRes.json();
          setLocations(data.locations || []);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
        setError('Failed to load filter options');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [setSpecialties, setStates, setLocations, setLoadingOptions, setError]);

  // Fetch count and preview when filters change
  const fetchResults = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();

    if (!hasActiveFilters()) {
      setPricingResult({ count: 0, pricePerLead: 0, totalPrice: 0, tier: '' });
      setPreviewData([]);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setLoadingPreview(true);

    const filterConfig = getFilterConfig();

    try {
      const [countRes, previewRes] = await Promise.all([
        fetch('/api/list-builder/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterConfig),
          signal: controller.signal,
        }),
        fetch('/api/list-builder/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterConfig),
          signal: controller.signal,
        }),
      ]);

      if (countRes.ok) {
        const data = await countRes.json();
        setPricingResult({
          count: data.count,
          pricePerLead: data.pricePerLead,
          totalPrice: data.totalPrice,
          tier: data.tier,
          tiers: data.tiers,
        });
      }

      if (previewRes.ok) {
        const data = await previewRes.json();
        setPreviewData(data.preview || []);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch results:', error);
        setError('Failed to update results');
      }
    } finally {
      setLoading(false);
      setLoadingPreview(false);
    }
  }, [hasActiveFilters, getFilterConfig, setPricingResult, setPreviewData, setLoading, setLoadingPreview, setError]);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => { fetchResults(); }, 300);
    return () => clearTimeout(timer);
  }, [selectedSpecialties, selectedStates, selectedLocations, radiusSearch, providerTypes, facilityTypes, practiceSizes, dataRequirements, fetchResults]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background-dark pt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                  <div className="hidden sm:block space-y-1">
                    <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                  </div>
                  {i < 3 && <div className="h-px w-8 md:w-16 bg-slate-200 ml-2" />}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pt-8">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Build Your Healthcare Lead List
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Select specialties, locations, and filters to create a targeted list of verified healthcare professionals.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Specialty</p>
                <p className="text-xs text-slate-500">Choose target</p>
              </div>
            </div>
            <div className="h-px w-8 md:w-16 bg-slate-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-500">Location</p>
                <p className="text-xs text-slate-400">Narrow by region</p>
              </div>
            </div>
            <div className="h-px w-8 md:w-16 bg-slate-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-500">Refine</p>
                <p className="text-xs text-slate-400">Data quality & size</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="mb-6">
          <ActiveFilters />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <FilterPanel />
            <div className="mt-8">
              <PreviewTable />
            </div>
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <PricingPanel />
              <HelpCard />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer for mobile */}
      <StickyFooter />
    </div>
  );
}
