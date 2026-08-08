-- ====================================================================
-- MIGRATION 008: TEMPLE FEED & TEMPLE ADMIN MANAGEMENT SCHEMA
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. UPDATE ENUM TYPES
-- --------------------------------------------------------------------

-- Add 'temple_admin' to existing user_role enum type

-- Enum for temple admin requests status
DO $$ BEGIN
  CREATE TYPE public.temple_admin_request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enum for post reactions (plain English names: pray 🙏, love ❤️, flower 🌺)
DO $$ BEGIN
  CREATE TYPE public.post_reaction_type AS ENUM ('pray', 'love', 'flower');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enum for lightweight user notifications
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('post_deleted', 'temple_admin_approved', 'temple_admin_rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- --------------------------------------------------------------------
-- 2. ALTER PROFILES TABLE (ADD LINKED_TEMPLE_ID & TRIGGER CONSTRAINT)
-- --------------------------------------------------------------------

-- Add linked_temple_id column referencing public.temples(id)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linked_temple_id UUID REFERENCES public.temples(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.linked_temple_id IS 
  'Foreign key referencing temples(id). Populated only when user role is temple_admin. Enforced via check_temple_admin_linked_temple trigger.';

-- Trigger function ensuring linked_temple_id is NOT NULL whenever role = 'temple_admin'
-- (PostgreSQL does not support conditional cross-column foreign keys directly in table check constraints)
CREATE OR REPLACE FUNCTION public.check_temple_admin_linked_temple()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'temple_admin' AND NEW.linked_temple_id IS NULL THEN
    RAISE EXCEPTION 'Profile role is temple_admin, but linked_temple_id is NULL. A temple_admin must be assigned to a valid temple ID.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_temple_admin_linked_temple ON public.profiles;

CREATE TRIGGER trg_check_temple_admin_linked_temple
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_temple_admin_linked_temple();


-- --------------------------------------------------------------------
-- 3. TEMPLE_ADMIN_REQUESTS TABLE
-- --------------------------------------------------------------------
-- Note: new_temple_district_id is INT to match districts.id schema in public.districts

CREATE TABLE IF NOT EXISTS public.temple_admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  temple_id UUID REFERENCES public.temples(id) ON DELETE SET NULL, -- NULL if requesting a new temple
  new_temple_name TEXT,
  new_temple_district_id INT REFERENCES public.districts(id) ON DELETE SET NULL, -- Required if new_temple_name is set
  new_temple_address TEXT,
  applicant_full_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  applicant_role_at_temple TEXT NOT NULL, -- e.g. "Temple Committee Secretary"
  supporting_evidence_url TEXT, -- Proof document / authorization letter
  status public.temple_admin_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.temple_admin_requests IS 'Applications submitted by users to become verified temple_admins for existing or proposed temples.';


-- --------------------------------------------------------------------
-- 4. TEMPLE_POSTS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.temple_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Must be a temple_admin linked to this temple_id
  image_url TEXT NOT NULL, -- Cloudinary image URL
  cloudinary_public_id TEXT NOT NULL, -- For deletion/management via Cloudinary API
  caption TEXT CHECK (caption IS NULL OR char_length(caption) <= 500),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete flag for moderation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.temple_posts IS 'Positive feed posts uploaded by verified temple admins.';


-- --------------------------------------------------------------------
-- 5. POST_REACTIONS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.temple_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type public.post_reaction_type NOT NULL, -- 'pray', 'love', 'flower'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_id)
);

COMMENT ON TABLE public.post_reactions IS 'User reactions on temple feed posts (one reaction per user per post).';


-- --------------------------------------------------------------------
-- 6. POST_MODERATION_LOG TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.post_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.temple_posts(id) ON DELETE CASCADE,
  deleted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL, -- Must be moderator/admin
  reason TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.post_moderation_log IS 'Log of post soft-deletions performed by moderators or admins.';


-- --------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Recipient
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_post_id UUID REFERENCES public.temple_posts(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'Lightweight notifications for temple admin request decisions and post deletion alerts.';


-- --------------------------------------------------------------------
-- 8. INDEXES FOR HIGH-PERFORMANCE LOOKUPS
-- --------------------------------------------------------------------

-- Temple feed query optimization
CREATE INDEX IF NOT EXISTS idx_temple_posts_feed 
  ON public.temple_posts(temple_id, created_at DESC);

-- Lookup posts by creator
CREATE INDEX IF NOT EXISTS idx_temple_posts_created_by 
  ON public.temple_posts(created_by);

-- Aggregate reactions lookup
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id 
  ON public.post_reactions(post_id);

-- Unread notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, is_read);

-- Temple admin request queue filtering
CREATE INDEX IF NOT EXISTS idx_temple_admin_requests_status 
  ON public.temple_admin_requests(status);


-- --------------------------------------------------------------------
-- 9. TRIGGERS
-- --------------------------------------------------------------------

-- Trigger 9a: Auto-create notification row when post_moderation_log gets a new insert
CREATE OR REPLACE FUNCTION public.handle_post_moderation_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_temple_name TEXT;
BEGIN
  -- Retrieve post author and temple name
  SELECT tp.created_by, t.name
  INTO v_post_author_id, v_temple_name
  FROM public.temple_posts tp
  JOIN public.temples t ON tp.temple_id = t.id
  WHERE tp.id = NEW.post_id;

  IF v_post_author_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_post_id)
    VALUES (
      v_post_author_id,
      'post_deleted',
      'Post Removed by Moderator',
      'Your post for ' || COALESCE(v_temple_name, 'your temple') || ' was removed. Reason: ' || NEW.reason,
      NEW.post_id
    );

    NEW.notified := TRUE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_on_post_moderated ON public.post_moderation_log;

CREATE TRIGGER trg_on_post_moderated
  BEFORE INSERT ON public.post_moderation_log
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_moderation_notification();


-- Trigger 9b: Auto-create notification row when temple_admin_requests status changes to approved/rejected
CREATE OR REPLACE FUNCTION public.handle_temple_admin_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_temple_name TEXT;
BEGIN
  -- Only trigger when status changes from pending to approved or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    
    -- Determine temple name for notification message
    IF NEW.temple_id IS NOT NULL THEN
      SELECT name INTO v_temple_name FROM public.temples WHERE id = NEW.temple_id;
    ELSE
      v_temple_name := NEW.new_temple_name;
    END IF;

    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (
        NEW.requested_by,
        'temple_admin_approved',
        'Temple Admin Request Approved',
        'Your request to become temple admin for ' || COALESCE(v_temple_name, 'the temple') || ' has been approved!'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (
        NEW.requested_by,
        'temple_admin_rejected',
        'Temple Admin Request Declined',
        'Your request to become temple admin for ' || COALESCE(v_temple_name, 'the temple') || ' was declined.' ||
        CASE WHEN NEW.review_note IS NOT NULL AND NEW.review_note <> '' THEN ' Reason: ' || NEW.review_note ELSE '' END
      );
    END IF;

    NEW.reviewed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_on_temple_admin_request_reviewed ON public.temple_admin_requests;

CREATE TRIGGER trg_on_temple_admin_request_reviewed
  BEFORE UPDATE ON public.temple_admin_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_temple_admin_request_status_change();


-- Trigger 9c: Auto-update updated_at timestamp on temple_posts
DROP TRIGGER IF EXISTS update_temple_posts_modtime ON public.temple_posts;

CREATE TRIGGER update_temple_posts_modtime
  BEFORE UPDATE ON public.temple_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- --------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- Enable RLS on all new tables
ALTER TABLE public.temple_admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- --------------------------------------------------------------------
-- 10a. RLS POLICIES FOR TEMPLE_ADMIN_REQUESTS
-- --------------------------------------------------------------------
-- Any authenticated user can insert their own request
CREATE POLICY "Users can submit their own temple admin requests"
  ON public.temple_admin_requests FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = requested_by
  );

-- Users can view their own requests; Moderators/Admins can view all
CREATE POLICY "Users view own admin requests, mods/admins view all"
  ON public.temple_admin_requests FOR SELECT
  USING (
    auth.uid() = requested_by
    OR public.is_moderator_or_admin()
  );

-- Only Moderator/Admin can update request status and review notes
CREATE POLICY "Only moderators and admins can update temple admin requests"
  ON public.temple_admin_requests FOR UPDATE
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());


-- --------------------------------------------------------------------
-- 10b. RLS POLICIES FOR TEMPLE_POSTS
-- --------------------------------------------------------------------
-- Public read for active posts (is_deleted = false); post creator & moderators/admins can also view soft-deleted posts
CREATE POLICY "Public can read non-deleted temple posts"
  ON public.temple_posts FOR SELECT
  USING (
    is_deleted = FALSE
    OR auth.uid() = created_by
    OR public.is_moderator_or_admin()
  );

-- Insert allowed ONLY if auth.uid()'s profile has role = 'temple_admin' AND linked_temple_id matches temple_id being posted to
CREATE POLICY "Verified temple admins can insert posts for their linked temple"
  ON public.temple_posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'temple_admin'
        AND p.linked_temple_id = temple_posts.temple_id
    )
  );

-- Update & soft-delete allowed for post author OR any moderator/admin
CREATE POLICY "Post creators and moderators/admins can update temple posts"
  ON public.temple_posts FOR UPDATE
  USING (
    auth.uid() = created_by
    OR public.is_moderator_or_admin()
  )
  WITH CHECK (
    auth.uid() = created_by
    OR public.is_moderator_or_admin()
  );


-- --------------------------------------------------------------------
-- 10c. RLS POLICIES FOR POST_REACTIONS
-- --------------------------------------------------------------------
-- Public read access for reaction counts and user reactions
CREATE POLICY "Post reactions are publicly viewable"
  ON public.post_reactions FOR SELECT
  USING (TRUE);

-- Authenticated users can insert their own reaction
CREATE POLICY "Authenticated users can add reactions"
  ON public.post_reactions FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
  );

-- Authenticated users can update their own reaction (e.g. change reaction type)
CREATE POLICY "Users can update their own reactions"
  ON public.post_reactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can remove their own reaction
CREATE POLICY "Users can delete their own reactions"
  ON public.post_reactions FOR DELETE
  USING (auth.uid() = user_id);


-- --------------------------------------------------------------------
-- 10d. RLS POLICIES FOR POST_MODERATION_LOG
-- --------------------------------------------------------------------
-- Only moderators/admins can view moderation logs
CREATE POLICY "Only moderators and admins can read moderation logs"
  ON public.post_moderation_log FOR SELECT
  USING (public.is_moderator_or_admin());

-- Only moderators/admins can insert moderation logs
CREATE POLICY "Only moderators and admins can insert moderation logs"
  ON public.post_moderation_log FOR INSERT
  WITH CHECK (public.is_moderator_or_admin());


-- --------------------------------------------------------------------
-- 10e. RLS POLICIES FOR NOTIFICATIONS
-- --------------------------------------------------------------------
-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Server/Triggers/Admins can insert notifications
CREATE POLICY "System or admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);
