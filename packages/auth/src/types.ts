import type { RestClient } from '@directus/sdk';

export interface AuthCollections {
  userProfiles: string;
}

export interface AuthConfig {
  directus: RestClient<any>;
  collections: AuthCollections;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  siteId?: number;
  siteName?: string;
  cookieOptions?: {
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    domain?: string;
    path?: string;
  };
  authCallbackUrl?: string;
  /** Directus collection for orders (used by linkOrders) */
  ordersCollection?: string;
}

export type UserRole = 'user' | 'editor' | 'admin';

export interface DirectusUserProfile {
  id: number;
  supabase_uid: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  preferences: Record<string, any> | null;
  site: number | null;
  date_created: string | null;
  date_updated: string | null;
}

export interface UserProfile {
  id: number;
  supabaseUid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  bio: string | null;
  preferences: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignUpOptions {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInOptions {
  email: string;
  password: string;
}

export interface OAuthOptions {
  provider: 'google' | 'github' | 'apple' | 'discord' | 'twitter';
  redirectTo?: string;
}

export interface AuthMiddlewareOptions {
  /** Paths that require authentication */
  protectedPaths: string[];
  /** Paths that authenticated users should be redirected away from (e.g. login, register) */
  publicOnlyPaths?: string[];
  /** Redirect target for unauthenticated users (default: '/login') */
  loginPath?: string;
  /** Redirect target for authenticated users on publicOnlyPaths (default: '/') */
  defaultRedirect?: string;
  /** Behavior when unauthenticated: 'redirect' (default) or 'unauthorized' (401 JSON) */
  onUnauthenticated?: 'redirect' | 'unauthorized';
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  profile?: UserProfile;
  error?: string;
}

export interface AuthUser {
  session: AuthSession;
  profile: UserProfile;
}

export interface AuthClient {
  config: AuthConfig;
  signUp(options: SignUpOptions): Promise<AuthResult>;
  signIn(options: SignInOptions): Promise<AuthResult>;
  signInWithOAuth(options: OAuthOptions): Promise<{ url: string } | { error: string }>;
  signOut(accessToken: string): Promise<{ success: boolean; error?: string }>;
  getSession(accessToken: string): Promise<AuthSession | null>;
  getUser(supabaseUid: string): Promise<AuthUser | null>;
  getProfile(supabaseUid: string): Promise<UserProfile | null>;
  updateProfile(supabaseUid: string, data: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl' | 'bio' | 'preferences'>>): Promise<UserProfile | null>;
  createAuthMiddleware(options: string[] | AuthMiddlewareOptions): (request: Request) => Promise<Response | null>;
  createAuthCallbackHandler(): (request: Request) => Promise<Response>;
  /** Link guest orders to a newly registered user by email */
  linkOrders(supabaseUid: string, email: string): Promise<number>;
}
