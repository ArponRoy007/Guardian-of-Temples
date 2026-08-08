// ====================================================================
// WARNING: DEVELOPMENT / STAGING TEST DATA CLEANUP SCRIPT
// DO NOT RUN THIS SCRIPT AGAINST PRODUCTION DATABASE
// ====================================================================

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_EMAILS = [
  "admin@test.com",
  "moderator@test.com",
  "templeadmin@test.com",
  "user@test.com",
];

async function cleanupTestData() {
  console.log("🧹 Starting Test Data Teardown Sequence...");
  console.log(`📍 Supabase Target Project: ${supabaseUrl}\n`);

  // 1. Fetch user IDs for test emails
  const { data: usersList } = await supabase.auth.admin.listUsers();
  const targetUsers = usersList?.users?.filter((u) => u.email && TEST_EMAILS.includes(u.email)) || [];

  const targetUserIds = targetUsers.map((u) => u.id);

  if (targetUserIds.length > 0) {
    // Delete test posts created by these users
    const { error: postErr } = await supabase
      .from("temple_posts")
      .delete()
      .in("created_by", targetUserIds);

    if (!postErr) console.log("🗑️ Deleted test posts created by test users.");

    // Delete test admin requests submitted by these users
    const { error: reqErr } = await supabase
      .from("temple_admin_requests")
      .delete()
      .in("requested_by", targetUserIds);

    if (!reqErr) console.log("🗑️ Deleted test temple admin requests.");

    // Delete auth users (ON DELETE CASCADE removes public.profiles automatically)
    for (const u of targetUsers) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
      if (delErr) {
        console.error(`❌ Failed to delete auth user ${u.email}:`, delErr.message);
      } else {
        console.log(`✅ Deleted auth user & profile: ${u.email}`);
      }
    }
  } else {
    console.log("ℹ️ No test auth users found.");
  }

  // 2. Delete mock temple "Test Temple Dhaka"
  const { data: temple } = await supabase
    .from("temples")
    .select("id")
    .eq("name", "Test Temple Dhaka")
    .maybeSingle();

  if (temple) {
    const { error: tErr } = await supabase.from("temples").delete().eq("id", temple.id);
    if (!tErr) console.log("🗑️ Deleted mock temple 'Test Temple Dhaka'.");
  }

  console.log("\n🎉 Cleanup Complete! Environment reset cleanly.");
}

cleanupTestData().catch((err) => {
  console.error("Fatal error during cleanup:", err);
  process.exit(1);
});
