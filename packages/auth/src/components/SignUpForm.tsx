import React, { useState } from 'react';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, displayName: string) => Promise<void>;
  error?: string;
}

export function SignUpForm({ onSubmit, error: externalError }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(email, password, displayName);
    } catch (err: any) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const displayError = externalError || error;

  return (
    <form onSubmit={handleSubmit}>
      {displayError && <div role="alert">{displayError}</div>}
      <div>
        <label htmlFor="signup-name">Display name</label>
        <input id="signup-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
    </form>
  );
}
