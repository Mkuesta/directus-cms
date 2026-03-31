'use client';

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { Notification, NotifyOptions, NotificationContextValue } from './types';

export const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderCoreProps {
  defaultDuration?: number;
  maxVisible?: number;
  children: React.ReactNode;
  renderNotifications: (notifications: Notification[], dismiss: (id: string) => void) => React.ReactNode;
}

export function NotificationProviderCore({
  defaultDuration = 5000,
  maxVisible = 5,
  children,
  renderNotifications,
}: NotificationProviderCoreProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, options?: NotifyOptions): string => {
      const id = crypto.randomUUID();
      const duration = options?.duration ?? defaultDuration;
      const notification: Notification = {
        id,
        type: options?.type ?? 'info',
        message,
        title: options?.title,
        duration,
        dismissible: options?.dismissible ?? true,
      };

      // Register timer BEFORE state update so dismiss() can always find it
      if (duration > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(id);
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
        timersRef.current.set(id, timer);
      }

      setNotifications((prev) => {
        const next = [...prev, notification];
        // Trim to maxVisible
        if (next.length > maxVisible) {
          const removed = next.splice(0, next.length - maxVisible);
          for (const r of removed) {
            const t = timersRef.current.get(r.id);
            if (t) {
              clearTimeout(t);
              timersRef.current.delete(r.id);
            }
          }
        }
        return next;
      });

      return id;
    },
    [defaultDuration, maxVisible],
  );

  const success = useCallback(
    (message: string, title?: string) => notify(message, { type: 'success', title }),
    [notify],
  );

  const error = useCallback(
    (message: string, title?: string) => notify(message, { type: 'error', title }),
    [notify],
  );

  const info = useCallback(
    (message: string, title?: string) => notify(message, { type: 'info', title }),
    [notify],
  );

  const warning = useCallback(
    (message: string, title?: string) => notify(message, { type: 'warning', title }),
    [notify],
  );

  const value: NotificationContextValue = {
    notifications,
    notify,
    success,
    error,
    info,
    warning,
    dismiss,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {renderNotifications(notifications, dismiss)}
    </NotificationContext.Provider>
  );
}
