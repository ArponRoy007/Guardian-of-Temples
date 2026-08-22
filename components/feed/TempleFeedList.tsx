"use client";

import { getFreshUnreactedFeedAction } from "@/app/temple-feed/post-actions";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FeedPostItem, getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TemplePostCard } from "@/components/feed/TemplePostCard";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  RefreshCw,
  CheckCircle2,
  Camera,
  Loader2,
  Church,
} from "lucide-react";

export interface TempleFeedListProps {
  initialPosts: FeedPostItem[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}

export function TempleFeedList({
  initialPosts,
  initialNextCursor,
  initialHasMore,
}: TempleFeedListProps) {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState<FeedPostItem[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const isTempleAdmin = role === "temple_admin";

  // Fetch Next Page of Posts (Infinite Scroll)
  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    const result = await getFeedPosts({
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
  }, [hasMore, loadingMore, nextCursor, user?.id]);

  // Refresh Feed (Now uses the unreacted posts action)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Call our new server action to get fresh, unreacted posts
    const result = await getFreshUnreactedFeedAction();
    
    setIsRefreshing(false);

    if (result.posts) {
      // Cast the result to FeedPostItem array to match the state type
      setPosts(result.posts as FeedPostItem[]);
      // Reset pagination state since this custom action returns a fresh top 20 batch
      setNextCursor(null);
      setHasMore(false);
    } else if (result.error) {
      console.error("Refresh failed:", result.error);
    }
  };

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

    return () => {
      observer.unobserve(target);
    };
  }, [fetchNextPage, hasMore, loadingMore]);

  return (
    <div className="space-y-6">
      {/* Top Feed Header & Refresh Control */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        
        {/* Redesigned Official Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-500 shadow-sm">
            <Church className="h-4 w-4" />
          </div>
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Latest Temple Updates
          </h2>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary-500" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Empty State Case (0 Posts exist) */}
      {posts.length === 0 && !isRefreshing && (
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Church className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              No Feed Posts Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verified temple admins haven't shared any photo updates yet. Check back soon!
            </p>
          </div>

          {isTempleAdmin && (
            <div className="pt-2">
              <Link
                href="/temple-feed/new-post"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <span>Be the first to share an update!</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Single Column Feed Card List */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <TemplePostCard key={post.id} post={post} priority={index < 2} />
        ))}
      </div>

      {/* Infinite Scroll Trigger Sentinel & Loading Skeletons */}
      <div ref={observerTarget} className="pt-4 pb-8 flex flex-col items-center justify-center space-y-4">
        {loadingMore && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            <span>Loading more updates...</span>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>You're all caught up! Check back later for more updates.</span>
          </div>
        )}
      </div>
    </div>
  );
}