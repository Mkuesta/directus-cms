'use client';

import { useListBuilderStore, PricingTier } from '@/stores/listBuilderStore';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { TrendingDown, Package, ShoppingCart, Lock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const DEFAULT_PRICING_TIERS: PricingTier[] = [
  { min: 1, max: 100, price: 0.45, label: 'Starter' },
  { min: 101, max: 500, price: 0.35, label: 'Growth' },
  { min: 501, max: 2000, price: 0.25, label: 'Business' },
  { min: 2001, max: 10000, price: 0.18, label: 'Enterprise' },
  { min: 10001, max: null, price: 0.12, label: 'Enterprise+' },
];

function getCurrentTierIndex(count: number, tiers: PricingTier[]): number {
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i].max === null) return i;
    if (count <= tiers[i].max!) return i;
  }
  return tiers.length - 1;
}

export function PricingPanel() {
  const router = useRouter();
  const { addItem } = useCart();
  const {
    leadCount, pricePerLead, totalPrice, pricingTiers,
    isLoading, hasActiveFilters, getFilterConfig, dataRequirements,
  } = useListBuilderStore();
  const [showTiers, setShowTiers] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const tiers = pricingTiers.length > 0 ? pricingTiers : DEFAULT_PRICING_TIERS;
  const currentTierIndex = getCurrentTierIndex(leadCount, tiers);
  const nextTier = tiers[currentTierIndex + 1];
  const leadsToNextTier = nextTier ? nextTier.min - leadCount : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getDataQualityLabel = () => {
    const count = [dataRequirements.emailVerified, dataRequirements.phoneVerified, dataRequirements.npiVerified].filter(Boolean).length;
    if (count >= 2) return { label: 'Excellent', color: 'text-green-600' };
    if (count === 1) return { label: 'Good', color: 'text-primary' };
    return { label: 'Standard', color: 'text-slate-500' };
  };

  const handleAddToCart = () => {
    if (leadCount === 0) return;
    const filterConfig = getFilterConfig();
    addItem({
      id: `healthcare-list-${Date.now()}`,
      title: `Healthcare Lead List (${leadCount.toLocaleString('en-US')} leads)`,
      slug: 'healthcare-lead-list',
      price: totalPrice,
      type: 'healthcare-list',
      listConfig: { filterConfig, leadCount, pricePerLead },
    });
    router.push('/cart');
  };

  const dataQuality = getDataQualityLabel();
  const canAddToCart = hasActiveFilters() && leadCount > 0 && !isLoading;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> Summary
        </h3>
      </div>
      <div className="p-5">
        {!mounted || isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !hasActiveFilters() ? (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Select filters to calculate pricing.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Lead Count</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{leadCount.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Price per Lead</span>
                <span className="text-base font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(pricePerLead)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Data Quality</span>
                <span className={cn('text-base font-semibold', dataQuality.color)}>{dataQuality.label}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                    <p className="text-xs text-slate-500 mt-0.5">one-time payment</p>
                  </div>
                </div>
              </div>
            </div>

            {nextTier && leadsToNextTier > 0 && leadsToNextTier < 500 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 leading-relaxed">
                    <span className="font-semibold">Tip:</span> Just {leadsToNextTier.toLocaleString('en-US')} more leads to unlock {formatCurrency(nextTier.price)} per lead!
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={cn(
                'w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all group',
                canAddToCart
                  ? 'bg-secondary hover:bg-green-600 shadow-lg shadow-secondary/25'
                  : 'bg-slate-300 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
              <ArrowRight className={cn('w-5 h-5 transition-transform', canAddToCart && 'group-hover:translate-x-1')} />
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure SSL encryption</span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setShowTiers(!showTiers)} className="flex items-center justify-between w-full text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume Discounts</span>
                {showTiers ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showTiers && (
                <div className="space-y-2 mt-3">
                  {tiers.map((tier, index) => (
                    <div key={tier.label} className={cn(
                      'flex justify-between items-center text-xs py-1.5 px-2 rounded',
                      index === currentTierIndex ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500'
                    )}>
                      <span>{tier.max === null ? `${tier.min.toLocaleString('en-US')}+` : `${tier.min.toLocaleString('en-US')} - ${tier.max.toLocaleString('en-US')}`}</span>
                      <span className="font-medium">{formatCurrency(tier.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
