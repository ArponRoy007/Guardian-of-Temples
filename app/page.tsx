import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TempleFeedList } from "@/components/feed/TempleFeedList";
import { HomepageWelcomeBanner } from "@/components/feed/HomepageWelcomeBanner";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getAllUpcomingEvents } from "@/lib/panjika/festivals";

export const metadata = {
  title: "Guardian of Temples — Community Feed & Safety Map",
  description:
    "Explore positive daily photo updates from verified temple committees across Bangladesh and monitor temple safety incident reports.",
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

  // Homepage JSON-LD: Organization & WebSite with SearchAction
  const homepageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://guardianoftemples.online/#organization",
        name: "Guardian of Temples",
        url: "https://guardianoftemples.online",
        logo: "https://guardianoftemples.online/favicon.svg",
      },
      {
        "@type": "WebSite",
        "@id": "https://guardianoftemples.online/#website",
        url: "https://guardianoftemples.online",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://guardianoftemples.online/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <main className="min-h-screen py-6 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
        {/* 1. Dismissible Welcome Hero Banner for Visitors */}
        <HomepageWelcomeBanner />

        {/* 2. Panjika Glass Card Section */}
        <div className="glass-card rounded-3xl p-5 border border-orange-500/20 bg-orange-500/5 dark:bg-orange-950/20 shadow-lg flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-[#C08A34] text-white shadow-md">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white truncate">
                আজকের পঞ্জিকা ও তিথি
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                প্রতিদিনের উৎসব, ব্রত ও সঠিক পূজার সময়সূচী
              </p>
            </div>
          </div>

          <Link
            href="/panjika"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C08A34] hover:bg-[#A8792D] text-white px-4 py-2.5 text-[13px] font-bold shadow-lg shadow-orange-900/20 transition-all shrink-0 active:scale-95"
          >
            <span>দেখুন</span>
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
    </>
  );
}
