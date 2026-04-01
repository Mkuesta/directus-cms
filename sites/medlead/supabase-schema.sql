-- Medlead.io Healthcare Leads Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: specialties (medical specialties)
-- ============================================
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  provider_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_specialties_slug ON specialties(slug);
CREATE INDEX idx_specialties_parent ON specialties(parent_id);
CREATE INDEX idx_specialties_active ON specialties(is_active);

-- ============================================
-- Table: providers (healthcare lead data)
-- ============================================
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Identity
  provider_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  credential TEXT, -- MD, DO, NP, PA, RN, etc.
  npi_number TEXT, -- National Provider Identifier (10 digits)
  -- Classification
  specialty_slug TEXT REFERENCES specialties(slug),
  provider_type TEXT, -- physician, nurse_practitioner, physician_assistant, pharmacist, dentist, etc.
  facility_type TEXT, -- hospital, clinic, private_practice, group_practice, urgent_care, pharmacy, etc.
  -- Location
  street TEXT,
  city TEXT,
  state TEXT, -- US state code: TX, CA, NY, etc.
  zip_code TEXT, -- 5-digit US zip
  country TEXT DEFAULT 'US',
  -- Contact
  email TEXT,
  phone TEXT,
  fax TEXT,
  website TEXT,
  linkedin_url TEXT,
  -- Practice info
  practice_name TEXT,
  practice_size TEXT, -- solo, 2-5, 6-10, 11-25, 26-50, 51-100, 100+
  accepts_new_patients BOOLEAN,
  -- Data quality flags
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  npi_verified BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_providers_specialty ON providers(specialty_slug);
CREATE INDEX idx_providers_state ON providers(state);
CREATE INDEX idx_providers_zip ON providers(zip_code);
CREATE INDEX idx_providers_provider_type ON providers(provider_type);
CREATE INDEX idx_providers_facility_type ON providers(facility_type);
CREATE INDEX idx_providers_practice_size ON providers(practice_size);
CREATE INDEX idx_providers_email_verified ON providers(email_verified);
CREATE INDEX idx_providers_npi_verified ON providers(npi_verified);
CREATE INDEX idx_providers_city ON providers(city);

-- ============================================
-- Table: zip_codes (US zip code lookup)
-- ============================================
CREATE TABLE zip_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip TEXT UNIQUE NOT NULL,
  city TEXT,
  state TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7)
);

CREATE INDEX idx_zip_codes_zip ON zip_codes(zip);
CREATE INDEX idx_zip_codes_state ON zip_codes(state);

-- ============================================
-- RPC: get_zip_codes_in_radius
-- ============================================
CREATE OR REPLACE FUNCTION get_zip_codes_in_radius(
  center_zip TEXT,
  radius_miles NUMERIC
)
RETURNS TABLE(zip TEXT, city TEXT, state TEXT, distance_miles NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
  center_lat DECIMAL;
  center_lng DECIMAL;
BEGIN
  SELECT z.latitude, z.longitude INTO center_lat, center_lng
  FROM zip_codes z WHERE z.zip = center_zip;

  IF center_lat IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    z.zip,
    z.city,
    z.state,
    ROUND(
      (3959 * acos(
        cos(radians(center_lat)) * cos(radians(z.latitude)) *
        cos(radians(z.longitude) - radians(center_lng)) +
        sin(radians(center_lat)) * sin(radians(z.latitude))
      ))::NUMERIC, 1
    ) AS distance_miles
  FROM zip_codes z
  WHERE z.latitude IS NOT NULL
    AND z.longitude IS NOT NULL
    AND (3959 * acos(
      cos(radians(center_lat)) * cos(radians(z.latitude)) *
      cos(radians(z.longitude) - radians(center_lng)) +
      sin(radians(center_lat)) * sin(radians(z.latitude))
    )) <= radius_miles
  ORDER BY distance_miles;
END;
$$;

-- ============================================
-- Table: pricing_tiers (USD pricing)
-- ============================================
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_leads INTEGER NOT NULL,
  max_leads INTEGER, -- null = unlimited
  price_per_lead DECIMAL(10, 4) NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (min_leads, max_leads, price_per_lead, name) VALUES
  (1, 100, 0.45, 'Starter'),
  (101, 500, 0.35, 'Growth'),
  (501, 2000, 0.25, 'Business'),
  (2001, 10000, 0.18, 'Enterprise'),
  (10001, NULL, 0.12, 'Enterprise+');

-- ============================================
-- Table: orders
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'stripe',
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  download_token TEXT UNIQUE,
  download_expires_at TIMESTAMPTZ,
  download_limit INTEGER DEFAULT 5,
  download_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, paid, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_download_token ON orders(download_token);
CREATE INDEX idx_orders_status ON orders(status);

-- Function to auto-generate order numbers: ML-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_str TEXT;
  seq_num INTEGER;
BEGIN
  today_str := to_char(now(), 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 'ML-' || today_str || '-(\d+)') AS INTEGER)
  ), 0) + 1 INTO seq_num
  FROM orders
  WHERE order_number LIKE 'ML-' || today_str || '-%';

  NEW.order_number := 'ML-' || today_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================
-- Table: list_orders (track list builder exports)
-- ============================================
CREATE TABLE list_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  filter_config JSONB NOT NULL,
  lead_count INTEGER NOT NULL DEFAULT 0,
  price_per_lead DECIMAL(10, 4),
  total_price DECIMAL(10, 2),
  csv_file_path TEXT,
  csv_display_name TEXT,
  xls_file_path TEXT,
  xls_display_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_list_orders_order ON list_orders(order_id);
CREATE INDEX idx_list_orders_status ON list_orders(status);

-- ============================================
-- Table: contact_messages
-- ============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  job_title TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE zip_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read active specialties"
  ON specialties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active pricing tiers"
  ON pricing_tiers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read zip codes"
  ON zip_codes FOR SELECT
  USING (true);

-- Service role has full access (used in API routes via supabaseAdmin)
-- No explicit policies needed for service_role as it bypasses RLS

-- Providers: only service role can read/write (no public access to raw data)
-- The preview API masks data before returning it

-- Orders: only service role
-- List orders: only service role
-- Contact messages: public can insert, only service role can read

CREATE POLICY "Public can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Storage bucket for downloads
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('downloads', 'downloads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON specialties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_list_orders_updated_at BEFORE UPDATE ON list_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
