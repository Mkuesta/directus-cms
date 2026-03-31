import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem } from '../types.js';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id'> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
  storageKey?: string;
  maxItems?: number;
  onItemAdded?: (item: CartItem) => void;
  onItemRemoved?: (item: CartItem) => void;
  onCartCleared?: () => void;
}

export function CartProvider({
  children,
  storageKey = 'directus-cms-cart',
  maxItems = 50,
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
      // Ignore parse errors
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
    (item: Omit<CartItem, 'id'> & { id?: string }) => {
      setItems((prev) => {
        const id = item.id || `${item.name}-${item.productSlug || Date.now()}`;
        const existing = prev.find((i) => i.id === id);

        if (existing) {
          return prev.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i,
          );
        }

        if (prev.length >= maxItems) return prev;

        const newItem: CartItem = { ...item, id, quantity: item.quantity || 1 };
        onItemAdded?.(newItem);
        return [...prev, newItem];
      });
    },
    [maxItems, onItemAdded],
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

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
