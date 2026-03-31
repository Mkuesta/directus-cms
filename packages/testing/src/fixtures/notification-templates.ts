let _notifTemplateId = 1;

export function resetNotificationTemplateCounter() { _notifTemplateId = 1; }

export function createDirectusNotificationTemplate(overrides?: Record<string, any>) {
  const id = _notifTemplateId++;
  return {
    id,
    slug: `notification-${id}`,
    type: 'info',
    title: `Notification ${id}`,
    message: `This is notification template ${id}.`,
    duration: 5000,
    status: 'active',
    site: 1,
    ...overrides,
  };
}

export function createNotificationTemplate(overrides?: Record<string, any>) {
  const id = _notifTemplateId++;
  return {
    id,
    slug: `notification-${id}`,
    type: 'info' as const,
    title: `Notification ${id}`,
    message: `This is notification template ${id}.`,
    duration: 5000,
    status: 'active' as const,
    ...overrides,
  };
}
