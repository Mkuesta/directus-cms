'use client';

import React from 'react';

export interface PreviewBannerProps {
  message?: string;
  exitUrl?: string;
  className?: string;
  position?: 'top' | 'bottom';
}

export function PreviewBanner({
  message = 'Preview Mode',
  exitUrl = '/api/preview/exit',
  className,
  position = 'bottom',
}: PreviewBannerProps) {
  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#f59e0b',
        color: '#000',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span>{message}</span>
      <a
        href={exitUrl}
        style={{
          backgroundColor: '#000',
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.25rem',
          textDecoration: 'none',
          fontSize: '0.75rem',
        }}
      >
        Exit Preview
      </a>
    </div>
  );
}
