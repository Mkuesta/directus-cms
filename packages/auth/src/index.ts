import type { AuthConfig, AuthClient } from './types.js';
import { signUp, signIn, signInWithOAuth, signOut, getSessionFromToken, linkOrdersToUser } from './auth.js';
import { getProfile, updateProfile } from './profiles.js';
import { createAuthMiddleware } from './middleware.js';
import { createAuthCallbackHandler } from './api-handler.js';

export function createAuthClient(config: AuthConfig): AuthClient {
  return {
    config,
    signUp: (options) => signUp(config, options),
    signIn: (options) => signIn(config, options),
    signInWithOAuth: (options) => signInWithOAuth(config, options),
    signOut: (accessToken) => signOut(config, accessToken),
    getSession: (accessToken) => getSessionFromToken(config, accessToken),
    getUser: async (supabaseUid) => {
      const profile = await getProfile(config, supabaseUid);
      if (!profile) return null;
      const session = { accessToken: '', refreshToken: '', user: { id: supabaseUid, email: profile.email } };
      return { session, profile };
    },
    getProfile: (supabaseUid) => getProfile(config, supabaseUid),
    updateProfile: (supabaseUid, data) => updateProfile(config, supabaseUid, data),
    createAuthMiddleware: (options) => createAuthMiddleware(config, options),
    createAuthCallbackHandler: () => createAuthCallbackHandler(config),
    linkOrders: (supabaseUid, email) => linkOrdersToUser(config, supabaseUid, email),
  };
}

export type {
  AuthConfig,
  AuthCollections,
  AuthClient,
  AuthMiddlewareOptions,
  UserRole,
  DirectusUserProfile,
  UserProfile,
  SignUpOptions,
  SignInOptions,
  OAuthOptions,
  AuthSession,
  AuthResult,
  AuthUser,
} from './types.js';

export { signUp, signIn, signInWithOAuth, signOut, getSessionFromToken, linkOrdersToUser } from './auth.js';
export { getProfile, createProfile, updateProfile } from './profiles.js';
export { createAuthMiddleware } from './middleware.js';
export { createAuthCallbackHandler } from './api-handler.js';
