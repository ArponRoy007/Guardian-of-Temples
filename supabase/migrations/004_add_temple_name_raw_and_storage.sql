-- ====================================================================
-- MIGRATION 004: ADD TEMPLE_NAME_RAW AND EVIDENCE STORAGE BUCKET
-- ====================================================================

-- 1. Add temple_name_raw and submitter_contact columns to public.incidents
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS temple_name_raw TEXT,
  ADD COLUMN IF NOT EXISTS submitter_contact TEXT;

COMMENT ON COLUMN public.incidents.temple_name_raw IS 'Free-text name of temple if unlisted in official temples table.';
COMMENT ON COLUMN public.incidents.submitter_contact IS 'Optional phone or email for verifiers to follow up (private).';

-- --------------------------------------------------------------------
-- 2. SUPABASE STORAGE BUCKET CONFIGURATION FOR INCIDENT EVIDENCE
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-evidence', 'incident-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Public READ policy for evidence images
CREATE POLICY "Public Read Incident Evidence Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'incident-evidence');

-- Authenticated WRITE policy for evidence images
CREATE POLICY "Authenticated Users Upload Evidence Images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'incident-evidence'
    AND auth.role() = 'authenticated'
  );

-- Authenticated DELETE policy for own evidence uploads
CREATE POLICY "Users Delete Own Evidence Uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'incident-evidence'
    AND auth.uid() = owner
  );
