import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface SubSpecialty {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  count: number;
  subcategories?: SubSpecialty[];
}

export interface Location {
  id: string;
  name: string;
  type: 'city' | 'state' | 'zip';
  count: number;
}

export interface USState {
  id: string;
  name: string;
  code: string;
  count: number;
}

export interface RadiusSearch {
  zip: string;
  radiusMiles: number;
}

export interface DataRequirements {
  emailVerified: boolean;
  phoneVerified: boolean;
  npiVerified: boolean;
}

export interface FilterConfig {
  specialties: string[];
  states: string[];
  locations: string[];
  radiusSearch: RadiusSearch | null;
  providerTypes: string[];
  facilityTypes: string[];
  practiceSizes: string[];
  dataRequirements: DataRequirements;
}

export interface PreviewLead {
  id: string;
  providerName: string;
  credential: string;
  specialty: string;
  facilityType: string;
  city: string;
  state: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  npiVerified: boolean;
  practiceSize: string;
}

export interface PricingTier {
  min: number;
  max: number | null;
  price: number;
  label: string;
}

export interface PricingResult {
  count: number;
  pricePerLead: number;
  totalPrice: number;
  tier: string;
  tiers?: PricingTier[];
}

interface ListBuilderState {
  // Filter selections
  selectedSpecialties: string[];
  selectedStates: string[];
  selectedLocations: string[];
  radiusSearch: RadiusSearch | null;
  providerTypes: string[];
  facilityTypes: string[];
  practiceSizes: string[];
  dataRequirements: DataRequirements;

  // Available options (loaded from API)
  specialties: Specialty[];
  states: USState[];
  locations: Location[];

  // Results
  leadCount: number;
  pricePerLead: number;
  totalPrice: number;
  pricingTier: string;
  pricingTiers: PricingTier[];

  // Preview data
  previewData: PreviewLead[];

  // UI state
  isLoading: boolean;
  isLoadingPreview: boolean;
  isLoadingOptions: boolean;
  error: string | null;

  // Actions
  toggleSpecialty: (specialtyId: string) => void;
  toggleState: (stateCode: string) => void;
  toggleLocation: (locationId: string) => void;
  setRadiusSearch: (search: RadiusSearch | null) => void;
  toggleProviderType: (type: string) => void;
  toggleFacilityType: (type: string) => void;
  togglePracticeSize: (size: string) => void;
  setDataRequirement: (key: keyof DataRequirements, value: boolean) => void;
  resetFilters: () => void;

  // Data setters
  setSpecialties: (specialties: Specialty[]) => void;
  setStates: (states: USState[]) => void;
  setLocations: (locations: Location[]) => void;
  setPricingResult: (result: PricingResult) => void;
  setPricingTiers: (tiers: PricingTier[]) => void;
  setPreviewData: (data: PreviewLead[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingPreview: (loading: boolean) => void;
  setLoadingOptions: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Helpers
  getFilterConfig: () => FilterConfig;
  hasActiveFilters: () => boolean;
}

const initialDataRequirements: DataRequirements = {
  emailVerified: false,
  phoneVerified: false,
  npiVerified: false,
};

export const PROVIDER_TYPES = [
  'physician',
  'nurse_practitioner',
  'physician_assistant',
  'pharmacist',
  'dentist',
  'optometrist',
  'chiropractor',
  'therapist',
] as const;

export const FACILITY_TYPES = [
  'hospital',
  'clinic',
  'private_practice',
  'group_practice',
  'urgent_care',
  'pharmacy',
  'nursing_facility',
  'lab',
] as const;

export const PRACTICE_SIZES = [
  'solo',
  '2-5',
  '6-10',
  '11-25',
  '26-50',
  '51-100',
  '100+',
] as const;

export const useListBuilderStore = create<ListBuilderState>()(
  persist(
    (set, get) => ({
      selectedSpecialties: [],
      selectedStates: [],
      selectedLocations: [],
      radiusSearch: null,
      providerTypes: [],
      facilityTypes: [],
      practiceSizes: [],
      dataRequirements: { ...initialDataRequirements },

      specialties: [],
      states: [],
      locations: [],

      leadCount: 0,
      pricePerLead: 0,
      totalPrice: 0,
      pricingTier: '',
      pricingTiers: [],

      previewData: [],

      isLoading: false,
      isLoadingPreview: false,
      isLoadingOptions: false,
      error: null,

      toggleSpecialty: (specialtyId) => {
        set((state) => ({
          selectedSpecialties: state.selectedSpecialties.includes(specialtyId)
            ? state.selectedSpecialties.filter((id) => id !== specialtyId)
            : [...state.selectedSpecialties, specialtyId],
        }));
      },

      toggleState: (stateCode) => {
        set((state) => ({
          selectedStates: state.selectedStates.includes(stateCode)
            ? state.selectedStates.filter((s) => s !== stateCode)
            : [...state.selectedStates, stateCode],
        }));
      },

      toggleLocation: (locationId) => {
        set((state) => ({
          selectedLocations: state.selectedLocations.includes(locationId)
            ? state.selectedLocations.filter((id) => id !== locationId)
            : [...state.selectedLocations, locationId],
        }));
      },

      setRadiusSearch: (search) => set({ radiusSearch: search }),

      toggleProviderType: (type) => {
        set((state) => ({
          providerTypes: state.providerTypes.includes(type)
            ? state.providerTypes.filter((t) => t !== type)
            : [...state.providerTypes, type],
        }));
      },

      toggleFacilityType: (type) => {
        set((state) => ({
          facilityTypes: state.facilityTypes.includes(type)
            ? state.facilityTypes.filter((t) => t !== type)
            : [...state.facilityTypes, type],
        }));
      },

      togglePracticeSize: (size) => {
        set((state) => ({
          practiceSizes: state.practiceSizes.includes(size)
            ? state.practiceSizes.filter((s) => s !== size)
            : [...state.practiceSizes, size],
        }));
      },

      setDataRequirement: (key, value) => {
        set((state) => ({
          dataRequirements: { ...state.dataRequirements, [key]: value },
        }));
      },

      resetFilters: () => {
        set({
          selectedSpecialties: [],
          selectedStates: [],
          selectedLocations: [],
          radiusSearch: null,
          providerTypes: [],
          facilityTypes: [],
          practiceSizes: [],
          dataRequirements: { ...initialDataRequirements },
          leadCount: 0,
          pricePerLead: 0,
          totalPrice: 0,
          pricingTier: '',
          previewData: [],
          error: null,
        });
      },

      setSpecialties: (specialties) => set({ specialties }),
      setStates: (states) => set({ states }),
      setLocations: (locations) => set({ locations }),
      setPricingResult: (result) =>
        set({
          leadCount: result.count,
          pricePerLead: result.pricePerLead,
          totalPrice: result.totalPrice,
          pricingTier: result.tier,
          ...(result.tiers && { pricingTiers: result.tiers }),
        }),
      setPricingTiers: (pricingTiers) => set({ pricingTiers }),
      setPreviewData: (previewData) => set({ previewData }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingPreview: (isLoadingPreview) => set({ isLoadingPreview }),
      setLoadingOptions: (isLoadingOptions) => set({ isLoadingOptions }),
      setError: (error) => set({ error }),

      getFilterConfig: (): FilterConfig => {
        const state = get();
        return {
          specialties: state.selectedSpecialties,
          states: state.selectedStates,
          locations: state.selectedLocations,
          radiusSearch: state.radiusSearch,
          providerTypes: state.providerTypes,
          facilityTypes: state.facilityTypes,
          practiceSizes: state.practiceSizes,
          dataRequirements: state.dataRequirements,
        };
      },

      hasActiveFilters: (): boolean => {
        const state = get();
        return (
          state.selectedSpecialties.length > 0 ||
          state.selectedStates.length > 0 ||
          state.selectedLocations.length > 0 ||
          state.radiusSearch !== null ||
          state.providerTypes.length > 0 ||
          state.facilityTypes.length > 0 ||
          state.practiceSizes.length > 0 ||
          state.dataRequirements.emailVerified ||
          state.dataRequirements.phoneVerified ||
          state.dataRequirements.npiVerified
        );
      },
    }),
    {
      name: 'medlead-list-builder',
      partialize: (state) => ({
        selectedSpecialties: state.selectedSpecialties,
        selectedStates: state.selectedStates,
        selectedLocations: state.selectedLocations,
        radiusSearch: state.radiusSearch,
        providerTypes: state.providerTypes,
        facilityTypes: state.facilityTypes,
        practiceSizes: state.practiceSizes,
        dataRequirements: state.dataRequirements,
      }),
    }
  )
);
