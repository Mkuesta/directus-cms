import React, { useState, useCallback } from 'react';
import { useCart } from './CartProvider.js';
import type { CartItem } from '../types.js';

interface AddToCartButtonProps {
  /** Product data to add */
  item: Omit<CartItem, 'id' | 'quantity'> & { id?: string; quantity?: number };
  /** Button label (default: 'Add to Cart') */
  label?: string;
  /** Label shown after adding (default: 'Added!') */
  addedLabel?: string;
  /** Duration in ms to show "Added!" state (default: 2000) */
  addedDuration?: number;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Disabled state */
  disabled?: boolean;
  /** Callback after item is added */
  onAdd?: (item: CartItem) => void;
}

export function AddToCartButton({
  item,
  label = 'Add to Cart',
  addedLabel = 'Added!',
  addedDuration = 2000,
  className,
  style,
  disabled,
  onAdd,
}: AddToCartButtonProps) {
  const { addItem, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = useCallback(() => {
    const id = item.id || item.slug;
    const cartItem: CartItem = { ...item, id, quantity: item.quantity || 1 };
    addItem(item);
    onAdd?.(cartItem);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), addedDuration);
  }, [item, addItem, onAdd, addedDuration]);

  const inCart = isInCart(item.slug);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || justAdded}
      className={className}
      style={style}
      aria-label={justAdded ? addedLabel : label}
    >
      {justAdded ? addedLabel : inCart ? label : label}
    </button>
  );
}
