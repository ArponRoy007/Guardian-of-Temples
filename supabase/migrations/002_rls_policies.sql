-- ====================================================================
-- MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL TABLES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpline_contacts ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 2. ROLE LOOKUP SECURITY DEFINER FUNCTIONS (Prevents RLS Recursion)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------------------------
-- 3. PROFILES TABLE RLS POLICIES
-- --------------------------------------------------------------------
-- Users can view their own profile; Admins can view all profiles
CREATE POLICY "Users can read own profile or admin reads all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile; Admins can update all
CREATE POLICY "Users can update own profile or admin updates all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- System/auth trigger can insert profiles
CREATE POLICY "Profiles insertable by user or trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- --------------------------------------------------------------------
-- 4. DISTRICTS TABLE RLS POLICIES
-- --------------------------------------------------------------------
-- Public read access for map & search features
CREATE POLICY "Districts are publicly viewable"
  ON public.districts FOR SELECT
  USING (TRUE);

-- Admin write access
CREATE POLICY "Only admins can modify districts"
  ON public.districts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 5. TEMPLES TABLE RLS POLICIES
-- --------------------------------------------------------------------
-- Public read access
CREATE POLICY "Temples are publicly viewable"
  ON public.temples FOR SELECT
  USING (TRUE);

-- Authenticated users or admins can submit new temples
CREATE POLICY "Authenticated users can submit temples"
  ON public.temples FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());

-- Only admins/moderators can update/verify temples
CREATE POLICY "Moderators and admins can manage temples"
  ON public.temples FOR UPDATE
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());

CREATE POLICY "Only admins can delete temples"
  ON public.temples FOR DELETE
  USING (public.is_admin());

-- --------------------------------------------------------------------
-- 6. INCIDENTS TABLE RLS POLICIES
-- --------------------------------------------------------------------
-- Public can read ONLY approved incidents; Users can read their own submissions; Moderators/Admins can read all
CREATE POLICY "Public reads approved incidents, users read own, mods read all"
  ON public.incidents FOR SELECT
  USING (
    status = 'approved'
    OR (auth.uid() IS NOT NULL AND submitted_by = auth.uid())
    OR public.is_moderator_or_admin()
  );

-- Authenticated users can submit their own incident reports
CREATE POLICY "Authenticated users can submit incident reports"
  ON public.incidents FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND submitted_by = auth.uid()
    AND status = 'pending' -- New reports must start as pending
  );

-- Moderators & Admins can update status, moderated_by, moderation_note, etc.
CREATE POLICY "Moderators and admins can update incident status"
  ON public.incidents FOR UPDATE
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());

-- Only Admins can hard delete incident records
CREATE POLICY "Only admins can delete incidents"
  ON public.incidents FOR DELETE
  USING (public.is_admin());

-- --------------------------------------------------------------------
-- 7. HELPLINE CONTACTS TABLE RLS POLICIES
-- --------------------------------------------------------------------
-- Public read access
CREATE POLICY "Helplines are publicly viewable"
  ON public.helpline_contacts FOR SELECT
  USING (TRUE);

-- Admin write access
CREATE POLICY "Only admins can manage helplines"
  ON public.helpline_contacts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
