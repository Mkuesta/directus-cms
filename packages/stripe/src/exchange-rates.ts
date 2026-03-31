import type { StripeConfig, ExchangeRates } from './types.js';

const DEFAULT_API_URL = 'https://api.frankfurter.app';
const DEFAULT_CACHE_TTL = 3_600_000; // 1 hour

// Cached exchange rates per base currency
const _rateCache = new Map<string, ExchangeRates>();

// Fallback rates (EUR-based) used when API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.96,
  JPY: 162.0,
  CAD: 1.47,
  AUD: 1.66,
  CNY: 7.82,
  INR: 90.2,
  BRL: 5.4,
  MXN: 18.5,
};

/**
 * Fetch current exchange rates from the API.
 */
export async function getExchangeRates(config: StripeConfig, base?: string): Promise<ExchangeRates> {
  const baseCurrency = (base || config.features?.currencies?.defaultCurrency || 'eur').toUpperCase();
  const cacheTtl = config.features?.currencies?.exchangeRateCacheTtl || DEFAULT_CACHE_TTL;

  // Check cache
  const cached = _rateCache.get(baseCurrency);
  if (cached && Date.now() - cached.fetchedAt < cacheTtl) {
    return cached;
  }

  const apiUrl = config.features?.currencies?.exchangeRateApiUrl || DEFAULT_API_URL;

  try {
    const response = await fetch(`${apiUrl}/latest?from=${baseCurrency}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const rates: ExchangeRates = {
      base: baseCurrency,
      rates: data.rates || {},
      fetchedAt: Date.now(),
    };

    _rateCache.set(baseCurrency, rates);
    return rates;
  } catch {
    // Return cached (even expired) if available
    if (cached) return cached;

    // Fallback to hardcoded rates
    if (baseCurrency === 'EUR') {
      return { base: 'EUR', rates: FALLBACK_RATES, fetchedAt: Date.now() };
    }

    return { base: baseCurrency, rates: {}, fetchedAt: Date.now() };
  }
}

/**
 * Convert an amount in cents from one currency to another.
 */
export async function convertCents(
  config: StripeConfig,
  amountCents: number,
  from: string,
  to: string,
): Promise<number> {
  if (from.toUpperCase() === to.toUpperCase()) return amountCents;

  const rates = await getExchangeRates(config, from.toUpperCase());
  const rate = rates.rates[to.toUpperCase()];

  if (!rate) {
    throw new Error(`No exchange rate available for ${from} → ${to}`);
  }

  return Math.round(amountCents * rate);
}

/**
 * Create a Next.js API handler for exchange rate lookups.
 * GET /api/exchange-rates?from=EUR&to=USD&amount=1000
 *
 * Fix 7: Adds Cache-Control headers for CDN/browser caching.
 */
export function createExchangeRateApiHandler(config: StripeConfig) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cacheHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    };

    try {
      const url = new URL(request.url);
      const from = url.searchParams.get('from') || config.features?.currencies?.defaultCurrency || 'eur';
      const to = url.searchParams.get('to');
      const amountStr = url.searchParams.get('amount');

      const rates = await getExchangeRates(config, from);

      // If amount is provided, return converted prices for all supported currencies
      if (amountStr) {
        const amount = parseInt(amountStr, 10);
        if (isNaN(amount) || amount < 0) {
          return new Response(JSON.stringify({ error: 'Invalid amount' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Single conversion
        if (to) {
          const converted = await convertCents(config, amount, from, to);
          return new Response(
            JSON.stringify({
              base: from.toLowerCase(),
              from: from.toLowerCase(),
              to: to.toLowerCase(),
              amount,
              converted,
              rate: rates.rates[to.toUpperCase()],
            }),
            { status: 200, headers: cacheHeaders },
          );
        }

        // Convert to all supported currencies
        const convertedPrices: Record<string, number> = {
          [from.toLowerCase()]: amount,
        };
        const supported = config.features?.currencies?.supported || Object.keys(rates.rates);
        for (const cur of supported) {
          if (cur.toUpperCase() !== from.toUpperCase() && rates.rates[cur.toUpperCase()]) {
            convertedPrices[cur.toLowerCase()] = Math.round(amount * rates.rates[cur.toUpperCase()]);
          }
        }

        return new Response(
          JSON.stringify({
            base: from.toLowerCase(),
            rates: rates.rates,
            stale: Date.now() - rates.fetchedAt > (config.features?.currencies?.exchangeRateCacheTtl || DEFAULT_CACHE_TTL),
            convertedPrices,
          }),
          { status: 200, headers: cacheHeaders },
        );
      }

      return new Response(JSON.stringify(rates), {
        status: 200,
        headers: cacheHeaders,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message || 'Failed to fetch exchange rates' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
