// ── CartItem: the core cart data model ──────────────────────────────────────

export interface CartItem {
  /** Unique identifier (default: generated from slug) */
  id: string;
  /** Display name */
  title: string;
  /** Product slug (used for deduplication) */
  slug: string;
  /** Price in cents (e.g. 2999 for €29.99) */
  priceCents: number;
  /** Quantity in cart */
  quantity: number;
  /** Image URL (optional) */
  imageUrl?: string;
  /** Additional metadata (e.g. file format, variant) */
  metadata?: Record<string, any>;
}

// ── CartConfig: passed to createCartProvider() ──────────────────────────────

export interface CartConfig {
  /** localStorage key (default: 'directus-cms-cart') */
  storageKey?: string;
  /** Maximum number of items in the cart (default: 50) */
  maxItems?: number;
  /** Whether to allow duplicate items — if false, adding an existing slug replaces quantity (default: true) */
  allowDuplicates?: boolean;
}

// ── CartContextValue: returned by useCart() ─────────────────────────────────

export interface CartContextValue {
  /** Current cart items */
  items: CartItem[];
  /** Total number of items (sum of all quantities) */
  itemCount: number;
  /** Total price in cents */
  totalCents: number;
  /** Whether the cart is empty */
  isEmpty: boolean;
  /** Add an item to the cart */
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { id?: string; quantity?: number }) => void;
  /** Remove an item by ID */
  removeItem: (id: string) => void;
  /** Update the quantity of an item (removes if quantity <= 0) */
  updateQuantity: (id: string, quantity: number) => void;
  /** Clear all items from the cart */
  clearCart: () => void;
  /** Check if a product slug is in the cart */
  isInCart: (slug: string) => boolean;
  /** Get a specific item by slug */
  getItemBySlug: (slug: string) => CartItem | undefined;
  /** Whether the cart drawer/modal is open */
  isOpen: boolean;
  /** Open or close the cart drawer/modal */
  setIsOpen: (open: boolean) => void;
}
