-- ====================================================================
-- MIGRATION 009: ADD CLOUDINARY PUBLIC ID TO INCIDENTS TABLE
-- ====================================================================

-- Add cloudinary_public_id column to public.incidents to support Cloudinary asset management/deletion
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

COMMENT ON COLUMN public.incidents.cloudinary_public_id IS 
  'Stores Cloudinary public_id(s) for uploaded evidence photos (comma-separated if multiple).';
