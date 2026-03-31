import React, { useState, useEffect, type FormEvent } from 'react';
import type { BillingDetails } from '../types.js';
import { COUNTRIES } from '../countries.js';

interface CheckoutFormProps {
  /** API endpoint for creating checkout sessions */
  checkoutApiUrl?: string;
  /** Items to purchase */
  items: Array<{ name: string; description?: string; quantity: number; unitPrice: number; productSlug?: string }>;
  /** Available currencies (e.g. ['usd', 'eur', 'gbp']) */
  currencies?: string[];
  /** Default currency */
  defaultCurrency?: string;
  /** Whether to show billing detail fields */
  showBillingDetails?: boolean;
  /** Subscription mode */
  mode?: 'payment' | 'subscription';
  /** Stripe price ID (for subscription mode) */
  priceId?: string;
  /** Submit button label */
  submitLabel?: string;
  /** Called before redirect */
  onBeforeRedirect?: (sessionId: string) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** API endpoint for exchange rates (default: '/api/exchange-rates') */
  exchangeRateApiUrl?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxWidth: '480px',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'auto' as any,
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const disabledButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
};

const errorStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '14px',
};

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  fontStyle: 'italic',
};

export function CheckoutForm({
  checkoutApiUrl = '/api/checkout',
  items,
  currencies,
  defaultCurrency = 'usd',
  showBillingDetails = false,
  mode = 'payment',
  priceId,
  submitLabel,
  onBeforeRedirect,
  onError,
  exchangeRateApiUrl = '/api/exchange-rates',
  className,
  style,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [billing, setBilling] = useState<BillingDetails>({});
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);

  // Fetch exchange rates when multiple currencies are available
  useEffect(() => {
    if (!currencies || currencies.length <= 1) return;

    let cancelled = false;
    fetch(exchangeRateApiUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(() => {
        // Exchange rates are optional — form still works without them
      });

    return () => { cancelled = true; };
  }, [currencies, exchangeRateApiUrl]);

  const updateBilling = (field: string, value: string) => {
    setBilling((prev) => {
      if (field.startsWith('address.')) {
        const addrField = field.replace('address.', '');
        return { ...prev, address: { ...prev.address, [addrField]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const totalInDefaultCurrency = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const getConvertedTotal = (targetCurrency: string): number | null => {
    if (!exchangeRates) return null;
    if (targetCurrency.toLowerCase() === defaultCurrency.toLowerCase()) return totalInDefaultCurrency;

    const rate = exchangeRates[targetCurrency.toUpperCase()] || exchangeRates[targetCurrency.toLowerCase()];
    if (!rate) return null;
    return totalInDefaultCurrency * rate;
  };

  const isNonDefaultCurrency = currency.toLowerCase() !== defaultCurrency.toLowerCase();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(checkoutApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: billing.email,
          currency,
          mode,
          priceId,
          billingDetails: showBillingDetails ? billing : undefined,
        }),
      });

      const data = await response.json();

      if (data.url && typeof data.url === 'string' && /^https:\/\/(checkout|pay)\.stripe\.com\//.test(data.url)) {
        onBeforeRedirect?.(data.sessionId);
        window.location.href = data.url;
      } else if (data.url) {
        const msg = 'Invalid checkout URL';
        setError(msg);
        onError?.(msg);
        setLoading(false);
      } else {
        const msg = data.error || 'Failed to create checkout session';
        setError(msg);
        onError?.(msg);
        setLoading(false);
      }
    } catch {
      const msg = 'Failed to create checkout session';
      setError(msg);
      onError?.(msg);
      setLoading(false);
    }
  };

  const label = submitLabel || (mode === 'subscription' ? 'Subscribe' : 'Proceed to Payment');

  return (
    <form onSubmit={handleSubmit} className={className} style={{ ...formStyle, ...style }}>
      {/* Email (always shown) */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          required
          value={billing.email || ''}
          onChange={(e) => updateBilling('email', e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </div>

      {/* Currency selector */}
      {currencies && currencies.length > 1 && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={selectStyle}
          >
            {currencies.map((c) => {
              const converted = getConvertedTotal(c);
              const suffix = converted !== null && c.toLowerCase() !== defaultCurrency.toLowerCase()
                ? ` — ~${converted.toFixed(2)}`
                : '';
              return (
                <option key={c} value={c}>
                  {c.toUpperCase()}{suffix}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Billing details */}
      {showBillingDetails && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={billing.name || ''}
              onChange={(e) => updateBilling('name', e.target.value)}
              placeholder="John Doe"
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              type="tel"
              value={billing.phone || ''}
              onChange={(e) => updateBilling('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Company (optional)</label>
            <input
              type="text"
              value={billing.company || ''}
              onChange={(e) => updateBilling('company', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Country</label>
            <select
              value={billing.address?.country || ''}
              onChange={(e) => updateBilling('address.country', e.target.value)}
              style={selectStyle}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              value={billing.address?.city || ''}
              onChange={(e) => updateBilling('address.city', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Postal Code</label>
            <input
              type="text"
              value={billing.address?.postalCode || ''}
              onChange={(e) => updateBilling('address.postalCode', e.target.value)}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Price preview */}
      <div style={{ fontSize: '16px', fontWeight: 600, padding: '8px 0' }}>
        Total: {currency.toUpperCase()}{' '}
        {(() => {
          const converted = getConvertedTotal(currency);
          return converted !== null ? converted.toFixed(2) : totalInDefaultCurrency.toFixed(2);
        })()}
      </div>

      {/* Approximate amount warning for non-default currency */}
      {isNonDefaultCurrency && exchangeRates && (
        <p style={noteStyle}>
          Approximate amount — final charge calculated at checkout
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={loading ? disabledButtonStyle : buttonStyle}
      >
        {loading ? 'Redirecting...' : label}
      </button>

      {error && <p style={errorStyle}>{error}</p>}
    </form>
  );
}
