import { createClient } from "@/lib/supabase/client";
import { getPostReactions, PostReactionSummary } from "@/lib/queries/getPostReactions";

export interface FeedPostItem {
  id: string;
  temple_id: string;
  created_by: string;
  image_url: string;
  cloudinary_public_id: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
  temple: {
    id: string;
    name: string;
    is_verified: boolean;
    district_id: number;
    districts?: {
      name_en: string;
      name_bn: string;
    } | null;
  } | null;
  reactions: PostReactionSummary;
}

export interface FeedFetchResult {
  posts: FeedPostItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GetFeedPostsOptions {
  cursor?: string | null;
  limit?: number;
  userId?: string | null;
  templeId?: string | null;
}

/**
 * Server-side / Client query fetching active temple feed posts with cursor-based pagination
 * and batch reaction summaries.
 */
export async function getFeedPosts({
  cursor,
  limit = 10,
  userId,
  templeId,
}: GetFeedPostsOptions): Promise<FeedFetchResult> {
  const supabase = createClient();

  try {
    // 1. Build query against temple_posts
    let query = supabase
      .from("temple_posts")
      .select(`
        *,
        temple:temples(
          id,
          name,
          is_verified,
          district_id,
          districts(name_en, name_bn)
        )
      `)
      .eq("is_deleted", false);

    // Apply templeId filter if provided
    if (templeId) {
      query = query.eq("temple_id", templeId);
    }

    query = query.order("created_at", { ascending: false }).limit(limit);

    // Apply cursor filter for infinite scroll (created_at < cursor)
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: postsData, error } = await query;

    if (error || !postsData || !postsData.length) {
      return { posts: [], nextCursor: null, hasMore: false };
    }

    // 2. Extract post IDs for batch reaction lookup
    const postIds = postsData.map((p) => p.id);
    const reactionMap = await getPostReactions(postIds, userId);

    // 3. Assemble complete FeedPostItems
    const posts: FeedPostItem[] = postsData.map((p) => ({
      ...p,
      temple: p.temple as any,
      reactions: reactionMap[p.id] || {
        userReaction: null,
        counts: { pray: 0, love: 0, flower: 0, total: 0 },
      },
    }));

    const hasMore = posts.length === limit;
    const nextCursor = hasMore ? posts[posts.length - 1].created_at : null;

    return {
      posts,
      nextCursor,
      hasMore,
    };
  } catch (err) {
    console.error("getFeedPosts exception:", err);
    return { posts: [], nextCursor: null, hasMore: false };
  }
}
