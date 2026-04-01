'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Trash2, ArrowRight, Shield, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, subtotal, totalItems } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background-dark pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Cart is Empty</h1>
          <p className="text-slate-500 mb-8">Build a custom healthcare lead list to get started.</p>
          <Link
            href="/list-builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition"
          >
            Build Your List <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Your Cart ({totalItems})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    {item.listConfig && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {item.listConfig.leadCount.toLocaleString('en-US')} verified healthcare leads
                        </p>
                        <p className="text-sm text-slate-500">
                          Price per lead: {formatCurrency(item.listConfig.pricePerLead)}
                        </p>
                        {item.listConfig.filterConfig.specialties.length > 0 && (
                          <p className="text-xs text-slate-400">
                            Specialties: {item.listConfig.filterConfig.specialties.join(', ')}
                          </p>
                        )}
                        {item.listConfig.filterConfig.states.length > 0 && (
                          <p className="text-xs text-slate-400">
                            States: {item.listConfig.filterConfig.states.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-primary">{formatCurrency(item.price)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-2 text-sm text-slate-400 hover:text-red-500 flex items-center gap-1 transition ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center py-3 bg-secondary hover:bg-green-600 text-white font-semibold rounded-lg transition shadow-lg"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Download className="w-4 h-4 text-primary" />
                  <span>Instant download after payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Secure SSL payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
