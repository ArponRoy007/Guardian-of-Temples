import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TempleFeedList } from "@/components/feed/TempleFeedList";
import { HomepageWelcomeBanner } from "@/components/feed/HomepageWelcomeBanner";
import { MapPin, ShieldAlert, ArrowRight, Church, Sparkles } from "lucide-react";

export const metadata = {
  title: "Guardian of Temples — Community Feed & Safety Map",
  description: "Explore positive daily photo updates from verified temple committees across Bangladesh and monitor temple safety incident reports.",
};

export const revalidate = 60; // Stale-while-revalidate 60 seconds

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch initial batch of 10 feed posts server-side
  const feedResult = await getFeedPosts({
    cursor: null,
    limit: 10,
    userId: user?.id,
  });

  return (
    <main className="min-h-screen py-6 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      {/* 1. Dismissible Welcome Hero Banner for First-time/Logged-out Visitors */}
      <HomepageWelcomeBanner />

      {/* 2. Persistent Area Safety Map Pinned Callout Card */}
      <div className="glass-card rounded-3xl p-5 border border-red-500/20 bg-red-500/5 dark:bg-red-950/20 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              Check Area Safety & Risk Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 64-district safety map & verified incident records.
            </p>
          </div>
        </div>

        <Link
          href="/safety-map"
          className="inline-flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 text-xs font-bold shadow-glow-danger transition-all shrink-0 active:scale-95"
        >
          <span>View Map</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 3. Community Temple Feed List */}
      <TempleFeedList
        initialPosts={feedResult.posts}
        initialNextCursor={feedResult.nextCursor}
        initialHasMore={feedResult.hasMore}
      />
    </main>
  );
}