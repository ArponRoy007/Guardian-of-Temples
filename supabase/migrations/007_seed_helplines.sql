-- ====================================================================
-- MIGRATION 007: SEED NATIONAL EMERGENCY HELPLINES
-- ====================================================================

-- Note: District-specific police station numbers should be added by admins via the 
-- Admin Helplines CRUD page (/admin/helplines) after individual verification.

INSERT INTO public.helpline_contacts (name, phone_number, category, district_id)
VALUES
  ('National Emergency Service (Police, Fire, Ambulance)', '999', 'emergency_other', NULL),
  ('Bangladesh Police Control Room Hotline', '13219', 'police', NULL),
  ('National Human Rights Commission Helpline', '16108', 'human_rights_org', NULL),
  ('Government Legal Aid Services Hotline', '16430', 'human_rights_org', NULL),
  ('Ministry Helpline (Minority & Safety Assistance)', '109', 'minority_affairs', NULL)
ON CONFLICT DO NOTHING;
