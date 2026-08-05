"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper to verify authenticated user has moderator or admin role server-side.
 */
async function verifyModeratorRole() {
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

  if (profileError || !profile || (profile.role !== "moderator" && profile.role !== "admin")) {
    throw new Error("Unauthorized access. Moderator or Admin role required.");
  }

  return { user, supabase };
}

export async function approveIncidentAction({
  incidentId,
  note,
}: {
  incidentId: string;
  note?: string;
}) {
  try {
    const { user, supabase } = await verifyModeratorRole();

    // Prevent double-moderation race condition
    const { data: currentIncident, error: fetchError } = await supabase
      .from("incidents")
      .select("status")
      .eq("id", incidentId)
      .single();

    if (fetchError || !currentIncident) {
      return { error: "Incident record not found." };
    }

    if (currentIncident.status !== "pending") {
      return { error: `This report has already been ${currentIncident.status}.` };
    }

    // Update incident status to approved
    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        status: "approved",
        moderated_by: user.id,
        moderation_note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", incidentId);

    if (updateError) {
      console.error("Approve update error:", updateError.message);
      return { error: updateError.message };
    }

    // Revalidate paths so map, homepage feed, and dashboards refresh instantly
    revalidatePath("/");
    revalidatePath("/moderator");
    revalidatePath("/moderator/history");
    revalidatePath("/search");

    return { success: true, message: "Incident successfully approved and published to live map." };
  } catch (err: any) {
    console.error("Approve action error:", err);
    return { error: err.message || "Failed to approve incident." };
  }
}

export async function rejectIncidentAction({
  incidentId,
  note,
}: {
  incidentId: string;
  note: string;
}) {
  try {
    if (!note || !note.trim()) {
      return { error: "A moderation note is required when rejecting a submission." };
    }

    const { user, supabase } = await verifyModeratorRole();

    // Prevent double-moderation race condition
    const { data: currentIncident, error: fetchError } = await supabase
      .from("incidents")
      .select("status")
      .eq("id", incidentId)
      .single();

    if (fetchError || !currentIncident) {
      return { error: "Incident record not found." };
    }

    if (currentIncident.status !== "pending") {
      return { error: `This report has already been ${currentIncident.status}.` };
    }

    // Update incident status to rejected
    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        status: "rejected",
        moderated_by: user.id,
        moderation_note: note.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", incidentId);

    if (updateError) {
      console.error("Reject update error:", updateError.message);
      return { error: updateError.message };
    }

    revalidatePath("/");
    revalidatePath("/moderator");
    revalidatePath("/moderator/history");
    revalidatePath("/search");

    return { success: true, message: "Incident submission has been rejected." };
  } catch (err: any) {
    console.error("Reject action error:", err);
    return { error: err.message || "Failed to reject incident." };
  }
}
