"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FeedPostItem, getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TemplePostCard } from "@/components/feed/TemplePostCard";
import { useAuth } from "@/lib/hooks/useAuth";
import { Camera, CheckCircle2, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

export interface TemplePostsGridProps {
  templeId: string;
  initialPosts: FeedPostItem[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  isMyTempleAdmin?: boolean;
}

export function TemplePostsGrid({
  templeId,
  initialPosts,
  initialNextCursor,
  initialHasMore,
  isMyTempleAdmin = false,
}: TemplePostsGridProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPostItem[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch Next Page of Posts for this temple
  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    const result = await getFeedPosts({
      templeId,
      cursor: nextCursor,
      limit: 10,
      userId: user?.id,
    });

    setLoadingMore(false);

    if (result.posts.length > 0) {
      setPosts((prev) => [...prev, ...result.posts]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } else {
      setHasMore(false);
    }
  }, [templeId, hasMore, loadingMore, nextCursor, user?.id]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [fetchNextPage, hasMore, loadingMore]);

  // Empty State (0 posts for this temple yet)
  if (posts.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          <ImageIcon className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            No Temple Posts Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This temple doesn't have any published feed photos yet.
          </p>
        </div>

        {isMyTempleAdmin && (
          <div className="pt-2">
            <Link
              href="/temple-feed/new-post"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-indigo-500 transition-all active:scale-95"
            >
              <Camera className="h-4 w-4" />
              <span>Share your temple's first update!</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Temple Feed & Gallery ({posts.length})
          </h3>
        </div>
      </div>

      {/* Feed Cards List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <TemplePostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Sentinel & Infinite Scroll Loader */}
      <div ref={observerTarget} className="pt-4 pb-8 flex flex-col items-center justify-center space-y-4">
        {loadingMore && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span>Loading more posts...</span>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>You've viewed all posts from this temple!</span>
          </div>
        )}
      </div>
    </div>
  );
}
