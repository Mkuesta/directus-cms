import type { Product } from './types.js';

// ── Price formatting ────────────────────────────────────────────────────────

/**
 * Format a price amount with currency symbol.
 * Amount is in the currency's standard unit (e.g. 29.99 EUR, not cents).
 */
export function formatPrice(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale || 'en', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a price amount given in cents.
 */
export function formatPriceCents(amountCents: number, currency: string, locale?: string): string {
  return formatPrice(amountCents / 100, currency, locale);
}

// ── Discount & sale helpers ─────────────────────────────────────────────────

/**
 * Calculate the discount percentage between a current price and a compare-at price.
 * Returns 0 if there is no discount.
 */
export function getDiscountPercent(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price || compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Check if a product is currently on sale (has a valid compare_at_price > price).
 */
export function isOnSale(product: Product): boolean {
  return (
    product.compareAtPrice != null &&
    product.compareAtPrice > 0 &&
    product.compareAtPrice > product.price
  );
}

/**
 * Get the savings amount for a product on sale.
 * Returns 0 if the product is not on sale.
 */
export function getSavings(product: Product): number {
  if (!isOnSale(product)) return 0;
  return product.compareAtPrice! - product.price;
}

// ── VAT / tax helpers ───────────────────────────────────────────────────────

export interface VatBreakdown {
  /** Price excluding VAT */
  net: number;
  /** VAT amount */
  vat: number;
  /** Price including VAT */
  gross: number;
}

/**
 * Calculate VAT breakdown from a price.
 *
 * @param price - The price amount
 * @param vatRate - VAT rate as a percentage (e.g. 19 for 19%)
 * @param vatIncluded - Whether the price already includes VAT (default: true)
 */
export function calculateVat(price: number, vatRate: number, vatIncluded: boolean = true): VatBreakdown {
  if (vatRate <= 0) {
    return { net: price, vat: 0, gross: price };
  }

  const rate = vatRate / 100;

  if (vatIncluded) {
    const net = price / (1 + rate);
    const vat = price - net;
    return {
      net: Math.round(net * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      gross: price,
    };
  }

  const vat = price * rate;
  return {
    net: price,
    vat: Math.round(vat * 100) / 100,
    gross: Math.round((price + vat) * 100) / 100,
  };
}

/**
 * Validate an EU VAT number format (client-side regex check).
 * Does NOT verify against the VIES API — only checks the pattern.
 *
 * Supported formats: AT, BE, BG, CY, CZ, DE, DK, EE, EL (Greece), ES, FI, FR,
 * HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK, XI (Northern Ireland).
 */
export function isValidVatFormat(vatId: string): boolean {
  if (!vatId || vatId.length < 4) return false;
  const cleaned = vatId.replace(/[\s.-]/g, '').toUpperCase();
  return EU_VAT_REGEX.test(cleaned);
}

const EU_VAT_REGEX = /^(AT|BE|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK|XI)[A-Z0-9]{2,12}$/;

// ── File info helper ────────────────────────────────────────────────────────

export interface ProductFileInfo {
  format: string | undefined;
  size: string | undefined;
  url: string | undefined;
}

/**
 * Extract file information from a product's digital asset fields.
 */
export function getFileInfo(product: Product): ProductFileInfo {
  return {
    format: product.fileFormat,
    size: product.fileSize,
    url: product.fileUrl,
  };
}

/**
 * Check whether a product is a digital product (has file info).
 */
export function isDigitalProduct(product: Product): boolean {
  return !!(product.fileFormat || product.fileUrl);
}
