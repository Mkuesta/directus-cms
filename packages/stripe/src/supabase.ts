import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { StripeConfig } from './types.js';
import { TABLE_SCHEMAS, TABLE_CREATE_ORDER } from './tables.js';

// Cached Supabase clients per URL
const _clientCache = new Map<string, SupabaseClient>();

// Cached site IDs per slug
const _siteIdCache = new Map<string, { id: string; ts: number }>();
const SITE_CACHE_TTL = 300_000; // 5 minutes

// Track whether tables have been ensured this process
let _tablesEnsured = false;

/**
 * Get or create a Supabase admin client (service role).
 */
export function getSupabaseClient(config: StripeConfig): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error('@mkuesta/stripe: supabaseUrl and supabaseServiceRoleKey are required for Supabase features');
  }

  const cached = _clientCache.get(config.supabaseUrl);
  if (cached) return cached;

  const client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  _clientCache.set(config.supabaseUrl, client);
  return client;
}

/**
 * Ensure all required tables exist. Runs once per process lifetime.
 */
export async function ensureTables(config: StripeConfig): Promise<void> {
  if (_tablesEnsured) return;

  const supabase = getSupabaseClient(config);

  // Check if sites table exists by attempting a select
  const { error } = await supabase.from('sites').select('id').limit(1);

  if (error && error.code === '42P01') {
    // Table doesn't exist — create all tables in order
    for (const table of TABLE_CREATE_ORDER) {
      const sql = TABLE_SCHEMAS[table];
      const { error: createError } = await supabase.rpc('exec_sql', { sql });
      if (createError) {
        // Fallback: try via raw REST if rpc not available
        console.warn(`@mkuesta/stripe: Could not auto-create table "${table}": ${createError.message}. Create tables manually.`);
      }
    }
  }

  _tablesEnsured = true;
}

/**
 * Get site_id UUID for a given siteSlug. Creates the site row if it doesn't exist.
 */
export async function getSiteId(config: StripeConfig): Promise<string> {
  const slug = config.siteSlug;
  if (!slug) throw new Error('@mkuesta/stripe: siteSlug is required for Supabase features');

  // Check cache
  const cached = _siteIdCache.get(slug);
  if (cached && Date.now() - cached.ts < SITE_CACHE_TTL) {
    return cached.id;
  }

  await ensureTables(config);
  const supabase = getSupabaseClient(config);

  // Try to find existing site
  const { data: existing } = await supabase
    .from('sites')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    _siteIdCache.set(slug, { id: existing.id, ts: Date.now() });
    return existing.id;
  }

  // Create new site
  const { data: created, error } = await supabase
    .from('sites')
    .upsert({ slug, name: config.siteName || slug }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (error || !created) {
    throw new Error(`@mkuesta/stripe: Failed to create site "${slug}": ${error?.message}`);
  }

  _siteIdCache.set(slug, { id: created.id, ts: Date.now() });
  return created.id;
}

/**
 * Check if Supabase is configured on this config.
 */
export function hasSupabase(config: StripeConfig): boolean {
  return !!(config.supabaseUrl && config.supabaseServiceRoleKey && config.siteSlug);
}
