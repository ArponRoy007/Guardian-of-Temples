"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ReactionType, PostReactionSummary } from "@/lib/queries/getPostReactions";

export async function toggleReactionAction({
  postId,
  reactionType,
}: {
  postId: string;
  reactionType: ReactionType;
}): Promise<{
  success?: boolean;
  error?: string;
  userReaction?: ReactionType | null;
  counts?: PostReactionSummary["counts"];
}> {
  try {
    const supabase = createClient();

    // 1. Authenticate user server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required. Please sign in to react to posts." };
    }

    // 2. Query existing reaction row for (post_id, user_id)
    const { data: existingReaction, error: fetchErr } = await supabase
      .from("post_reactions")
      .select("id, reaction_type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch existing reaction error:", fetchErr.message);
      return { error: fetchErr.message };
    }

    let newUserReaction: ReactionType | null = null;

    if (!existingReaction) {
      // Case 1: No reaction exists -> Insert new reaction
      const { error: insertErr } = await supabase.from("post_reactions").insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: reactionType,
      });

      if (insertErr) return { error: insertErr.message };
      newUserReaction = reactionType;
    } else if (existingReaction.reaction_type === reactionType) {
      // Case 2: User clicked the SAME reaction type -> Toggle Off (Delete)
      const { error: deleteErr } = await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteErr) return { error: deleteErr.message };
      newUserReaction = null;
    } else {
      // Case 3: User clicked a DIFFERENT reaction type -> Update row
      const { error: updateErr } = await supabase
        .from("post_reactions")
        .update({ reaction_type: reactionType })
        .eq("id", existingReaction.id);

      if (updateErr) return { error: updateErr.message };
      newUserReaction = reactionType;
    }

    // 3. Compute updated aggregate counts
    const { data: allReactions } = await supabase
      .from("post_reactions")
      .select("reaction_type")
      .eq("post_id", postId);

    const counts = { pray: 0, love: 0, flower: 0, total: 0 };
    if (allReactions) {
      for (const r of allReactions) {
        const type = r.reaction_type as ReactionType;
        if (type in counts) {
          counts[type]++;
          counts.total++;
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/search");

    return {
      success: true,
      userReaction: newUserReaction,
      counts,
    };
  } catch (err: any) {
    console.error("toggleReactionAction exception:", err);
    return { error: err.message || "Failed to update reaction." };
  }
}
