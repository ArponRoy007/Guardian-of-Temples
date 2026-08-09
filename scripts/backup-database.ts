import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backupDatabase() {
  console.log("Starting database backup...");

  // List your core tables to back up
  const tables = ["profiles", "temples", "temple_posts", "post_reactions", "incidents"];
  const backupData: Record<string, any> = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      console.error(`Error backing up table ${table}:`, error.message);
    } else {
      backupData[table] = data;
      console.log(`Backed up ${data.length} rows from ${table}`);
    }
  }

  console.log("Backup payload generated successfully:", JSON.stringify(backupData, null, 2));
}

backupDatabase();