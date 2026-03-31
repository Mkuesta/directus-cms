import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, CartConfig, CartContextValue } from '../types.js';

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps extends CartConfig {
  children: ReactNode;
  onItemAdded?: (item: CartItem) => void;
  onItemRemoved?: (item: CartItem) => void;
  onCartCleared?: () => void;
}

export function CartProvider({
  children,
  storageKey = 'directus-cms-cart',
  maxItems = 50,
  allowDuplicates = true,
  onItemAdded,
  onItemRemoved,
  onCartCleared,
}: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors or SSR
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  }, [items, storageKey, hydrated]);

  const addItem = useCallback(
    (input: Omit<CartItem, 'id' | 'quantity'> & { id?: string; quantity?: number }) => {
      setItems((prev) => {
        const id = input.id || input.slug;
        const quantity = input.quantity || 1;
        const existing = prev.find((i) => i.id === id);

        if (existing) {
          if (!allowDuplicates) return prev;
          return prev.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }

        if (prev.length >= maxItems) return prev;

        const newItem: CartItem = { ...input, id, quantity };
        onItemAdded?.(newItem);
        return [...prev, newItem];
      });
    },
    [maxItems, allowDuplicates, onItemAdded],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) onItemRemoved?.(item);
        return prev.filter((i) => i.id !== id);
      });
    },
    [onItemRemoved],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    onCartCleared?.();
  }, [onCartCleared]);

  const isInCart = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items],
  );

  const getItemBySlug = useCallback(
    (slug: string) => items.find((i) => i.slug === slug),
    [items],
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalCents,
        isEmpty,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemBySlug,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>');
  }
  return context;
}
