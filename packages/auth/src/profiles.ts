import { readItems, createItem, updateItem } from '@directus/sdk';
import type { AuthConfig, DirectusUserProfile, UserProfile } from './types.js';

const _cache = new WeakMap<object, { data: Map<string, UserProfile>; ts: number }>();
const CACHE_TTL = 60_000;

function getCached(config: AuthConfig): Map<string, UserProfile> | null {
  const entry = _cache.get(config.directus);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setProfileCache(config: AuthConfig, uid: string, profile: UserProfile): void {
  let entry = _cache.get(config.directus);
  if (!entry || Date.now() - entry.ts >= CACHE_TTL) {
    entry = { data: new Map(), ts: Date.now() };
    _cache.set(config.directus, entry);
  }
  entry.data.set(uid, profile);
}

function transformProfile(raw: DirectusUserProfile): UserProfile {
  return {
    id: raw.id,
    supabaseUid: raw.supabase_uid,
    email: raw.email,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    role: raw.role,
    bio: raw.bio,
    preferences: raw.preferences,
    createdAt: raw.date_created || undefined,
    updatedAt: raw.date_updated || undefined,
  };
}

export async function getProfile(config: AuthConfig, supabaseUid: string): Promise<UserProfile | null> {
  const cached = getCached(config);
  if (cached?.has(supabaseUid)) return cached.get(supabaseUid)!;

  const filter: Record<string, any> = { supabase_uid: { _eq: supabaseUid } };
  if (config.siteId) filter.site = { _eq: config.siteId };

  const items = await config.directus.request(
    readItems(config.collections.userProfiles, {
      filter,
      fields: ['id', 'supabase_uid', 'email', 'display_name', 'avatar_url', 'role', 'bio', 'preferences', 'date_created', 'date_updated'],
      limit: 1,
    }),
  ) as DirectusUserProfile[];

  if (!items.length) return null;

  const profile = transformProfile(items[0]);
  setProfileCache(config, supabaseUid, profile);
  return profile;
}

export async function createProfile(
  config: AuthConfig,
  data: { supabaseUid: string; email: string; displayName: string | null },
): Promise<UserProfile | null> {
  try {
    const result = await config.directus.request(
      createItem(config.collections.userProfiles, {
        supabase_uid: data.supabaseUid,
        email: data.email,
        display_name: data.displayName,
        role: 'user',
        site: config.siteId || null,
      }),
    ) as DirectusUserProfile;

    const profile = transformProfile(result);
    setProfileCache(config, data.supabaseUid, profile);
    return profile;
  } catch {
    return null;
  }
}

export async function updateProfile(
  config: AuthConfig,
  supabaseUid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl' | 'bio' | 'preferences'>>,
): Promise<UserProfile | null> {
  const existing = await getProfile(config, supabaseUid);
  if (!existing) return null;

  const updateData: Record<string, any> = {};
  if (data.displayName !== undefined) updateData.display_name = data.displayName;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.preferences !== undefined) updateData.preferences = data.preferences;

  try {
    const result = await config.directus.request(
      updateItem(config.collections.userProfiles, existing.id, updateData),
    ) as DirectusUserProfile;

    const profile = transformProfile(result);
    setProfileCache(config, supabaseUid, profile);
    return profile;
  } catch {
    return null;
  }
}
