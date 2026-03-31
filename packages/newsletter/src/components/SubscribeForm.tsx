import React, { useState } from 'react';

export interface SubscribeFormProps {
  /** API endpoint for newsletter operations (e.g. "/api/newsletter") */
  endpoint: string;
  /** Source identifier for tracking (e.g. "homepage", "blog-sidebar") */
  source?: string;
  /** Honeypot field name (must match server config, default "_hp_field") */
  honeypotField?: string;
  /** Email input placeholder text */
  placeholder?: string;
  /** Submit button text */
  buttonText?: string;
  /** Success message shown after subscribing */
  successMessage?: string;
  /** CSS class name for the form container */
  className?: string;
  /** Callback on successful subscription */
  onSuccess?: () => void;
  /** Callback on subscription error */
  onError?: (error: string) => void;
}

export function SubscribeForm({
  endpoint,
  source,
  honeypotField = '_hp_field',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing! Check your email to confirm.',
  className,
  onSuccess,
  onError,
}: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, any> = {
        action: 'subscribe',
        email,
        source,
        [honeypotField]: honeypot,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error === 'already_subscribed'
          ? 'This email is already subscribed.'
          : data.error === 'rate_limited'
            ? 'Too many requests. Please try again later.'
            : 'Subscription failed. Please try again.';
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      setSuccess(true);
      setEmail('');
      onSuccess?.();
    } catch {
      const errorMsg = 'Something went wrong. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={className} role="status" style={{ color: '#16a34a', fontSize: '14px' }}>
        {successMessage}
      </div>
    );
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'stretch',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  const hiddenStyle: React.CSSProperties = {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    opacity: 0,
    height: 0,
    width: 0,
    overflow: 'hidden',
  };

  const srOnlyStyle: React.CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Honeypot field - hidden from real users */}
        <input
          type="text"
          name={honeypotField}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={hiddenStyle}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <label htmlFor="newsletter-email" style={srOnlyStyle}>Email address</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={loading}
          style={inputStyle}
          aria-label="Email address"
        />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Subscribing...' : buttonText}
        </button>
      </form>
      {error && (
        <div role="alert" style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
