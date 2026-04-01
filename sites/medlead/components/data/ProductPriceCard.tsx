'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

// Map product slugs to specialty filters for CSV generation
const PRODUCT_FILTERS: Record<string, string[]> = {
  'physicians-email-list-usa': [
    'Internal Medicine', 'Family Medicine', 'Dermatology', 'Obstetrics/Gynecology',
    'Ophthalmology', 'Psychiatry', 'Pediatrics', 'Anesthesiology', 'Emergency Medicine',
    'Nuclear Medicine', 'Allergy/Immunology', 'Radiology', 'Gastroenterology',
    'Other Physician Specialty',
  ],
  'dentists-email-list-usa': [
    'General Dentist', 'Pediatric Dentist', 'Oral Surgery', 'Orthodontics',
    'Endodontics', 'Periodontics', 'Other Dentist',
  ],
  'nurses-email-list-usa': [
    'Family Nurse Practitioner', 'Nurse Practitioner', 'Registered Nurse',
    'Physician Assistant', 'Clinical Nurse Specialist', 'Nurse Anesthetist (CRNA)',
    'Other Nursing',
  ],
  'healthcare-executive-data-package': [
    'Neurological Surgery', 'Orthopedic Surgery', 'General Surgery',
    'Urology', 'Thoracic Surgery', 'Colon/Rectal Surgery',
  ],
  'pharmacists-email-list-usa': ['Pharmacist'],
};

interface ProductPriceCardProps {
  id: number | string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  leadCount?: number;
}

export default function ProductPriceCard({ id, title, slug, price, compareAtPrice, leadCount }: ProductPriceCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const filterConfig = {
    specialties: PRODUCT_FILTERS[slug] || [],
    states: [],
    locations: [],
    radiusSearch: null,
    providerTypes: [],
    facilityTypes: [],
    practiceSizes: [],
    dataRequirements: { emailVerified: false, phoneVerified: false, npiVerified: true },
  };

  const cartItem = {
    id: `product-${slug}`,
    title,
    slug,
    price,
    type: 'healthcare-list' as const,
    listConfig: {
      filterConfig,
      leadCount: leadCount || 0,
      pricePerLead: leadCount ? price / leadCount : 0,
    },
  };

  const handleAddToCart = () => {
    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(cartItem);
    router.push('/checkout');
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sticky top-28">
      <div className="mb-6">
        {compareAtPrice && compareAtPrice > price && (
          <div className="flex items-center gap-3 mb-1">
            <span className="text-lg text-gray-400 line-through">${compareAtPrice}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
              Save ${compareAtPrice - price}
            </span>
          </div>
        )}
        <span className="text-4xl font-bold text-gray-900 dark:text-white">${price}</span>
        <span className="text-gray-500 ml-1">one-time</span>
      </div>

      <button
        onClick={handleBuyNow}
        className="block w-full text-center bg-primary hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-3 cursor-pointer"
      >
        Buy Now
      </button>
      <button
        onClick={handleAddToCart}
        className="block w-full text-center bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 cursor-pointer mb-3"
      >
        {added ? 'Added to Cart!' : 'Add to Cart'}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Or call 1-888-664-9690 for custom pricing
      </p>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined text-primary text-lg">verified</span>
          95%+ email deliverability
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined text-primary text-lg">update</span>
          Monthly data updates
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="material-symbols-outlined text-primary text-lg">shield</span>
          CAN-SPAM & GDPR compliant
        </div>
      </div>
    </div>
  );
}
