"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface BulkImportRow {
  rowNumber: number;
  temple_name: string;
  district_name_en: string;
  address_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  source_note?: string;
}

export interface BulkImportResult {
  successCount: number;
  skippedDuplicates: number;
  errors: { rowNumber: number; templeName: string; reason: string }[];
}

export async function bulkImportTemplesAction(rows: BulkImportRow[]): Promise<BulkImportResult> {
  const supabase = createClient();

  // 1. Server-Side Admin Role Verification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Access denied. Admin role required.");
  }

  // 2. Fetch all districts to map district_name_en -> district_id
  const { data: districts } = await supabase
    .from("districts")
    .select("id, name_en");

  const districtMap = new Map<string, number>();
  if (districts) {
    districts.forEach((d) => {
      districtMap.set(d.name_en.toLowerCase().trim(), d.id);
      // Support common variant spellings (e.g. Comilla -> Cumilla)
      if (d.name_en === "Comilla") districtMap.set("cumilla", d.id);
      if (d.name_en === "Chittagong") districtMap.set("chattogram", d.id);
    });
  }

  // 3. Fetch existing temples to check for duplicates (name + district_id)
  const { data: existingTemples } = await supabase
    .from("temples")
    .select("name, district_id");

  const existingSet = new Set<string>();
  if (existingTemples) {
    existingTemples.forEach((t) => {
      existingSet.add(`${t.name.toLowerCase().trim()}_${t.district_id}`);
    });
  }

  let successCount = 0;
  let skippedDuplicates = 0;
  const errors: { rowNumber: number; templeName: string; reason: string }[] = [];
  const recordsToInsert: any[] = [];

  // 4. Process and validate each row
  for (const row of rows) {
    const districtNameLower = row.district_name_en.toLowerCase().trim();
    const districtId = districtMap.get(districtNameLower);

    if (!districtId) {
      errors.push({
        rowNumber: row.rowNumber,
        templeName: row.temple_name,
        reason: `District '${row.district_name_en}' not found in Bangladesh 64-districts list`,
      });
      continue;
    }

    const uniqueKey = `${row.temple_name.toLowerCase().trim()}_${districtId}`;
    if (existingSet.has(uniqueKey)) {
      skippedDuplicates++;
      continue;
    }

    // Add to insertion batch
    recordsToInsert.push({
      name: row.temple_name.trim(),
      district_id: districtId,
      address_text: row.address_text?.trim() || null,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
      source: "puja_udjapan_parishad_2025",
      is_verified: true,
    });

    // Mark as seen in this batch to prevent intra-batch duplicates
    existingSet.add(uniqueKey);
  }

  // 5. Batch Insert into database
  if (recordsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("temples")
      .insert(recordsToInsert);

    if (insertError) {
      console.error("Bulk insert error:", insertError.message);
      errors.push({
        rowNumber: 0,
        templeName: "Batch Insert",
        reason: insertError.message,
      });
    } else {
      successCount = recordsToInsert.length;
    }
  }

  revalidatePath("/admin/temples");
  revalidatePath("/search");

  return {
    successCount,
    skippedDuplicates,
    errors,
  };
}
