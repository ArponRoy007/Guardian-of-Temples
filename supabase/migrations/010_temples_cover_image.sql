-- ====================================================================
-- MIGRATION 010: ADD COVER_IMAGE_URL TO TEMPLES TABLE
-- ====================================================================

-- Add nullable cover_image_url column to public.temples for temple profile headers
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN public.temples.cover_image_url IS 
  'Stores optional Cloudinary cover image URL for temple profile page headers (settable by temple_admin or system admin).';
