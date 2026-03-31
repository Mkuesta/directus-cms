'use client';

import { useContext } from 'react';
import { NotificationContext } from './context';
import type { NotificationContextValue } from './types';

/**
 * Hook to access the notification system.
 *
 * Must be used within a `<NotificationProvider>`.
 *
 * Returns: `{ notify, success, error, info, warning, dismiss, notifications }`
 */
export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within a <NotificationProvider>');
  }
  return ctx;
}
