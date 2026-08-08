import { createClient } from "@/lib/supabase/client";

export type ReactionType = "pray" | "love" | "flower";

export interface PostReactionSummary {
  userReaction: ReactionType | null;
  counts: {
    pray: number;
    love: number;
    flower: number;
    total: number;
  };
}

/**
 * Efficiently fetches aggregate reaction counts per post and current user's reaction
 * for a list of post IDs.
 */
export async function getPostReactions(
  postIds: string[],
  userId?: string | null
): Promise<Record<string, PostReactionSummary>> {
  if (!postIds.length) return {};

  const supabase = createClient();

  // Initialize empty summary map for all requested postIds
  const resultMap: Record<string, PostReactionSummary> = {};
  for (const id of postIds) {
    resultMap[id] = {
      userReaction: null,
      counts: { pray: 0, love: 0, flower: 0, total: 0 },
    };
  }

  try {
    // 1. Fetch reaction rows to compute aggregate counts per post & type
    const { data: reactionRows, error } = await supabase
      .from("post_reactions")
      .select("post_id, reaction_type")
      .in("post_id", postIds);

    if (!error && reactionRows) {
      for (const row of reactionRows) {
        const summary = resultMap[row.post_id];
        if (summary) {
          const type = row.reaction_type as ReactionType;
          if (type in summary.counts) {
            summary.counts[type]++;
            summary.counts.total++;
          }
        }
      }
    }

    // 2. Fetch current user's own reactions for these postIds (if logged in)
    if (userId) {
      const { data: userReactions } = await supabase
        .from("post_reactions")
        .select("post_id, reaction_type")
        .eq("user_id", userId)
        .in("post_id", postIds);

      if (userReactions) {
        for (const ur of userReactions) {
          const summary = resultMap[ur.post_id];
          if (summary) {
            summary.userReaction = ur.reaction_type as ReactionType;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error fetching post reactions:", err);
  }

  return resultMap;
}
