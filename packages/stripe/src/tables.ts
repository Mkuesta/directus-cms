/**
 * SQL schema definitions for Supabase tables.
 * Auto-migration: on first use, missing tables are created via the admin client.
 */

export const TABLE_SCHEMAS: Record<string, string> = {
  sites: `
    CREATE TABLE IF NOT EXISTS sites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      name TEXT,
      domain TEXT,
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,

  customers: `
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID REFERENCES sites(id),
      email TEXT NOT NULL,
      name TEXT,
      stripe_customer_id TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(site_id, email)
    );
  `,

  purchases: `
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID REFERENCES sites(id),
      customer_id UUID REFERENCES customers(id),
      stripe_session_id TEXT NOT NULL,
      stripe_payment_intent_id TEXT,
      product_slug TEXT NOT NULL,
      product_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'pending',
      download_count INTEGER DEFAULT 0,
      max_downloads INTEGER DEFAULT 10,
      download_expires_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(stripe_session_id)
    );
  `,

  subscriptions: `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID REFERENCES sites(id),
      customer_id UUID REFERENCES customers(id),
      stripe_subscription_id TEXT NOT NULL,
      stripe_price_id TEXT,
      plan_name TEXT,
      status TEXT NOT NULL DEFAULT 'incomplete',
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN DEFAULT false,
      canceled_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(stripe_subscription_id)
    );
  `,

  invoices: `
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID REFERENCES sites(id),
      customer_id UUID REFERENCES customers(id),
      subscription_id UUID REFERENCES subscriptions(id),
      stripe_invoice_id TEXT NOT NULL,
      invoice_number TEXT,
      amount_due INTEGER,
      amount_paid INTEGER,
      currency TEXT,
      status TEXT,
      invoice_pdf_url TEXT,
      hosted_invoice_url TEXT,
      period_start TIMESTAMPTZ,
      period_end TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(stripe_invoice_id)
    );
  `,

  audit_log: `
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID REFERENCES sites(id),
      customer_id UUID,
      event_type TEXT NOT NULL,
      event_data JSONB DEFAULT '{}',
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
};

/** Ordered list of tables to create (respects foreign key dependencies). */
export const TABLE_CREATE_ORDER = [
  'sites',
  'customers',
  'purchases',
  'subscriptions',
  'invoices',
  'audit_log',
];
