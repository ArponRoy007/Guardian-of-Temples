-- ====================================================================
-- MIGRATION 006: ORGANIC TEMPLE AUTO-CREATION & PG_TRGM EXTENSION
-- ====================================================================

-- 1. Enable pg_trgm extension for text similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add 'incident_reported' to temple_source enum
ALTER TYPE public.temple_source ADD VALUE IF NOT EXISTS 'incident_reported';

-- 3. Create GIN index for high-performance similarity search on temple names
CREATE INDEX IF NOT EXISTS idx_temples_name_trgm 
  ON public.temples 
  USING gin (name gin_trgm_ops);

-- 4. Enable authenticated users to insert unverified temples via incident reports
CREATE POLICY "Authenticated users insert unverified temples"
  ON public.temples FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND is_verified = FALSE
  );
