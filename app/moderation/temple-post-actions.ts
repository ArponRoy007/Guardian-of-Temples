"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function removeTemplePostAction({
  postId,
  reason,
}: {
  postId: string;
  reason: string;
}): Promise<{ success?: boolean; error?: string; message?: string }> {
  try {
    const trimmedReason = reason?.trim() || "";

    if (trimmedReason.length < 10) {
      return { error: "Moderation reason must be at least 10 characters long." };
    }

    const supabase = createClient();

    // 1. Authenticate User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required. Please sign in as a moderator or admin." };
    }

    // 2. AIRTIGHT SERVER-SIDE ROLE CHECK: Must be moderator or admin
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return { error: "Failed to verify user permissions." };
    }

    const isModeratorOrAdmin = profile.role === "moderator" || profile.role === "admin";
    if (!isModeratorOrAdmin) {
      return { error: "Access denied. Only moderators and admins can remove posts." };
    }

    // 3. Step A: Soft-delete the post in temple_posts (is_deleted = true)
    const { error: deleteErr } = await supabase
      .from("temple_posts")
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (deleteErr) {
      console.error("Temple post soft delete error:", deleteErr.message);
      return { error: deleteErr.message || "Failed to remove post." };
    }

    // 4. Step B: Insert into post_moderation_log
    // (Note: DB Trigger trg_on_post_moderated automatically auto-creates notification for temple_admin & sets notified=true)
    const { error: logErr } = await supabase.from("post_moderation_log").insert({
      post_id: postId,
      deleted_by: user.id,
      reason: trimmedReason,
      notified: false,
    });

    if (logErr) {
      console.error("Post moderation log error:", logErr.message);
      // Non-fatal if soft-delete succeeded, but log error for diagnostics
    }

    // 5. Revalidate Path Caches
    revalidatePath("/");
    revalidatePath("/temple-feed");
    revalidatePath("/search");
    revalidatePath("/admin/removed-posts");

    return {
      success: true,
      message: "Post removed by moderator successfully.",
    };
  } catch (err: any) {
    console.error("removeTemplePostAction exception:", err);
    return { error: err.message || "An unexpected error occurred during post removal." };
  }
}
