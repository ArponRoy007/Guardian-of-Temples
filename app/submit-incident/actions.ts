"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const serverSubmissionSchema = z.object({
  districtId: z.number({ required_error: "District is required" }),
  templeId: z.string().uuid().nullable().optional(),
  templeNameRaw: z.string().optional(),
  incidentDate: z.string().refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date.getTime() <= Date.now() + 60000;
  }, "Incident date cannot be in the future"),
  incidentType: z.enum([
    "idol_vandalism",
    "arson",
    "assault",
    "property_damage",
    "threats",
    "other",
  ]),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  evidenceUrls: z.array(z.string().url()).max(3, "Maximum 3 evidence images allowed").optional(),
  cloudinaryPublicIds: z.array(z.string()).optional(),
  submitterContact: z.string().optional(),
});

export type ServerSubmissionInput = z.infer<typeof serverSubmissionSchema>;

export async function submitIncidentAction(inputData: ServerSubmissionInput) {
  try {
    const validatedData = serverSubmissionSchema.parse(inputData);

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required. Please sign in to submit a report." };
    }

    let finalTempleId: string | null = validatedData.templeId || null;
    let autoMatchNote: string | null = null;

    // ORGANIC TEMPLE RESOLUTION LOGIC (If no existing templeId passed)
    if (!finalTempleId && validatedData.templeNameRaw?.trim()) {
      const rawName = validatedData.templeNameRaw.trim();

      // 1. Query existing temples in this district for exact/fuzzy case-insensitive match
      const { data: districtTemples } = await supabase
        .from("temples")
        .select("id, name")
        .eq("district_id", validatedData.districtId);

      let matchedTemple = districtTemples?.find(
        (t) => t.name.toLowerCase().trim() === rawName.toLowerCase()
      );

      // Simple fuzzy substring match if exact case match fails
      if (!matchedTemple && districtTemples?.length) {
        matchedTemple = districtTemples.find(
          (t) =>
            t.name.toLowerCase().includes(rawName.toLowerCase()) ||
            rawName.toLowerCase().includes(t.name.toLowerCase())
        );
      }

      if (matchedTemple) {
        // Close match found! Link to existing temple to avoid duplicates
        finalTempleId = matchedTemple.id;
        autoMatchNote = `[AUTO-MATCHED]: Linked to existing temple '${matchedTemple.name}' based on name similarity. Please verify.`;
      } else {
        // No match found: Auto-create new unverified temple with source = 'incident_reported'
        const { data: newTemple, error: createTempleError } = await supabase
          .from("temples")
          .insert({
            name: rawName,
            district_id: validatedData.districtId,
            source: "incident_reported",
            is_verified: false,
          })
          .select("id")
          .single();

        if (createTempleError) {
          console.error("Auto temple creation error:", createTempleError.message);
        } else if (newTemple) {
          finalTempleId = newTemple.id;
          autoMatchNote = `[NEW UNVERIFIED TEMPLE CREATED]: Auto-created '${rawName}' in district #${validatedData.districtId}. Requires admin verification.`;
        }
      }
    }

    const primaryEvidenceUrl = validatedData.evidenceUrls?.length
      ? validatedData.evidenceUrls.join(",")
      : null;

    const primaryPublicIds = validatedData.cloudinaryPublicIds?.length
      ? validatedData.cloudinaryPublicIds.join(",")
      : null;

    // Perform Supabase Database Insert
    const { data, error: insertError } = await supabase
      .from("incidents")
      .insert({
        district_id: validatedData.districtId,
        temple_id: finalTempleId,
        temple_name_raw: validatedData.templeNameRaw || null,
        incident_date: validatedData.incidentDate.split("T")[0],
        incident_type: validatedData.incidentType,
        description: validatedData.description,
        evidence_url: primaryEvidenceUrl,
        cloudinary_public_id: primaryPublicIds,
        submitter_contact: validatedData.submitterContact || null,
        moderation_note: autoMatchNote,
        status: "pending",
        submitted_by: user.id,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError.message);
      return { error: insertError.message };
    }

    return {
      success: true,
      incidentId: data.id,
      message: "Thank you — your report has been submitted and is pending moderator review.",
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || "Validation failed." };
    }
    console.error("Submission action failed:", err);
    return { error: "Failed to submit report. Please try again." };
  }
}
