import React, { useEffect, useState } from 'react';
import type { Notification, NotificationType, NotificationPosition } from '../types';

export interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  /** Position of the container, used to determine slide-in direction */
  position?: NotificationPosition;
}

const typeColors: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  success: { bg: '#f0fdf4', border: '#16a34a', icon: '\u2713' },
  error: { bg: '#fef2f2', border: '#dc2626', icon: '\u2717' },
  info: { bg: '#eff6ff', border: '#2563eb', icon: '\u2139' },
  warning: { bg: '#fffbeb', border: '#d97706', icon: '\u26a0' },
};

function getSlideDirection(position?: NotificationPosition): string {
  if (!position) return 'translateX(100%)';
  if (position.includes('left')) return 'translateX(-100%)';
  if (position.includes('center')) return 'translateY(-20px)';
  return 'translateX(100%)';
}

export function Toast({ notification, onDismiss, position }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const colors = typeColors[notification.type];
  const slideDirection = getSlideDirection(position);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: colors.bg,
    borderLeft: `4px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    minWidth: '280px',
    maxWidth: '420px',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0) translateY(0)' : slideDirection,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
    position: 'relative',
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: colors.border,
    fontWeight: 'bold',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    marginBottom: '2px',
    color: '#1f2937',
  };

  const messageStyle: React.CSSProperties = {
    color: '#4b5563',
  };

  const closeStyle: React.CSSProperties = {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    fontSize: '16px',
    color: '#9ca3af',
    lineHeight: 1,
  };

  // Use role="alert" (assertive) only for errors, role="status" (polite) for others
  const role = notification.type === 'error' ? 'alert' : 'status';

  return (
    <div style={containerStyle} role={role}>
      <span style={iconStyle}>{colors.icon}</span>
      <div style={contentStyle}>
        {notification.title && <div style={titleStyle}>{notification.title}</div>}
        <div style={messageStyle}>{notification.message}</div>
      </div>
      {(notification.dismissible ?? true) && (
        <button
          style={closeStyle}
          onClick={() => onDismiss(notification.id)}
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      )}
    </div>
  );
}
