import React, { useState } from 'react';

interface CheckoutButtonProps {
  items: Array<{ name: string; description?: string; quantity: number; unitPrice: number; productId?: number }>;
  customerEmail?: string;
  checkoutApiUrl?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function CheckoutButton({
  items,
  customerEmail,
  checkoutApiUrl = '/api/checkout',
  label = 'Buy Now',
  disabled,
  className,
  style,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(checkoutApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail }),
      });
      const data = await response.json();
      if (data.url && typeof data.url === 'string' && /^https:\/\/(checkout|pay)\.stripe\.com\//.test(data.url)) {
        window.location.href = data.url;
      } else if (data.url) {
        setError('Invalid checkout URL');
        setLoading(false);
      } else {
        setError(data.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch {
      setError('Failed to create checkout session');
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={disabled || loading} className={className} style={style}>
        {loading ? 'Redirecting...' : label}
      </button>
      {error && <p style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{error}</p>}
    </div>
  );
}
