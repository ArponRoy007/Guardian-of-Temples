import Link from "next/link";
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
  Shield,
} from "lucide-react";

export default function Home() {
  const recentIncidents = [
    {
      id: "inc-1",
      title: "Vandalism reported at Sri Sri Radha Govinda Mandir",
      district: "Cumilla",
      incidentDate: "2025-10-12",
      type: "Idol Vandalism",
      verifiedSources: 2,
    },
    {
      id: "inc-2",
      title: "Extortion demand served to Puja Celebration Committee",
      district: "Chittagong",
      incidentDate: "2025-10-11",
      type: "Threats & Harassment",
      verifiedSources: 1,
    },
    {
      id: "inc-3",
      title: "Idol damage attempted during night hours",
      district: "Noakhali",
      incidentDate: "2025-10-10",
      type: "Property Damage",
      verifiedSources: 3,
    },
    {
      id: "inc-4",
      title: "Arson attempt prevented by local mandap night watch",
      district: "Rangpur",
      incidentDate: "2025-10-09",
      type: "Arson",
      verifiedSources: 2,
    },
    {
      id: "inc-5",
      title: "Boundary wall desecration at Kali Temple",
      district: "Gazipur",
      incidentDate: "2025-10-08",
      type: "Property Damage",
      verifiedSources: 1,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-primary-950/50 p-6 sm:p-10 border border-slate-800 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Official Community Incident & Temple Safety Platform</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Durga Puja Incident Tracker{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-300 to-red-400">
              Bangladesh
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A mobile-first visualization platform mapping violence and vandalism incidents against Hindu temples across Bangladesh's 64 districts during Durga Puja to raise awareness and assist authorities.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/submit-report"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Report an Incident
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Shield className="h-4 w-4 text-amber-400" />
              Verifier Login
            </Link>
          </div>
        </div>
      </section>

      {/* Prominent Homepage Search Bar */}
      <section className="max-w-3xl mx-auto">
        <SearchBar placeholder="Search 64 districts (e.g. Cumilla, চট্টগ্রাম) or temple name..." />
      </section>

      {/* Quick Overview Stat Badges */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Districts Covered</span>
            <MapPin className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              64 / 64
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">All 8 Divisions</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Reports</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              42
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Publicly displayed on map</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              18
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Awaiting moderator check</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">High Risk Areas</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              5 Districts
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">5+ approved incidents</p>
          </div>
        </div>
      </section>

      {/* CORE FEATURE: Interactive 64-District Choropleth Map */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentIncidents.map((incident) => (
            <div
              key={incident.id}
              className="glass-card rounded-2xl p-4 space-y-3 flex flex-col justify-between border-l-4 border-l-red-600"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-950/80 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-300">
                    {incident.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {incident.district} • {incident.incidentDate}
                  </span>
                </div>

                <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {incident.title}
                </h3>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> {incident.verifiedSources} news source(s)
                </span>
                <span className="flex items-center gap-1 hover:underline cursor-pointer text-slate-400 hover:text-slate-200">
                  Evidence <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
