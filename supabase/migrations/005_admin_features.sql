-- ====================================================================
-- MIGRATION 005: ADMIN FEATURES AND INCIDENT AUDIT LOG
-- ====================================================================

-- 1. Create incident_audit_log table
CREATE TABLE IF NOT EXISTS public.incident_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  old_status public.incident_status NOT NULL,
  new_status public.incident_status NOT NULL,
  reason TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.incident_audit_log IS 'Audit log recording administrative status overrides with mandatory reasons.';

-- 2. Enable Row Level Security (RLS) on incident_audit_log
ALTER TABLE public.incident_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view or insert audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.incident_audit_log FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.incident_audit_log FOR INSERT
  WITH CHECK (public.is_admin());

-- 3. Adjust incidents table RLS to ensure admins can update ANY incident record
CREATE POLICY "Admins have full override update access on incidents"
  ON public.incidents FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Index for fast audit trail lookups
CREATE INDEX idx_audit_log_incident_id ON public.incident_audit_log(incident_id);
CREATE INDEX idx_audit_log_changed_by ON public.incident_audit_log(changed_by);
