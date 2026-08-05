-- ====================================================================
-- MIGRATION 001: INITIAL SCHEMA FOR DURGA PUJA INCIDENT TRACKER
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ENUM TYPES
-- --------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');

CREATE TYPE public.temple_source AS ENUM ('puja_udjapan_parishad_2025', 'user_submitted');

CREATE TYPE public.incident_type AS ENUM (
  'idol_vandalism',
  'arson',
  'assault',
  'property_damage',
  'threats',
  'other'
);

CREATE TYPE public.incident_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.helpline_category AS ENUM (
  'police',
  'human_rights_org',
  'minority_affairs',
  'emergency_other'
);

-- --------------------------------------------------------------------
-- 2. PROFILES TABLE (Extends Supabase auth.users)
-- --------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comment on profiles
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users with app role permissions.';

-- --------------------------------------------------------------------
-- 3. DISTRICTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.districts (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  division TEXT NOT NULL,
  geo_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.districts IS 'Official 64 Bangladesh districts (zilla) with division and GeoJSON code mapping.';

-- --------------------------------------------------------------------
-- 4. TEMPLES TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district_id INT NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  address_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source public.temple_source NOT NULL DEFAULT 'user_submitted',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.temples IS 'Temples database pre-seeded from Bangladesh Puja Udjapan Parishad 2025 or user-submitted.';

-- --------------------------------------------------------------------
-- 5. INCIDENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID REFERENCES public.temples(id) ON DELETE SET NULL,
  temple_name_text TEXT, -- Fallback when temple is not yet in temples table
  district_id INT NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  incident_type public.incident_type NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT, -- Link to photo or news source stored in Supabase Storage or external media
  status public.incident_status NOT NULL DEFAULT 'pending',
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderation_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.incidents IS 'Reported violence/vandalism incidents requiring moderator review before public map display.';

-- --------------------------------------------------------------------
-- 6. HELPLINE CONTACTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE public.helpline_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  category public.helpline_category NOT NULL DEFAULT 'emergency_other',
  district_id INT REFERENCES public.districts(id) ON DELETE SET NULL, -- NULL means national helpline
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.helpline_contacts IS 'Emergency hotline numbers for police, legal aid, and human rights organizations.';

-- --------------------------------------------------------------------
-- 7. CHOROPLETH MAP AGGREGATION VIEW
-- --------------------------------------------------------------------
CREATE OR REPLACE VIEW public.district_incident_counts AS
SELECT 
  d.id AS district_id,
  d.name_en,
  d.name_bn,
  d.division,
  d.geo_code,
  COUNT(i.id)::INT AS approved_incident_count
FROM public.districts d
LEFT JOIN public.incidents i 
  ON d.id = i.district_id 
 AND i.status = 'approved'
GROUP BY d.id, d.name_en, d.name_bn, d.division, d.geo_code;

COMMENT ON VIEW public.district_incident_counts IS 'Aggregated count of approved incidents per district for fast choropleth map rendering.';

-- --------------------------------------------------------------------
-- 8. INDEXES FOR HIGH-PERFORMANCE LOOKUPS
-- --------------------------------------------------------------------
CREATE INDEX idx_temples_district_id ON public.temples(district_id);
CREATE INDEX idx_incidents_district_id ON public.incidents(district_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_incident_date ON public.incidents(incident_date DESC);
CREATE INDEX idx_incidents_submitted_by ON public.incidents(submitted_by);
CREATE INDEX idx_helpline_district_id ON public.helpline_contacts(district_id);

-- --------------------------------------------------------------------
-- 9. AUTOMATIC TRIGGER FOR AUTH.USERS -> PUBLIC.PROFILES
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-updating updated_at on incidents
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incidents_modtime
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
