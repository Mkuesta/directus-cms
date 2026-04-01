"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { FilterConfig } from "@/stores/listBuilderStore";

export interface ListConfig {
  filterConfig: FilterConfig;
  leadCount: number;
  pricePerLead: number;
}

export interface CartItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  type?: 'healthcare-list';
  listConfig?: ListConfig;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("medlead-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("medlead-cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) return current;
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) { removeItem(id); return; }
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.length;
  const subtotal = items.reduce((total, item) => total + Number(item.price), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
