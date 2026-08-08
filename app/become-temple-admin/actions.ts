"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Bangladeshi phone regex format: +8801XXXXXXXXX or 01XXXXXXXXX
const BD_PHONE_REGEX = /^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/;

const templeAdminRequestSchema = z
  .object({
    templeId: z.string().uuid().nullable().optional(),
    isUnlistedTemple: z.boolean().default(false),
    newTempleName: z.string().nullable().optional(),
    newTempleDistrictId: z.number().nullable().optional(),
    newTempleAddress: z.string().nullable().optional(),
    applicantFullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    applicantPhone: z
      .string()
      .regex(BD_PHONE_REGEX, "Please enter a valid Bangladeshi phone number (e.g. 01700000000 or +8801700000000)"),
    applicantRoleAtTemple: z
      .string()
      .min(2, "Role at temple must be at least 2 characters (e.g. Committee Secretary, Priest)")
      .max(100, "Role at temple cannot exceed 100 characters"),
    supportingEvidenceUrl: z
      .string({ required_error: "Supporting authorization documents are required" })
      .min(10, "Please upload all required authorization documents."),
  })
  .refine(
    (data) => {
      if (data.isUnlistedTemple) {
        return (
          data.newTempleName &&
          data.newTempleName.trim().length >= 3 &&
          data.newTempleDistrictId &&
          data.newTempleDistrictId > 0
        );
      }
      return !!data.templeId;
    },
    {
      message: "Please select an existing temple or provide new temple details and district.",
      path: ["templeId"],
    }
  );

export type TempleAdminRequestInput = z.infer<typeof templeAdminRequestSchema>;

export async function submitTempleAdminRequestAction(inputData: TempleAdminRequestInput) {
  try {
    // 1. Validate payload server-side
    const validatedData = templeAdminRequestSchema.parse(inputData);

    // 2. Server-side Authentication Check
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required. Please sign in to submit a verification request." };
    }

    // 3. Verify User Profile Role (Prevent duplicate admin applications)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "temple_admin") {
      return { error: "You are already a verified Temple Admin." };
    }

    // 4. Check for Pending Existing Request
    const { data: pendingRequests } = await supabase
      .from("temple_admin_requests")
      .select("id")
      .eq("requested_by", user.id)
      .eq("status", "pending")
      .limit(1);

    if (pendingRequests && pendingRequests.length > 0) {
      return {
        error: "You already have a pending verification request. Please await moderator review.",
      };
    }

    // 5. Insert Request into Database
    const isUnlisted = validatedData.isUnlistedTemple;
    const { data: newRequest, error: insertError } = await supabase
      .from("temple_admin_requests")
      .insert({
        requested_by: user.id,
        temple_id: isUnlisted ? null : validatedData.templeId || null,
        new_temple_name: isUnlisted ? validatedData.newTempleName?.trim() || null : null,
        new_temple_district_id: isUnlisted ? validatedData.newTempleDistrictId || null : null,
        new_temple_address: isUnlisted ? validatedData.newTempleAddress?.trim() || null : null,
        applicant_full_name: validatedData.applicantFullName.trim(),
        applicant_phone: validatedData.applicantPhone.trim(),
        applicant_role_at_temple: validatedData.applicantRoleAtTemple.trim(),
        supporting_evidence_url: validatedData.supportingEvidenceUrl,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Temple admin request insert error:", insertError.message);
      return { error: insertError.message || "Failed to submit request. Please try again." };
    }

    return {
      success: true,
      requestId: newRequest.id,
      message: "Your request has been submitted successfully.",
    };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || "Validation failed." };
    }
    console.error("Temple admin request action exception:", err);
    return { error: "An unexpected error occurred while submitting your request." };
  }
}