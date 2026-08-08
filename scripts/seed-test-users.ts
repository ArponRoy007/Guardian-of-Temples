// ====================================================================
// WARNING: DEVELOPMENT / STAGING TEST USER SEEDING SCRIPT
// DO NOT RUN THIS SCRIPT AGAINST PRODUCTION DATABASE
// ====================================================================

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Initialize Supabase Admin client with SERVICE_ROLE_KEY (bypasses RLS & handles auth admin APIs)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TestUserDef {
  email: string;
  password: string;
  role: "user" | "temple_admin" | "moderator" | "admin";
  fullName: string;
  requiresTempleLink?: boolean;
}

const TEST_USERS: TestUserDef[] = [
  {
    email: "admin@test.com",
    password: "password123",
    role: "admin",
    fullName: "System Admin User",
  },
  {
    email: "moderator@test.com",
    password: "password123",
    role: "moderator",
    fullName: "Volunteer Moderator",
  },
  {
    email: "templeadmin@test.com",
    password: "password123",
    role: "temple_admin",
    fullName: "Dhaka Temple Admin",
    requiresTempleLink: true,
  },
  {
    email: "user@test.com",
    password: "password123",
    role: "user",
    fullName: "Community Reporter User",
  },
];

async function seedTestUsers() {
  console.log("🚀 Starting Test User Seeding Sequence...");
  console.log(`📍 Supabase Target Project: ${supabaseUrl}\n`);

  // 1. Fetch ID of 'Test Temple Dhaka' for linking templeadmin@test.com
  const { data: temple, error: templeErr } = await supabase
    .from("temples")
    .select("id, name")
    .eq("name", "Test Temple Dhaka")
    .maybeSingle();

  if (templeErr) {
    console.error("⚠️ Error querying mock temple:", templeErr.message);
  }

  const mockTempleId = temple?.id || null;
  if (temple) {
    console.log(`✅ Found Mock Temple: "${temple.name}" (${temple.id})`);
  } else {
    console.warn(
      "⚠️ Warning: 'Test Temple Dhaka' not found in public.temples. Please run supabase/seed_test_data.sql first if templeadmin requires a linked temple ID."
    );
  }

  // 2. Loop through and create/update test users
  for (const u of TEST_USERS) {
    let userId: string | null = null;

    // Attempt to create auth user via Admin API
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true, // Auto-confirm email so user can log in immediately!
      user_metadata: { full_name: u.fullName },
    });

    if (createErr) {
      if (createErr.message.includes("already") || createErr.status === 422) {
        console.log(`ℹ️ Auth user ${u.email} already exists. Fetching existing user ID...`);

        // Fetch existing user ID from auth user list
        const { data: usersList } = await supabase.auth.admin.listUsers();
        const existingUser = usersList?.users?.find((usr) => usr.email === u.email);

        if (existingUser) {
          userId = existingUser.id;
          // Update password & confirm email
          await supabase.auth.admin.updateUserById(userId, {
            password: u.password,
            email_confirm: true,
          });
          console.log(`🔄 Reset password and confirmed email for existing user ${u.email}`);
        }
      } else {
        console.error(`❌ Failed to create auth user ${u.email}:`, createErr.message);
        continue;
      }
    } else if (createData.user) {
      userId = createData.user.id;
      console.log(`✨ Successfully created auth user ${u.email} (ID: ${userId})`);
    }

    if (!userId) {
      console.error(`❌ Unable to obtain user ID for ${u.email}`);
      continue;
    }

    // Determine linked_temple_id for temple_admin
    const targetLinkedTempleId = u.requiresTempleLink ? mockTempleId : null;

    // 3. Upsert into public.profiles using returned Auth UUID
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: u.fullName,
          role: u.role,
          linked_temple_id: targetLinkedTempleId,
        },
        { onConflict: "id" }
      );

    if (profileErr) {
      console.error(`❌ Failed to update profile for ${u.email}:`, profileErr.message);
    } else {
      console.log(
        `👤 Updated public.profiles for ${u.email} -> Role: '${u.role}' ${
          targetLinkedTempleId ? `(Linked Temple ID: ${targetLinkedTempleId})` : ""
        }`
      );
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 Test User Seeding Complete! Credentials Summary:");
  console.log("=======================================================");
  TEST_USERS.forEach((u) => {
    console.log(`🔑 ${u.role.toUpperCase().padEnd(12)} -> ${u.email.padEnd(22)} | Pass: ${u.password}`);
  });
  console.log("=======================================================\n");
}

seedTestUsers().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
