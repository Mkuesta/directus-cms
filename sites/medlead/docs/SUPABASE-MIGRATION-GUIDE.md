# Supabase Migration Guide

## Overview

This document explains how to run database migrations on Supabase for the account system implementation.

---

## Credentials Required

To run migrations on Supabase, you need the **Database Connection String**:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Where to Find It

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Copy the **Connection String** (URI format)

### Credential Components

| Component | Example | Description |
|-----------|---------|-------------|
| User | `postgres` | Default database user |
| Password | `YourPassword123` | Database password (set during project creation) |
| Host | `db.bkxtfznmmnsjllogwazf.supabase.co` | Your project's database host |
| Port | `5432` | PostgreSQL default port |
| Database | `postgres` | Default database name |

---

## How the Migration Was Executed

### Method: Direct PostgreSQL Connection

We used Node.js with the `pg` (node-postgres) package to connect directly to the Supabase PostgreSQL database.

```javascript
import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres'
});

await client.connect();
await client.query('YOUR SQL HERE');
await client.end();
```

### Migration Script Location

```
scripts/run-auth-migration.mjs
```

### Run Command

```bash
node scripts/run-auth-migration.mjs
```

---

## Alternative Methods

### 1. Supabase CLI (Recommended for CI/CD)

Requires `SUPABASE_ACCESS_TOKEN`:

```bash
# Get token from: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN=sbp_xxxxx

# Link project
npx supabase link --project-ref [PROJECT_REF]

# Push migrations
npx supabase db push
```

### 2. Supabase Dashboard SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Paste your SQL migration
3. Click **Run**

---

## Environment Variables for the App

After migration, ensure these are in `.env.local`:

```env
# Required for client-side auth
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Required for server-side operations (admin access)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Where to Find Keys

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Migration Files

| File | Purpose |
|------|---------|
| `supabase/migrations/001_user_profiles.sql` | Creates user_profiles table, adds user_id to orders |
| `scripts/run-auth-migration.mjs` | Node.js script to execute migration |

---

## Verification

After running the migration, verify with:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'orders');

-- Check user_id column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'user_id';

-- Check function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'link_orders_to_user';
```

---

## Security Notes

- Never commit database passwords to version control
- Use environment variables for all credentials
- The `service_role` key has admin access - only use server-side
- The `anon` key is safe for client-side use (respects RLS policies)
