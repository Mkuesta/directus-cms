let _subscriberId = 1;

export function resetSubscriberCounter() { _subscriberId = 1; }

export function createDirectusSubscriber(overrides?: Record<string, any>) {
  const id = _subscriberId++;
  return {
    id,
    email: `subscriber-${id}@example.com`,
    name: `Subscriber ${id}`,
    status: 'active',
    token: `token-${id}-${crypto.randomUUID().slice(0, 8)}`,
    source: 'homepage',
    ip: '127.0.0.1',
    site: 1,
    site_name: 'Test Site',
    date_created: '2024-01-15T10:00:00Z',
    date_confirmed: '2024-01-15T10:05:00Z',
    ...overrides,
  };
}

export function createSubscriber(overrides?: Record<string, any>) {
  const id = _subscriberId++;
  return {
    id,
    email: `subscriber-${id}@example.com`,
    name: `Subscriber ${id}`,
    status: 'active' as const,
    source: 'homepage',
    createdAt: '2024-01-15T10:00:00Z',
    confirmedAt: '2024-01-15T10:05:00Z',
    ...overrides,
  };
}
