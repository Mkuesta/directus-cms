import { createClient } from '@supabase/supabase-js';
import { readItems, updateItem } from '@directus/sdk';
import type { AuthConfig, SignUpOptions, SignInOptions, OAuthOptions, AuthResult, AuthSession } from './types.js';
import { getProfile, createProfile } from './profiles.js';

function getSupabaseClient(config: AuthConfig) {
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function getSupabaseAdmin(config: AuthConfig) {
  if (!config.supabaseServiceRoleKey) {
    throw new Error('supabaseServiceRoleKey is required for admin operations');
  }
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
}

function toSession(supabaseSession: any): AuthSession {
  return {
    accessToken: supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    expiresAt: supabaseSession.expires_at,
    user: {
      id: supabaseSession.user.id,
      email: supabaseSession.user.email,
    },
  };
}

export async function signUp(config: AuthConfig, options: SignUpOptions): Promise<AuthResult> {
  const supabase = getSupabaseClient(config);

  const { data, error } = await supabase.auth.signUp({
    email: options.email,
    password: options.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.session || !data.user) {
    return { success: true }; // Email confirmation required
  }

  const session = toSession(data.session);

  // Create Directus profile
  const profile = await createProfile(config, {
    supabaseUid: data.user.id,
    email: options.email,
    displayName: options.displayName || null,
  });

  return { success: true, session, profile: profile || undefined };
}

export async function signIn(config: AuthConfig, options: SignInOptions): Promise<AuthResult> {
  const supabase = getSupabaseClient(config);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: options.email,
    password: options.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.session) {
    return { success: false, error: 'No session returned' };
  }

  const session = toSession(data.session);
  const profile = await getProfile(config, data.user.id);

  return { success: true, session, profile: profile || undefined };
}

export async function signInWithOAuth(
  config: AuthConfig,
  options: OAuthOptions,
): Promise<{ url: string } | { error: string }> {
  const supabase = getSupabaseClient(config);

  // Validate redirectTo is a relative path or same-origin URL to prevent open redirects
  if (options.redirectTo) {
    try {
      // SECURITY: Reject protocol-relative URLs (//evil.com) and absolute URLs
      if (options.redirectTo.startsWith('//') || /^https?:\/\//i.test(options.redirectTo)) {
        return { error: 'Invalid redirect URL — must be a relative path' };
      }
      if (!options.redirectTo.startsWith('/')) {
        return { error: 'Invalid redirect URL — must start with /' };
      }
    } catch {
      return { error: 'Invalid redirect URL' };
    }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: options.provider,
    options: { redirectTo: options.redirectTo },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function signOut(
  config: AuthConfig,
  accessToken: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin(config);

  // Use admin client to revoke the session
  const { error } = await supabase.auth.admin.signOut(accessToken);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getSessionFromToken(
  config: AuthConfig,
  accessToken: string,
): Promise<AuthSession | null> {
  const supabase = getSupabaseClient(config);

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return {
    accessToken,
    refreshToken: '',
    user: {
      id: data.user.id,
      email: data.user.email || '',
    },
  };
}

export async function linkOrdersToUser(
  config: AuthConfig,
  supabaseUid: string,
  email: string,
): Promise<number> {
  if (!config.ordersCollection) {
    return 0;
  }

  const orders = await config.directus.request(
    readItems(config.ordersCollection as any, {
      fields: ['id'],
      filter: {
        customer_email: { _eq: email },
        user_id: { _null: true },
      } as any,
      limit: -1,
    } as any),
  ) as unknown as Array<{ id: number }>;

  if (!orders.length) return 0;

  await Promise.all(
    orders.map((order) =>
      config.directus.request(
        updateItem(config.ordersCollection as any, order.id, { user_id: supabaseUid } as any),
      ),
    ),
  );

  return orders.length;
}
