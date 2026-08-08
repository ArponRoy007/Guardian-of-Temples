-- ====================================================================
-- WARNING: DEVELOPMENT / STAGING SEED DATA ONLY
-- DO NOT RUN THIS SCRIPT IN PRODUCTION DATABASE
-- ====================================================================

-- 1. Ensure Mock District Exists (Dhaka District)
INSERT INTO public.districts (id, name_en, name_bn, division, geo_code)
VALUES (1, 'Dhaka', 'ঢাকা', 'Dhaka', 'BD-13')
ON CONFLICT (id) DO UPDATE 
SET name_en = EXCLUDED.name_en, name_bn = EXCLUDED.name_bn;

-- 2. Ensure Mock Temple Exists (Test Temple Dhaka)
-- The "source" column has been removed so Supabase uses its safe default
INSERT INTO public.temples (name, district_id, address_text, is_verified)
VALUES (
  'Test Temple Dhaka',
  1,
  '123 Dhakeshwari Temple Road, Bakshibazar, Dhaka',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Log confirmation
SELECT id, name, district_id, is_verified 
FROM public.temples 
WHERE name = 'Test Temple Dhaka';