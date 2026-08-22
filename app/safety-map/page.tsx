import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { SearchBar } from "@/components/search/SearchBar";
import {
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Safety Map & Incident Tracker — Guardian of Temples",
  description:
    "Interactive incident tracking map monitoring Durga Puja temple safety and verified incident reports across Bangladesh's 64 districts.",
};

export const revalidate = 0; // Ensures fresh database data on every request

export default async function SafetyMapPage() {
  const supabase = createClient();

  // 1. Fetch live stat counts from Supabase
  const { count: verifiedCount } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: pendingCount } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // 2. Fetch all approved incidents to compute high-risk districts
  const { data: approvedDistrictsData } = await supabase
    .from("incidents")
    .select("district_id")
    .eq("status", "approved");

  const districtCounts: Record<string, number> = {};
  approvedDistrictsData?.forEach((item) => {
    if (item.district_id) {
      districtCounts[item.district_id] =
        (districtCounts[item.district_id] || 0) + 1;
    }
  });

  const highRiskCount = Object.values(districtCounts).filter(
    (count) => count >= 5
  ).length;

  // 3. Fetch latest approved incidents feed from database
  const { data: recentIncidentsData } = await supabase
    .from("incidents")
    .select(
      `
      id,
      temple_name_raw,
      temple:temples(name),
      district:districts(name_en, name_bn),
      incident_date,
      incident_type,
      description,
      evidence_url,
      created_at
    `
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-primary-950/50 p-6 sm:p-10 border border-slate-800 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>নিরাপত্তা তথ্য ও সচেতনতা প্ল্যাটফর্ম</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            মন্দির নিরাপত্তা মানচিত্র{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-300 to-emerald-300">
              বাংলাদেশ{" "}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            বাংলাদেশের ৬৪ জেলার মন্দির ও সনাতন সম্প্রদায়ের যাচাইকৃত নিরাপত্তা
            তথ্য নিয়ে তৈরি এই ডিজিটাল মানচিত্র। সঠিক তথ্য প্রদান, জনসচেতনতা
            বৃদ্ধি এবং প্রশাসনকে সহায়তার মাধ্যমে নিরাপদ সমাজ গঠনে এটি একটি
            নির্ভরযোগ্য উদ্যোগ।
          </p>
          <div className="pt-2 flex items-center">
            <Link
              href="/submit-incident"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Report an Incident
            </Link>
          </div>
        </div>
      </section>

      {/* Prominent Homepage Search Bar */}
      <section className="max-w-3xl mx-auto">
        <SearchBar placeholder="Search 64 districts (e.g. Cumilla, চট্টগ্রাম) or temple name..." />
      </section>

      {/* Real-time Overview Stat Badges */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              District Monitoring
            </span>
            <MapPin className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <span className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight block">
              Verified coverage across all 64 districts
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              All 8 Divisions Monitored
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Verified Reports
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {verifiedCount ?? 0}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Publicly displayed on map
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending Review
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingCount ?? 0}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Awaiting moderator check
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              High Risk Areas
            </span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              {highRiskCount} {highRiskCount === 1 ? "District" : "Districts"}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              5+ approved incidents
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURE: Interactive 64-District Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Interactive Bangladesh Incident Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Graduated red intensity scale powered by live Supabase view data
            </p>
          </div>
        </div>

        <BangladeshMap />
      </section>

      {/* Recent Approved Incidents Feed */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Recent Approved Incident Feed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest cross-verified incidents with news source links
            </p>
          </div>
        </div>

        {!recentIncidentsData || recentIncidentsData.length === 0 ? (
          <div className="rounded-3xl glass-card p-8 sm:p-10 text-center space-y-3 border border-slate-200 dark:border-slate-800 max-w-lg mx-auto shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              No Verified Incident Reports
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              No verified reports yet for this area — this reflects a safe, incident-free record, not missing data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentIncidentsData.map((incident: any) => {
              const templeName =
                incident.temple?.name ||
                incident.temple_name_raw ||
                "Unlisted Temple Site";
              const districtName = incident.district
                ? `${incident.district.name_en}`
                : "Bangladesh";

              return (
                <div
                  key={incident.id}
                  className="glass-card rounded-2xl p-4 space-y-3 flex flex-col justify-between border-l-4 border-l-red-600 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-950/80 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-300 capitalize">
                        {incident.incident_type?.replace("_", " ") ||
                          "Incident"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {districtName} • {incident.incident_date}
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {incident.description || templeName}
                    </h3>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Verified Report
                    </span>
                    {incident.evidence_url ? (
                      <a
                        href={incident.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline text-primary-600 dark:text-primary-400 font-medium"
                      >
                        Evidence <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Public Record</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
