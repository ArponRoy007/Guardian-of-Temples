-- ====================================================================
-- MIGRATION 011: ENHANCED TEMPLE ADMIN NOTIFICATION TRIGGER
-- ====================================================================

-- Trigger function generating clear, friendly notifications when a temple admin request is reviewed
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
    END IF;

    IF v_temple_name IS NULL OR v_temple_name = '' THEN
      v_temple_name := COALESCE(NEW.new_temple_name, 'your designated temple');
    END IF;

    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (
        NEW.requested_by,
        'temple_admin_approved',
        'Temple Admin Request Approved',
        'Congratulations! Your request to represent ' || v_temple_name || ' has been approved. You can now post updates to their profile.'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (
        NEW.requested_by,
        'temple_admin_rejected',
        'Temple Admin Request Declined',
        'Your request to represent ' || v_temple_name || ' was not approved.' ||
        CASE 
          WHEN NEW.review_note IS NOT NULL AND NEW.review_note <> '' THEN ' Reason: ' || NEW.review_note || '. You may submit a new request.' 
          ELSE ' You may submit a new request with updated verification documents.' 
        END
      );
    END IF;

    NEW.reviewed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-attach trigger to public.temple_admin_requests
DROP TRIGGER IF EXISTS trg_on_temple_admin_request_reviewed ON public.temple_admin_requests;

CREATE TRIGGER trg_on_temple_admin_request_reviewed
  BEFORE UPDATE ON public.temple_admin_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_temple_admin_request_status_change();
