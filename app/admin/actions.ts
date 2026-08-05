"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Strict server-side verification that the current user has the 'admin' role.
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
    throw new Error("Access denied. Admin privileges required.");
  }

  return { user, supabase };
}

// --------------------------------------------------------------------
// 1. ADMIN OVERRIDE INCIDENT STATUS (WITH MANDATORY AUDIT LOG)
// --------------------------------------------------------------------
export async function adminOverrideIncidentAction({
  incidentId,
  newStatus,
  reason,
}: {
  incidentId: string;
  newStatus: "pending" | "approved" | "rejected";
  reason: string;
}) {
  try {
    if (!reason || !reason.trim()) {
      return { error: "A detailed override reason is required for administrative status changes." };
    }

    const { user, supabase } = await verifyAdminRole();

    // Fetch old status
    const { data: currentIncident, error: fetchError } = await supabase
      .from("incidents")
      .select("status")
      .eq("id", incidentId)
      .single();

    if (fetchError || !currentIncident) {
      return { error: "Incident record not found." };
    }

    const oldStatus = currentIncident.status;

    // Update incident status
    const { error: updateError } = await supabase
      .from("incidents")
      .update({
        status: newStatus,
        moderated_by: user.id,
        moderation_note: `[ADMIN OVERRIDE]: ${reason.trim()}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", incidentId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Insert into audit log table
    const { error: auditError } = await supabase.from("incident_audit_log").insert({
      incident_id: incidentId,
      changed_by: user.id,
      old_status: oldStatus,
      new_status: newStatus,
      reason: reason.trim(),
    });

    if (auditError) {
      console.error("Audit log insert error:", auditError.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/submissions");
    revalidatePath("/moderator");
    revalidatePath("/search");

    return { success: true, message: `Status override to '${newStatus}' successfully logged.` };
  } catch (err: any) {
    return { error: err.message || "Failed to override incident status." };
  }
}

// --------------------------------------------------------------------
// 2. TEMPLE CRUD ACTIONS
// --------------------------------------------------------------------
export async function createTempleAction(data: {
  name: string;
  districtId: number;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  isVerified?: boolean;
}) {
  try {
    const { supabase } = await verifyAdminRole();

    const { data: temple, error } = await supabase
      .from("temples")
      .insert({
        name: data.name.trim(),
        district_id: data.districtId,
        address_text: data.addressText?.trim() || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        source: "puja_udjapan_parishad_2025",
        is_verified: data.isVerified ?? true,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/admin/temples");
    return { success: true, templeId: temple.id };
  } catch (err: any) {
    return { error: err.message || "Failed to create temple record." };
  }
}

export async function updateTempleAction(
  id: string,
  data: {
    name?: string;
    districtId?: number;
    addressText?: string;
    isVerified?: boolean;
  }
) {
  try {
    const { supabase } = await verifyAdminRole();

    const { error } = await supabase
      .from("temples")
      .update({
        ...(data.name && { name: data.name.trim() }),
        ...(data.districtId && { district_id: data.districtId }),
        ...(data.addressText !== undefined && { address_text: data.addressText.trim() }),
        ...(data.isVerified !== undefined && { is_verified: data.isVerified }),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/temples");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update temple." };
  }
}

export async function deleteTempleAction(id: string) {
  try {
    const { supabase } = await verifyAdminRole();

    const { error } = await supabase.from("temples").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/temples");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete temple." };
  }
}

// --------------------------------------------------------------------
// 3. HELPLINE CRUD ACTIONS
// --------------------------------------------------------------------
export async function createHelplineAction(data: {
  name: string;
  phoneNumber: string;
  category: "police" | "human_rights_org" | "minority_affairs" | "emergency_other";
  districtId?: number | null;
}) {
  try {
    const { supabase } = await verifyAdminRole();

    const { error } = await supabase.from("helpline_contacts").insert({
      name: data.name.trim(),
      phone_number: data.phoneNumber.trim(),
      category: data.category,
      district_id: data.districtId || null,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/helplines");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create helpline contact." };
  }
}

export async function deleteHelplineAction(id: string) {
  try {
    const { supabase } = await verifyAdminRole();

    const { error } = await supabase.from("helpline_contacts").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/helplines");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete helpline." };
  }
}

// --------------------------------------------------------------------
// 4. USER ROLE MANAGEMENT ACTION
// --------------------------------------------------------------------
export async function updateUserRoleAction(userId: string, newRole: "user" | "moderator" | "admin") {
  try {
    const { supabase } = await verifyAdminRole();

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    revalidatePath("/admin/moderators");
    return { success: true, message: `User role updated to '${newRole}'.` };
  } catch (err: any) {
    return { error: err.message || "Failed to update user role." };
  }
}
