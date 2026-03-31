import React, { useCallback } from 'react';
import type { Notification, NotificationPosition } from '../types';
import { NotificationProviderCore } from '../context';
import { Toast } from './Toast';

export interface NotificationProviderProps {
  children: React.ReactNode;
  /** Position of the notification container. Default 'top-right'. */
  position?: NotificationPosition;
  /** Maximum number of visible notifications. Default 5. */
  maxVisible?: number;
  /** Default auto-dismiss duration in ms. Default 5000. Set to 0 to disable auto-dismiss. */
  defaultDuration?: number;
}

const positionStyles: Record<NotificationPosition, React.CSSProperties> = {
  'top-right': { top: '16px', right: '16px' },
  'top-left': { top: '16px', left: '16px' },
  'bottom-right': { bottom: '16px', right: '16px' },
  'bottom-left': { bottom: '16px', left: '16px' },
  'top-center': { top: '16px', left: '50%', transform: 'translateX(-50%)' },
  'bottom-center': { bottom: '16px', left: '50%', transform: 'translateX(-50%)' },
};

export function NotificationProvider({
  children,
  position = 'top-right',
  maxVisible = 5,
  defaultDuration = 5000,
}: NotificationProviderProps) {
  const renderNotifications = useCallback(
    (notifications: Notification[], dismiss: (id: string) => void) => {
      if (notifications.length === 0) return null;

      const containerStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        ...positionStyles[position],
      };

      const itemStyle: React.CSSProperties = {
        pointerEvents: 'auto',
      };

      return (
        <div style={containerStyle}>
          {notifications.map((n) => (
            <div key={n.id} style={itemStyle}>
              <Toast notification={n} onDismiss={dismiss} position={position} />
            </div>
          ))}
        </div>
      );
    },
    [position],
  );

  return (
    <NotificationProviderCore
      defaultDuration={defaultDuration}
      maxVisible={maxVisible}
      renderNotifications={renderNotifications}
    >
      {children}
    </NotificationProviderCore>
  );
}
