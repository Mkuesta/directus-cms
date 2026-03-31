import React from 'react';

interface OrderStatusProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  orderId?: string | number;
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  paid: { label: 'Paid', color: '#10b981' },
  failed: { label: 'Failed', color: '#ef4444' },
  refunded: { label: 'Refunded', color: '#6366f1' },
  cancelled: { label: 'Cancelled', color: '#6b7280' },
};

export function OrderStatus({ status, orderId, showLabel = true, className, style }: OrderStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: config.color }} />
      {showLabel && <span>{config.label}</span>}
      {orderId && <span style={{ color: '#999', fontSize: '0.85em' }}>#{orderId}</span>}
    </span>
  );
}
