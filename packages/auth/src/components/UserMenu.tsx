import React, { useState } from 'react';

interface UserMenuProps {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  onSignOut: () => void;
  onProfile?: () => void;
}

export function UserMenu({ email, displayName, avatarUrl, onSignOut, onProfile }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        ) : (
          <span>{(displayName || email).charAt(0).toUpperCase()}</span>
        )}
      </button>
      {open && (
        <div role="menu" style={{ position: 'absolute', right: 0, top: '100%', minWidth: 180, background: '#fff', border: '1px solid #ddd', borderRadius: 4, zIndex: 50 }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
            {displayName && <div style={{ fontWeight: 600 }}>{displayName}</div>}
            <div style={{ fontSize: 14, color: '#666' }}>{email}</div>
          </div>
          {onProfile && (
            <button type="button" role="menuitem" onClick={() => { setOpen(false); onProfile(); }} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
              Profile
            </button>
          )}
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onSignOut(); }} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
