import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TempleProfileHeader } from "@/components/temple/TempleProfileHeader";
import { TemplePostsGrid } from "@/components/temple/TemplePostsGrid";
import { BookOpen, Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";

interface TemplePageProps {
  params: {
    templeId: string;
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FESTIVAL_NAME_MAP: Record<string, string> = {
  "durga-puja": "Durga Puja (দুর্গাপূজা)",
  "kali-puja": "Kali Puja (শ্যামাপূজা)",
  "saraswati-puja": "Saraswati Puja (সরস্বতী পূজা)",
  "lakshmi-puja": "Lakshmi Puja (লক্ষ্মী পূজা)",
  janmashtami: "Janmashtami (জন্মাষ্টমী)",
  "rath-yatra": "Rath Yatra (রথযাত্রা)",
};

async function fetchTempleBySlugOrId(param: string) {
  const supabase = createClient();
  const isUuid = UUID_REGEX.test(param);

  if (isUuid) {
    const { data } = await supabase
      .from("temples")
      .select("*, districts(id, name_en, name_bn, division)")
      .eq("id", param)
      .maybeSingle();
    return { temple: data, isUuid: true };
  }

  // Try slug lookup first, then fallback to id
  const { data: templeBySlug } = await supabase
    .from("temples")
    .select("*, districts(id, name_en, name_bn, division)")
    .eq("slug", param)
    .maybeSingle();

  if (templeBySlug) {
    return { temple: templeBySlug, isUuid: false };
  }

  const { data: templeById } = await supabase
    .from("temples")
    .select("*, districts(id, name_en, name_bn, division)")
    .eq("id", param)
    .maybeSingle();

  return { temple: templeById, isUuid: false };
}

export async function generateMetadata({ params }: TemplePageProps): Promise<Metadata> {
  const { temple } = await fetchTempleBySlugOrId(params.templeId);

  if (!temple) {
    return {
      title: "Temple Not Found | Guardian of Temples",
      description: "The requested temple profile could not be found.",
    };
  }

  const districtName = (temple.districts as any)?.name_en || "Bangladesh";
  const verifiedBadge = temple.is_verified ? "Official Verified Temple" : "Temple Profile";
  const slugOrId = temple.slug || temple.id;

  return {
    title: {
      absolute: `${temple.name} (${districtName}) — Guardian of Temples`,
    },
    description: `${verifiedBadge} page for ${temple.name} in ${districtName}. View positive community feed posts, festival updates, and verified safety information.`,
    alternates: {
      canonical: `/temple/${slugOrId}`,
    },
    openGraph: {
      title: `${temple.name} — Guardian of Temples`,
      description: `Official profile and community feed updates for ${temple.name} in ${districtName}, Bangladesh.`,
      url: `/temple/${slugOrId}`,
    },
  };
}

export default async function TempleProfilePage({ params }: TemplePageProps) {
  const { temple, isUuid } = await fetchTempleBySlugOrId(params.templeId);

  if (!temple) {
    notFound();
  }

  // If accessed by UUID and a human-readable slug exists, redirect permanently to slug URL
  if (isUuid && temple.slug) {
    redirect(`/temple/${temple.slug}`);
  }

  const supabase = createClient();

  // Fetch User Session (if authenticated)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch Incident Stats for Safety Verdict Card
  const { count: incidentCount, data: recentIncidents } = await supabase
    .from("incidents")
    .select("incident_date", { count: "exact" })
    .eq("temple_id", temple.id)
    .eq("status", "approved")
    .order("incident_date", { ascending: false })
    .limit(1);

  // Fetch Initial Batch of Posts for this Temple
  const postsResult = await getFeedPosts({
    templeId: temple.id,
    cursor: null,
    limit: 10,
    userId: user?.id,
  });

  // Build Dynamic PlaceOfWorship JSON-LD Schema
  const districtName = (temple.districts as any)?.name_en || "Bangladesh";
  const districtNameBn = (temple.districts as any)?.name_bn || "";
  const isFullAddressVisible = temple.address_display_level !== "district_only";

  const templeJsonLd = {
    "@context": "https://schema.org",
    "@type": "PlaceOfWorship",
    additionalType: "https://en.wikipedia.org/wiki/Hindu_temple",
    name: temple.name,
    image: temple.cover_image_url || "https://guardianoftemples.online/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      ...(isFullAddressVisible && temple.address_text ? { streetAddress: temple.address_text } : {}),
      addressLocality: districtName,
      addressCountry: "BD",
    },
    ...(temple.latitude && temple.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: temple.latitude,
            longitude: temple.longitude,
          },
        }
      : {}),
    url: `https://guardianoftemples.online/temple/${temple.slug || temple.id}`,
    isAccessibleForFree: true,
  };

  const notableFestivals: string[] = Array.isArray(temple.notable_festivals)
    ? temple.notable_festivals
    : [];

  return (
    <>
      {/* Dynamic Schema Injection for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(templeJsonLd) }}
      />

      <main className="min-h-screen py-8 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
        {/* Temple Header with Cover, Safety Verdict & Actions */}
        <TempleProfileHeader
          temple={temple as any}
          incidentCount={incidentCount || 0}
          mostRecentIncidentDate={recentIncidents?.[0]?.incident_date || null}
        />

        {/* Dynamic History & Cultural Notes (Task 1) */}
        {(temple.history_notes || temple.puja_calendar_notes) && (
          <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
            {temple.history_notes && (
              <div className="space-y-2">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <span>About & Cultural History</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {temple.history_notes}
                </p>
              </div>
            )}

            {temple.puja_calendar_notes && (
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  <span>Festival & Annual Puja Celebrations</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {temple.puja_calendar_notes}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Task 5: Contextual Internal Links (District & Festival Connections) */}
        <section className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Cultural & District Connections</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Link to District Directory */}
            {temple.district_id && (
              <Link
                href={`/district/${temple.district_id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-500/40 transition-all shadow-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-primary-500" />
                <span>View all temples in {districtName} ({districtNameBn})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            {/* Links to Notable Festivals */}
            {notableFestivals.map((festSlug) => (
              <Link
                key={festSlug}
                href={`/festivals/${festSlug}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-500/20 transition-all shadow-sm"
              >
                <Calendar className="h-3.5 w-3.5 text-orange-500" />
                <span>{FESTIVAL_NAME_MAP[festSlug] || festSlug}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}

            {/* Link to Panjika */}
            <Link
              href="/panjika"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm"
            >
              <span>আজকের তিথি ও বাংলা পঞ্জিকা</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Scoped Temple Posts Feed & Gallery */}
        <TemplePostsGrid
          templeId={temple.id}
          initialPosts={postsResult.posts}
          initialNextCursor={postsResult.nextCursor}
          initialHasMore={postsResult.hasMore}
        />
      </main>
    </>
  );
}