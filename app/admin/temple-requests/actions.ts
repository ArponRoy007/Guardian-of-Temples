"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Strict server-side check verifying the current user is a System Administrator.
 */
async function verifyAdminRole() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required. Please sign in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Access denied. System Administrator privileges required.");
  }

  return { user, supabase };
}

/**
 * Approves a temple admin verification request.
 * Handles both existing temple assignment and new temple creation.
 */
export async function approveTempleAdminRequestAction({
  requestId,
  reviewNote,
}: {
  requestId: string;
  reviewNote?: string;
}) {
  try {
    const { user, supabase } = await verifyAdminRole();

    // 1. Fetch request details
    const { data: request, error: fetchErr } = await supabase
      .from("temple_admin_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchErr || !request) {
      return { error: "Verification request record not found." };
    }

    if (request.status !== "pending") {
      return { error: `This request has already been ${request.status}.` };
    }

    // 2. Fetch requester profile to check for existing assignment
    const { data: requesterProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, linked_temple_id")
      .eq("id", request.requested_by)
      .single();

    if (profileErr || !requesterProfile) {
      return { error: "Applicant user profile not found." };
    }

    if (requesterProfile.role === "temple_admin" && requesterProfile.linked_temple_id) {
      return {
        error: "Applicant is already a verified temple_admin linked to a temple. Aborting to prevent overwriting.",
      };
    }

    let targetTempleId: string | null = request.temple_id;

    // 3. Case B: Handle New Temple Proposal
    if (!targetTempleId) {
      if (!request.new_temple_name || !request.new_temple_district_id) {
        return { error: "Proposed new temple request is missing required name or district details." };
      }

      // Create new temple in public.temples
      const { data: newTemple, error: createTempleErr } = await supabase
        .from("temples")
        .insert({
          name: request.new_temple_name.trim(),
          district_id: request.new_temple_district_id,
          address_text: request.new_temple_address?.trim() || null,
          source: "user_submitted",
          is_verified: true,
        })
        .select("id")
        .single();

      if (createTempleErr || !newTemple) {
        return { error: `Failed to create new temple: ${createTempleErr?.message || "Unknown error"}` };
      }

      targetTempleId = newTemple.id;
    }

    // 4. Update requester's profile role and linked_temple_id
    const { error: updateProfileErr } = await supabase
      .from("profiles")
      .update({
        role: "temple_admin",
        linked_temple_id: targetTempleId,
      })
      .eq("id", request.requested_by);

    if (updateProfileErr) {
      return { error: `Failed to assign temple_admin role: ${updateProfileErr.message}` };
    }

    // 5. Update request status to approved & backfill temple_id
    const { error: updateReqErr } = await supabase
      .from("temple_admin_requests")
      .update({
        status: "approved",
        temple_id: targetTempleId,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote?.trim() || null,
      })
      .eq("id", requestId);

    if (updateReqErr) {
      return { error: `Failed to update request status: ${updateReqErr.message}` };
    }

    revalidatePath("/admin/temple-requests");
    revalidatePath("/admin/temple-requests/history");
    revalidatePath("/admin");
    revalidatePath("/become-temple-admin");

    return {
      success: true,
      message: "Temple Admin request approved successfully. User upgraded to temple_admin.",
    };
  } catch (err: any) {
    return { error: err.message || "Failed to approve temple admin request." };
  }
}

/**
 * Rejects a temple admin verification request with a mandatory reason.
 */
export async function rejectTempleAdminRequestAction({
  requestId,
  reason,
}: {
  requestId: string;
  reason: string;
}) {
  try {
    if (!reason || !reason.trim()) {
      return { error: "A detailed rejection reason is required to notify the applicant." };
    }

    const { user, supabase } = await verifyAdminRole();

    const { data: request, error: fetchErr } = await supabase
      .from("temple_admin_requests")
      .select("status")
      .eq("id", requestId)
      .single();

    if (fetchErr || !request) {
      return { error: "Verification request record not found." };
    }

    if (request.status !== "pending") {
      return { error: `This request has already been ${request.status}.` };
    }

    const { error: updateReqErr } = await supabase
      .from("temple_admin_requests")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reason.trim(),
      })
      .eq("id", requestId);

    if (updateReqErr) {
      return { error: `Failed to reject request: ${updateReqErr.message}` };
    }

    revalidatePath("/admin/temple-requests");
    revalidatePath("/admin/temple-requests/history");
    revalidatePath("/admin");
    revalidatePath("/become-temple-admin");

    return {
      success: true,
      message: "Temple Admin request declined and rejection reason recorded.",
    };
  } catch (err: any) {
    return { error: err.message || "Failed to reject request." };
  }
}
