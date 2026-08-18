import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts } from "@/lib/queries/getFeedPosts";
import { TempleProfileHeader } from "@/components/temple/TempleProfileHeader";
import { TemplePostsGrid } from "@/components/temple/TemplePostsGrid";

interface TemplePageProps {
  params: {
    templeId: string;
  };
}

export async function generateMetadata({ params }: TemplePageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: temple } = await supabase
    .from("temples")
    .select("name, is_verified, address_text, districts(name_en, name_bn)")
    .eq("id", params.templeId)
    .maybeSingle();

  if (!temple) {
    return {
      title: "Temple Not Found | Guardian of Temples",
      description: "The requested temple profile could not be found.",
    };
  }

  const districtName = (temple.districts as any)?.name_en || "Bangladesh";
  const verifiedBadge = temple.is_verified ? "Official Verified Temple" : "Temple Profile";

  return {
    title: `${temple.name} (${districtName}) — Guardian of Temples`,
    description: `${verifiedBadge} page for ${temple.name} in ${districtName}. View positive community feed posts, festival updates, and verified safety information.`,
    openGraph: {
      title: `${temple.name} — Guardian of Temples`,
      description: `Official profile and community feed updates for ${temple.name} in ${districtName}, Bangladesh.`,
    },
  };
}

export default async function TempleProfilePage({ params }: TemplePageProps) {
  const supabase = createClient();

  // 1. Fetch Temple Record
  const { data: temple, error: templeErr } = await supabase
    .from("temples")
    .select("*, districts(id, name_en, name_bn, division)")
    .eq("id", params.templeId)
    .maybeSingle();

  if (templeErr || !temple) {
    notFound();
  }

  // 2. Fetch User Session (if authenticated)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Fetch Incident Stats for Safety Verdict Card
  const { count: incidentCount, data: recentIncidents } = await supabase
    .from("incidents")
    .select("incident_date", { count: "exact" })
    .eq("temple_id", temple.id)
    .eq("status", "approved")
    .order("incident_date", { ascending: false })
    .limit(1);

  // 4. Fetch Initial Batch of Posts for this Temple
  const postsResult = await getFeedPosts({
    templeId: temple.id,
    cursor: null,
    limit: 10,
    userId: user?.id,
  });

  // 5. Build Dynamic JSON-LD Schema
  const districtName = (temple.districts as any)?.name_en || "Bangladesh";
  const templeJsonLd = {
    "@context": "https://schema.org",
    "@type": "PlaceOfWorship",
    additionalType: "https://en.wikipedia.org/wiki/Hindu_temple",
    name: temple.name,
    image: temple.cover_image_url || "https://guardianoftemples.online/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: temple.address_text || "",
      addressLocality: districtName,
      addressCountry: "BD"
    },
    // Only include geo if latitude and longitude exist in the DB
    ...(temple.latitude && temple.longitude ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: temple.latitude,
        longitude: temple.longitude
      }
    } : {}),
    url: `https://guardianoftemples.online/${params.templeId}`,
    isAccessibleForFree: true
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