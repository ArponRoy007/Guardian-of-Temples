import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Church } from "lucide-react";

interface DistrictPageProps {
  params: {
    districtId: string;
  };
}

// 1. DYNAMIC SEO METADATA
export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: district } = await supabase
    .from("districts")
    .select("name_en, name_bn")
    .eq("id", params.districtId)
    .maybeSingle();

  if (!district) return { title: "District Not Found | Guardian of Temples" };

  return {
    title: `Hindu Temples in ${district.name_en} | Guardian of Temples`,
    description: `Complete list and directory of Hindu temples in ${district.name_en}, Bangladesh. Get live festival updates, verified safety information, and locations.`,
    keywords: [
      `Hindu temples in ${district.name_en}`,
      `temples in ${district.name_en}`,
      `${district.name_en} Hindu temple`,
      `${district.name_en} temple list`,
      `famous temples in ${district.name_en}`,
      `${district.name_bn} জেলার হিন্দু মন্দির`,
      `বাংলাদেশের ${district.name_bn} জেলার মন্দির`
    ],
    openGraph: {
      title: `Hindu Temples in ${district.name_en} — Guardian of Temples`,
      description: `Explore verified Hindu temples in ${district.name_en}, Bangladesh.`,
    }
  };
}

// 2. PAGE COMPONENT
export default async function DistrictPage({ params }: DistrictPageProps) {
  const supabase = createClient();

  // Fetch District Data
  const { data: district, error: districtErr } = await supabase
    .from("districts")
    .select("*")
    .eq("id", params.districtId)
    .maybeSingle();

  if (districtErr || !district) {
    notFound();
  }

  // Fetch all temples in this district
  const { data: temples } = await supabase
    .from("temples")
    .select("id, name, address_text, is_verified, cover_image_url")
    .eq("district_id", district.id)
    .order("is_verified", { ascending: false }); // Verified temples show first

  // Breadcrumb Schema for Google
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://guardianoftemples.online" },
      { "@type": "ListItem", "position": 2, "name": district.name_en, "item": `https://guardianoftemples.online/district/${district.id}` }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hindu Temples in {district.name_en}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Explore {temples?.length || 0} registered community temples in {district.name_en}, Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {temples && temples.length > 0 ? (
            temples.map((temple) => (
              <Link 
                href={`/temple/${temple.id}`} 
                key={temple.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500 transition-colors"
              >
                <div className="flex-shrink-0 h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {temple.cover_image_url ? (
                    <img src={temple.cover_image_url} alt={temple.name} className="h-full w-full object-cover" />
                  ) : (
                    <Church className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {temple.name}
                  </h2>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{temple.address_text || district.name_en}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              No temples registered in this district yet.
            </div>
          )}
        </div>
      </main>
    </>
  );
}