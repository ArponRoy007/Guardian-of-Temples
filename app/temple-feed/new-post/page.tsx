import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplePostForm } from "@/components/forms/TemplePostForm";
import { MyTemplePostsList } from "@/components/temple-admin/MyTemplePostsList";
import { Camera, Church } from "lucide-react";

export const metadata = {
  title: "Create Temple Feed Post | Guardian of Temples",
  description: "Share photos and updates from your temple on the official Temple Feed.",
};

export default async function NewTemplePostPage() {
  const supabase = createClient();

  // 1. Authenticated User Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/temple-feed/new-post");
  }

  // 2. Fetch User Profile for Role & Linked Temple Verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, linked_temple_id")
    .eq("id", user.id)
    .single();

  // Redirect regular users to Become Temple Admin application portal
  if (profile?.role === "user") {
    redirect("/become-temple-admin");
  }

  // Strict Security Check: must be temple_admin with linked_temple_id
  if (!profile || profile.role !== "temple_admin" || !profile.linked_temple_id) {
    redirect("/not-authorized");
  }

  // 3. Fetch Linked Temple Details
  const { data: temple, error: templeError } = await supabase
    .from("temples")
    .select("id, name, district_id, districts(name_en, name_bn)")
    .eq("id", profile.linked_temple_id)
    .single();

  if (templeError || !temple) {
    console.error("Linked temple lookup error:", templeError?.message);
    redirect("/become-temple-admin");
  }

  // 4. Fetch Temple Admin's Recent Posts for "My Posts" Gallery
  const { data: myPosts } = await supabase
    .from("temple_posts")
    .select("id, image_url, caption, created_at")
    .eq("created_by", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Create Temple Feed Post
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish positive updates, festival highlights, and daily photos for your temple.
            </p>
          </div>
        </div>
      </div>

      {/* Main Post Creation Form */}
      <TemplePostForm
        templeInfo={{
          id: temple.id,
          name: temple.name,
          districtName: (temple.districts as any)?.name_en,
        }}
      />

      {/* My Recent Posts Gallery Section */}
      <MyTemplePostsList posts={(myPosts as any[]) || []} />
    </main>
  );
}
