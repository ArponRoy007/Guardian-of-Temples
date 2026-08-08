"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action for Temple Admins to delete their OWN published posts.
 * - Re-verifies user role = 'temple_admin' and post ownership server-side.
 * - Soft-deletes (is_deleted = true).
 * - Does NOT insert into post_moderation_log (preserves log for moderator takedowns only; no notification sent).
 */
export async function deleteOwnTemplePostAction({
  postId,
}: {
  postId: string;
}): Promise<{ success?: boolean; error?: string; message?: string }> {
  try {
    const supabase = createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required. Please sign in." };
    }

    // 2. AIRTIGHT SERVER-SIDE CHECK: Verify role = 'temple_admin' and linked_temple_id
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role, linked_temple_id")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return { error: "User profile not found." };
    }

    if (profile.role !== "temple_admin" || !profile.linked_temple_id) {
      return {
        error: "Access denied. Only verified temple admins can delete their own posts.",
      };
    }

    // 3. AIRTIGHT OWNERSHIP VERIFICATION: Confirm post.created_by === user.id AND post.temple_id === profile.linked_temple_id
    const { data: post, error: postErr } = await supabase
      .from("temple_posts")
      .select("id, temple_id, created_by")
      .eq("id", postId)
      .single();

    if (postErr || !post) {
      return { error: "Post record not found." };
    }

    if (post.created_by !== user.id || post.temple_id !== profile.linked_temple_id) {
      return {
        error: "Access denied. You can only delete posts published by your own temple account.",
      };
    }

    // 4. Soft-delete post (is_deleted = true)
    // NOTE: We do NOT insert into post_moderation_log so no moderator notification trigger is fired!
    const { error: deleteErr } = await supabase
      .from("temple_posts")
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (deleteErr) {
      console.error("Temple post self-delete error:", deleteErr.message);
      return { error: deleteErr.message || "Failed to delete post." };
    }

    // 5. Revalidate paths
    revalidatePath("/");
    revalidatePath("/temple-feed");
    revalidatePath(`/temple/${post.temple_id}`);
    revalidatePath("/search");

    return {
      success: true,
      message: "Your post has been deleted successfully.",
    };
  } catch (err: any) {
    console.error("deleteOwnTemplePostAction exception:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

/**
 * Server Action to fetch fresh feed, EXCLUDING posts the current user has already reacted to.
 */
/**
 * Server Action to fetch fresh feed, EXCLUDING posts the current user has already reacted to.
 */
export async function getFreshUnreactedFeedAction() {
  try {
    const supabase = createClient();

    // 1. Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { data: publicFeed, error } = await supabase
        .from("temple_posts")
        .select("*, temple:temples(name), profile:profiles(full_name)")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(20);

      return { posts: publicFeed || [] };
    }

    // 2. Fetch IDs of posts that THIS user has already reacted to
    // FIXED: Changed from "reactions" to "post_reactions"
    const { data: userReactions, error: reactionError } = await supabase
      .from("post_reactions") 
      .select("post_id")
      .eq("user_id", user.id);

    if (reactionError) {
      console.error("Error fetching user reactions:", reactionError.message);
    }

    // 3. Extract the array of IDs safely
    const reactedPostIds = userReactions
      ? userReactions.map((r) => r.post_id).filter(Boolean)
      : [];

    // 4. Build query
    let query = supabase
      .from("temple_posts")
      .select("*, temple:temples(name), profile:profiles(full_name)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(20);

    // 5. Apply the filter using the native Array
    if (reactedPostIds.length > 0) {
      query = query.not("id", "in", `(${reactedPostIds.join(",")})`);
    }

    const { data: freshPosts, error: feedError } = await query;

    if (feedError) {
      console.error("Error fetching fresh feed:", feedError.message);
      return { error: "Failed to refresh feed." };
    }

    return { posts: freshPosts || [] };
  } catch (err: any) {
    console.error("getFreshUnreactedFeedAction exception:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}