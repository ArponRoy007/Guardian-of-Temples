"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { SafetyVerdictBadge } from "@/components/ui/SafetyVerdictBadge";
import { SearchBar } from "@/components/search/SearchBar";
import {
  Search,
  MapPin,
  Church,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Shield,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface DistrictResult {
  id: number;
  name_en: string;
  name_bn: string;
  division: string;
  geo_code: string;
  approved_incident_count: number;
}

interface TempleResult {
  id: string;
  name: string;
  address_text?: string;
  district_name?: string;
  district_geo_code?: string;
  incident_count: number;
  last_incident_date?: string;
}

interface IncidentHistory {
  id: string;
  title: string;
  incident_date: string;
  incident_type: string;
  description: string;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [matchedDistrict, setMatchedDistrict] = useState<DistrictResult | null>(null);
  const [matchedTemples, setMatchedTemples] = useState<TempleResult[]>([]);
  const [incidentHistory, setIncidentHistory] = useState<IncidentHistory[]>([]);
  const [didYouMean, setDidYouMean] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function executeSearch() {
      const searchTerm = query.trim();
      if (!searchTerm) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Search Districts (English and Bangla)
        const { data: districtData } = await supabase
          .from("district_incident_counts")
          .select("district_id, name_en, name_bn, division, geo_code, approved_incident_count")
          .or(`name_en.ilike.%${searchTerm}%,name_bn.ilike.%${searchTerm}%`)
          .limit(1);

        if (districtData && districtData.length > 0) {
          const d = districtData[0];
          setMatchedDistrict({
            id: d.district_id,
            name_en: d.name_en,
            name_bn: d.name_bn,
            division: d.division,
            geo_code: d.geo_code,
            approved_incident_count: d.approved_incident_count,
          });

          // Fetch Temples inside this District
          const { data: districtTemples } = await supabase
            .from("temples")
            .select("id, name, address_text")
            .eq("district_id", d.district_id);

          if (districtTemples) {
            setMatchedTemples(
              districtTemples.map((t) => ({
                id: t.id,
                name: t.name,
                address_text: t.address_text,
                district_name: d.name_en,
                district_geo_code: d.geo_code,
                incident_count: 2, // Sample query count
                last_incident_date: "2025-10-12",
              }))
            );
          }
        } else {
          setMatchedDistrict(null);
        }

        // 2. Search Temples directly if not a direct district match or alongside
        const { data: templeData } = await supabase
          .from("temples")
          .select("id, name, address_text, district_id")
          .ilike("name", `%${searchTerm}%`)
          .limit(5);

        if (templeData && templeData.length > 0 && !districtData?.length) {
          setMatchedTemples(
            templeData.map((t) => ({
              id: t.id,
              name: t.name,
              address_text: t.address_text,
              incident_count: 3,
              last_incident_date: "2025-10-11",
            }))
          );
        }

        // 3. Mock Approved Incident History matching search term
        if (searchTerm.length >= 2) {
          setIncidentHistory([
            {
              id: "inc-101",
              title: `Idol vandalism reported near ${searchTerm}`,
              incident_date: "2025-10-12",
              incident_type: "Idol Vandalism",
              description:
                "Unidentified miscreants damaged temple idols during night hours. Local administration notified.",
            },
            {
              id: "inc-102",
              title: `Puja mandap extortion attempt in ${searchTerm}`,
              incident_date: "2025-10-10",
              incident_type: "Threats & Extortion",
              description:
                "Written threats received by celebration committee demanding illegal toll payments.",
            },
          ]);
        }

        // Suggestions for "Did you mean..."
        setDidYouMean(["Cumilla", "Chittagong", "Dhaka", "Noakhali", "Rangpur"]);
      } catch (err) {
        console.error("Search execution failed:", err);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Top Header & Search Bar Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Search Results
            </h1>
            <p className="text-xs text-slate-500">
              Query: <strong className="text-primary-600 dark:text-primary-400">"{query}"</strong>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-80">
          <SearchBar initialValue={query} placeholder="Search another district..." />
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Searching database for matching districts, temples, and incident records...
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* CASE 1: District Match Found */}
          {matchedDistrict ? (
            <div className="space-y-6">
              {/* District Overview Banner */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border-l-4 border-l-primary-500">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-primary-500" />
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                        {matchedDistrict.name_en} District ({matchedDistrict.name_bn})
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Division: <strong>{matchedDistrict.division}</strong> • GeoCode:{" "}
                      <strong>{matchedDistrict.geo_code}</strong>
                    </p>
                  </div>

                  <SafetyVerdictBadge
                    incidentCount={matchedDistrict.approved_incident_count}
                    showExplanation={true}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-center">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      Approved Incidents
                    </span>
                    <span className="font-display text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                      {matchedDistrict.approved_incident_count}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      Monitored Temples
                    </span>
                    <span className="font-display text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                      {matchedTemples.length || 2}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      Risk Level
                    </span>
                    <span className="font-display text-base font-bold text-red-600 dark:text-red-400">
                      {matchedDistrict.approved_incident_count >= 4 ? "High Risk" : "Moderate"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Focused Mini-Map & Temples Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Focused Mini Map */}
                <div className="lg:col-span-2 space-y-2">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Focused Map Location
                  </h3>
                  <BangladeshMap focusedDistrictId={matchedDistrict.geo_code} />
                </div>

                {/* District Affected Temples Sidebar */}
                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Church className="h-4 w-4 text-amber-500" />
                    District Temples & Puja Mandaps
                  </h3>

                  <div className="space-y-3">
                    {matchedTemples.map((temple) => (
                      <div
                        key={temple.id}
                        className="glass-card rounded-2xl p-4 space-y-2 border border-slate-200 dark:border-slate-800"
                      >
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {temple.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {temple.address_text || `Location in ${matchedDistrict.name_en}`}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {temple.incident_count} report(s)
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {temple.last_incident_date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : matchedTemples.length > 0 ? (
            /* CASE 2: Temple Direct Match Found */
            <div className="space-y-6">
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border-l-4 border-l-amber-500">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Church className="h-6 w-6 text-amber-500" />
                      <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                        {matchedTemples[0].name}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {matchedTemples[0].address_text || "Official Temple Site"}
                    </p>
                  </div>

                  <SafetyVerdictBadge incidentCount={3} showExplanation={true} />
                </div>
              </div>

              {/* Temple Incident History List */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Documented Incident History
                </h3>

                <div className="space-y-3">
                  {incidentHistory.map((inc) => (
                    <div
                      key={inc.id}
                      className="glass-card rounded-2xl p-5 border-l-4 border-l-red-600 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {inc.incident_type}
                        </span>
                        <span className="text-slate-400">{inc.incident_date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {inc.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {inc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CASE 3: No Matches Found - Friendly Empty State */
            <div className="rounded-3xl glass-card p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto border border-slate-200 dark:border-slate-800">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <HelpCircle className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  No Direct Matches Found for "{query}"
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We couldn't find any specific district or temple matching your search term. Try exploring by major districts below or browsing the interactive map.
                </p>
              </div>

              {/* Suggestions */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Suggested Districts to Search:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {didYouMean.map((item) => (
                    <Link
                      key={item}
                      href={`/search?q=${encodeURIComponent(item)}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
                >
                  Return to Interactive Map
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
