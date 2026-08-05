import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { parseTempleCsv } from "../lib/utils/csvParser";

/**
 * Standalone CLI Seed Script for Bulk Importing Temples from CSV
 * Corrected: Uses robust `parseTempleCsv` parser handling inner quotes and commas.
 *
 * Usage:
 *   npx tsx scripts/import-temples.ts public/data/temples_import_template.csv
 */
async function runCLIImport() {
  console.log("\n=======================================================");
  console.log("  DURGA PUJA TRACKER BD - CLI BULK TEMPLE SEEDER");
  console.log("=======================================================\n");

  const csvArg = process.argv[2] || "public/data/temples_import_template.csv";
  const filePath = path.resolve(process.cwd(), csvArg);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: CSV file not found at path: ${filePath}`);
    process.exit(1);
  }

  console.log(`📁 Reading CSV file: ${filePath}`);
  const csvText = fs.readFileSync(filePath, "utf-8");

  // Use robust CSV parser handling inner quotes & commas
  const { rows, validRows, invalidRows } = parseTempleCsv(csvText);

  if (rows.length === 0) {
    console.warn("⚠️ Warning: CSV file is empty or only contains header.");
    process.exit(0);
  }

  console.log(`📊 Parsed ${rows.length} total rows (${validRows.length} valid, ${invalidRows.length} invalid).`);

  // Read environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log(`🔍 Querying districts database...`);
  const { data: districts, error: distError } = await supabase
    .from("districts")
    .select("id, name_en");

  if (distError || !districts) {
    console.error("❌ Failed to query districts table:", distError?.message);
    process.exit(1);
  }

  const districtMap = new Map<string, number>();
  districts.forEach((d) => {
    districtMap.set(d.name_en.toLowerCase().trim(), d.id);
    if (d.name_en === "Comilla") districtMap.set("cumilla", d.id);
    if (d.name_en === "Chittagong") districtMap.set("chattogram", d.id);
  });

  console.log(`🔍 Querying existing temples to check duplicates...`);
  const { data: existingTemples } = await supabase.from("temples").select("name, district_id");
  const existingSet = new Set<string>();
  if (existingTemples) {
    existingTemples.forEach((t) => {
      existingSet.add(`${t.name.toLowerCase().trim()}_${t.district_id}`);
    });
  }

  let successCount = 0;
  let skippedDuplicates = 0;
  let errorCount = invalidRows.length;

  const recordsToInsert: any[] = [];

  for (const row of validRows) {
    const districtId = districtMap.get(row.district_name_en.toLowerCase().trim());
    if (!districtId) {
      console.warn(`⚠️ Row #${row.rowNumber} skipped: District '${row.district_name_en}' not found in DB.`);
      errorCount++;
      continue;
    }

    const key = `${row.temple_name.toLowerCase().trim()}_${districtId}`;
    if (existingSet.has(key)) {
      skippedDuplicates++;
      continue;
    }

    recordsToInsert.push({
      name: row.temple_name,
      district_id: districtId,
      address_text: row.address_text || null,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
      source: "puja_udjapan_parishad_2025",
      is_verified: true,
    });

    existingSet.add(key);
  }

  if (recordsToInsert.length > 0) {
    console.log(`🚀 Batch inserting ${recordsToInsert.length} temples into database...`);
    const { error: insertError } = await supabase.from("temples").insert(recordsToInsert);

    if (insertError) {
      console.error("❌ Batch insert error:", insertError.message);
    } else {
      successCount = recordsToInsert.length;
    }
  }

  console.log("\n=======================================================");
  console.log("  IMPORT SUMMARY AUDIT RESULTS");
  console.log("=======================================================");
  console.log(`✅ Successfully Imported: ${successCount} temples`);
  console.log(`⏭️  Skipped Duplicates:    ${skippedDuplicates} temples`);
  console.log(`❌ Validation Errors:     ${errorCount} rows`);
  console.log("=======================================================\n");
}

runCLIImport().catch((err) => {
  console.error("Fatal script error:", err);
  process.exit(1);
});
