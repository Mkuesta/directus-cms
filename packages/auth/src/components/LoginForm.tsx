import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onOAuth?: (provider: string) => void;
  oauthProviders?: string[];
  error?: string;
}

export function LoginForm({ onSubmit, onOAuth, oauthProviders, error: externalError }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const displayError = externalError || error;

  return (
    <form onSubmit={handleSubmit}>
      {displayError && <div role="alert">{displayError}</div>}
      <div>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      {onOAuth && oauthProviders?.map((provider) => (
        <button key={provider} type="button" onClick={() => onOAuth(provider)}>
          Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </button>
      ))}
    </form>
  );
}
