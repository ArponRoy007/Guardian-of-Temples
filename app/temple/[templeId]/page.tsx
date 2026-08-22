import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TempleProfileHeader } from "@/components/temple/TempleProfileHeader";
import { TemplePostsGrid } from "@/components/temple/TemplePostsGrid";

interface TemplePageProps {
  params: {
    templeId: string;
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  // Build Dynamic PlaceOfWorship JSON-LD Schema (respecting address_display_level privacy)
  const districtName = (temple.districts as any)?.name_en || "Bangladesh";
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