'use client';

import { useListBuilderStore } from '@/stores/listBuilderStore';
import { useCart } from '@/contexts/CartContext';
import { Lock, ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function StickyFooter() {
  const router = useRouter();
  const { addItem } = useCart();
  const {
    leadCount, pricePerLead, totalPrice,
    isLoading, hasActiveFilters, getFilterConfig,
  } = useListBuilderStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

  const canAddToCart = hasActiveFilters() && leadCount > 0 && !isLoading;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="xl:hidden flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" />
            ) : (
              <>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{leadCount.toLocaleString('en-US')}</span>
                <span className="text-sm text-slate-500">leads</span>
              </>
            )}
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-baseline gap-1">
            {isLoading ? (
              <div className="h-6 w-20 bg-slate-200 animate-pulse rounded" />
            ) : (
              <span className="text-lg font-bold text-primary">{formatCurrency(totalPrice)}</span>
            )}
          </div>
        </div>
        <div className="hidden xl:flex items-center gap-2 text-sm text-slate-500">
          <Lock className="w-4 h-4" />
          <span>Secure SSL Payment</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className={cn(
            'font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all flex items-center gap-2 group',
            canAddToCart
              ? 'bg-secondary hover:bg-green-600 text-white shadow-secondary/20 active:scale-95'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
          <ArrowRight className={cn('w-4 h-4 transition-transform', canAddToCart && 'group-hover:translate-x-1')} />
        </button>
      </div>
    </div>
  );
}
