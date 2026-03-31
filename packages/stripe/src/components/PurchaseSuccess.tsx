import React, { useEffect, useState, useCallback, useRef } from 'react';

interface PurchaseInfo {
  purchaseId: string;
  productSlug: string;
  customerEmail?: string;
  [key: string]: any;
}

interface PurchaseSuccessProps {
  /** Stripe checkout session ID */
  sessionId: string;
  /** API endpoint for download-by-session (default: '/api/download/by-session') */
  downloadApiUrl?: string;
  /** Maximum number of poll attempts (default: 8) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 2000) */
  retryInterval?: number;
  /** Called when the purchase is ready */
  onReady?: (purchase: PurchaseInfo) => void;
  /** Called when polling fails after all retries */
  onError?: (error: string) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Render prop for custom content when ready */
  children?: (state: { status: 'loading' | 'ready' | 'error'; purchase: PurchaseInfo | null; error: string | null }) => React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
};

const spinnerStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '24px',
  height: '24px',
  border: '3px solid #e5e7eb',
  borderTopColor: '#4f46e5',
  borderRadius: '50%',
  animation: 'dcms-spin 0.8s linear infinite',
};

const errorTextStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '14px',
  marginTop: '8px',
};

const successTextStyle: React.CSSProperties = {
  color: '#16a34a',
  fontSize: '16px',
  fontWeight: 600,
};

export function PurchaseSuccess({
  sessionId,
  downloadApiUrl = '/api/download/by-session',
  maxRetries = 8,
  retryInterval = 2000,
  onReady,
  onError,
  className,
  style,
  children,
}: PurchaseSuccessProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(downloadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!mountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        setPurchase(data);
        setStatus('ready');
        onReady?.(data);
        return;
      }

      // 404 = purchase not yet created by webhook, retry
      if (response.status === 404) {
        retriesRef.current++;
        if (retriesRef.current >= maxRetries) {
          const msg = 'Purchase not found. Please check your email for confirmation.';
          setError(msg);
          setStatus('error');
          onError?.(msg);
          return;
        }
        timerRef.current = setTimeout(poll, retryInterval);
        return;
      }

      // Other errors
      const data = await response.json().catch(() => ({}));
      const msg = data.error || `Request failed (${response.status})`;
      setError(msg);
      setStatus('error');
      onError?.(msg);
    } catch {
      if (!mountedRef.current) return;
      retriesRef.current++;
      if (retriesRef.current >= maxRetries) {
        const msg = 'Unable to verify purchase. Please check your email for confirmation.';
        setError(msg);
        setStatus('error');
        onError?.(msg);
        return;
      }
      timerRef.current = setTimeout(poll, retryInterval);
    }
  }, [sessionId, downloadApiUrl, maxRetries, retryInterval, onReady, onError]);

  useEffect(() => {
    mountedRef.current = true;
    retriesRef.current = 0;
    setStatus('loading');
    setError(null);
    setPurchase(null);
    poll();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  // Render prop mode
  if (children) {
    return (
      <div className={className} style={{ ...containerStyle, ...style }}>
        {children({ status, purchase, error })}
      </div>
    );
  }

  // Default rendering
  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {/* Inject keyframes for spinner */}
      <style>{`@keyframes dcms-spin { to { transform: rotate(360deg) } }`}</style>

      {status === 'loading' && (
        <>
          <div style={spinnerStyle} />
          <p style={{ marginTop: '12px', color: '#6b7280' }}>Verifying your purchase...</p>
        </>
      )}

      {status === 'ready' && purchase && (
        <>
          <p style={successTextStyle}>Purchase confirmed!</p>
          {purchase.productSlug && (
            <p style={{ color: '#374151', marginTop: '4px' }}>{purchase.productSlug}</p>
          )}
        </>
      )}

      {status === 'error' && (
        <p style={errorTextStyle}>{error}</p>
      )}
    </div>
  );
}
