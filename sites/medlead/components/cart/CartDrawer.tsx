'use client';

import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export function CartDrawer() {
  const { items, removeItem, totalItems, subtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Cart ({totalItems})
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Your cart is empty</p>
                  <Link
                    href="/list-builder"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                  >
                    Build a Lead List
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                        {item.listConfig && (
                          <p className="text-xs text-slate-500 mt-1">
                            {item.listConfig.leadCount.toLocaleString('en-US')} leads @ {formatCurrency(item.listConfig.pricePerLead)}/lead
                          </p>
                        )}
                        <p className="text-sm font-bold text-primary mt-1">{formatCurrency(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-start p-1 text-slate-400 hover:text-red-500 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Subtotal</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-3 bg-secondary hover:bg-green-600 text-white font-semibold rounded-lg transition"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2 text-sm text-slate-500 hover:text-slate-700 transition"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
