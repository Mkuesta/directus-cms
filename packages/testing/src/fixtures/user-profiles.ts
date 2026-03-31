let _profileId = 1;

export function resetProfileCounter() { _profileId = 1; }

export function createDirectusUserProfile(overrides?: Record<string, any>) {
  const id = _profileId++;
  return {
    id,
    supabase_uid: `supabase-uid-${id}`,
    email: `user${id}@example.com`,
    display_name: `User ${id}`,
    avatar_url: null,
    role: 'user',
    bio: null,
    preferences: null,
    site: 1,
    date_created: '2024-01-15T10:00:00Z',
    date_updated: null,
    ...overrides,
  };
}

export function createUserProfile(overrides?: Record<string, any>) {
  const id = _profileId++;
  return {
    id,
    supabaseUid: `supabase-uid-${id}`,
    email: `user${id}@example.com`,
    displayName: `User ${id}`,
    avatarUrl: null,
    role: 'user' as const,
    bio: null,
    preferences: null,
    ...overrides,
  };
}
