import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Church, BookOpen, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

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
    title: {
      absolute: `Hindu Temples in ${district.name_en} (${district.name_bn}) | Guardian of Temples`,
    },
    description: `Directory of Hindu temples in ${district.name_en}, Bangladesh. View live photo updates, verified safety notices, and historical mandir guides.`,
    alternates: {
      canonical: `/district/${params.districtId}`,
    },
    openGraph: {
      title: `Hindu Temples in ${district.name_en} — Guardian of Temples`,
      description: `Explore verified Hindu temples in ${district.name_en}, Bangladesh.`,
      url: `/district/${params.districtId}`,
    },
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
    .select("id, slug, name, address_text, is_verified, cover_image_url")
    .eq("district_id", district.id)
    .order("is_verified", { ascending: false }); // Verified temples show first

  // Breadcrumb Schema for Google
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://guardianoftemples.online" },
      { "@type": "ListItem", position: 2, name: district.name_en, item: `https://guardianoftemples.online/district/${district.id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-primary-500 text-xs font-bold uppercase tracking-wider">
            <MapPin className="h-4 w-4" />
            <span>District Directory • Bangladesh</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Hindu Temples in {district.name_en} <span className="text-slate-500 font-normal">({district.name_bn})</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Explore {temples?.length || 0} registered community temples and sacred sites across {district.name_en} district.
          </p>
        </div>

        {/* Task 4: District Custom Intro Paragraph */}
        {district.district_intro && (
          <section className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-2">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <BookOpen className="h-4 w-4" />
              <span>Cultural & Spiritual Heritage of {district.name_en}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {district.district_intro}
            </p>
          </section>
        )}

        {/* Task 5: Contextual Connections */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/festivals/durga-puja"
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-500/20 transition-all"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Durga Puja 2026 Guide</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/panjika"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            <span>আজকের তিথি ও বাংলা পঞ্জিকা</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Temples List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {temples && temples.length > 0 ? (
            temples.map((temple) => (
              <Link
                href={`/temple/${temple.slug || temple.id}`}
                key={temple.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500 transition-colors shadow-sm"
              >
                <div className="flex-shrink-0 h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                  {temple.cover_image_url ? (
                    <img src={temple.cover_image_url} alt={temple.name} className="h-full w-full object-cover" />
                  ) : (
                    <Church className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {temple.name}
                  </h2>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="h-3 w-3 mr-1 text-primary-500" />
                    <span className="truncate">{temple.address_text || district.name_en}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No temples registered in this district yet.
            </div>
          )}
        </div>
      </main>
    </>
  );
}