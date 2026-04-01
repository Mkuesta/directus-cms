'use client';

import { useState, useMemo } from 'react';
import { useListBuilderStore } from '@/stores/listBuilderStore';
import { MapPin, Search, Navigation, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'state' | 'city' | 'zip';

export function LocationTabs() {
  const {
    states,
    selectedStates,
    toggleState,
    locations,
    selectedLocations,
    toggleLocation,
    radiusSearch,
    setRadiusSearch,
    isLoadingOptions,
  } = useListBuilderStore();

  const [activeTab, setActiveTab] = useState<TabType>('state');
  const [searchTerm, setSearchTerm] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [radiusValue, setRadiusValue] = useState(radiusSearch?.radiusMiles || 50);

  const filteredStates = useMemo(() => {
    return states.filter((st) =>
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [states, searchTerm]);

  const filteredCities = useMemo(() => {
    if (!searchTerm) return locations.slice(0, 20);
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
  }, [locations, searchTerm]);

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleRadiusCommit = () => {
    if (zipInput.trim() && /^\d{5}$/.test(zipInput.trim())) {
      setRadiusSearch({
        zip: zipInput.trim(),
        radiusMiles: radiusValue === 300 ? 9999 : radiusValue,
      });
    }
  };

  const tabs = [
    { id: 'state' as TabType, label: 'State' },
    { id: 'city' as TabType, label: 'City' },
    { id: 'zip' as TabType, label: 'Zip / Radius' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[420px]">
      <div className="p-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-900 dark:text-white">Locations</span>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={cn(
                'flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all',
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'state' && (
          <>
            <div className="p-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {isLoadingOptions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredStates.map((st) => {
                    const isSelected = selectedStates.includes(st.code);
                    return (
                      <label
                        key={st.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleState(st.code)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className={cn('text-sm', isSelected ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>
                            {st.name} ({st.code})
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{formatCount(st.count)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none -mb-3" />
            </div>
          </>
        )}

        {activeTab === 'city' && (
          <>
            <div className="p-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cities (e.g., Houston, Los Angeles)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {isLoadingOptions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredCities.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  {searchTerm ? 'No cities found' : 'Enter a city name to search'}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredCities.map((city) => {
                    const isSelected = selectedLocations.includes(city.id);
                    return (
                      <label
                        key={city.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleLocation(city.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className={cn('text-sm', isSelected ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>
                            {city.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{formatCount(city.count)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none -mb-3" />
            </div>
          </>
        )}

        {activeTab === 'zip' && (
          <div className="p-3 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Zip Code Radius Search
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter zip code (e.g., 77001)"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  onKeyDown={(e) => e.key === 'Enter' && handleRadiusCommit()}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleRadiusCommit}
                  disabled={!/^\d{5}$/.test(zipInput)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    /^\d{5}$/.test(zipInput)
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  )}
                >
                  Search
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  Radius
                </label>
                <span className="text-sm font-medium text-primary">
                  {radiusValue === 300 ? 'All' : `${radiusValue} mi`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={radiusValue}
                onChange={(e) => setRadiusValue(Number(e.target.value))}
                onMouseUp={handleRadiusCommit}
                onTouchEnd={handleRadiusCommit}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span>
                <span>50 mi</span>
                <span>100 mi</span>
                <span>200 mi</span>
                <span>All</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Enter a zip code above and select the search radius in miles.
              </p>
            </div>

            {radiusSearch && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {radiusSearch.radiusMiles >= 9999 ? 'All' : `${radiusSearch.radiusMiles} mi`} around {radiusSearch.zip}
                    </span>
                  </div>
                  <button onClick={() => setRadiusSearch(null)} className="text-primary hover:opacity-70">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
