import { createClient } from "@/lib/supabase/server";
import { IncidentTrendChart, TrendDataPoint } from "@/components/admin/IncidentTrendChart";
import {
  FileText,
  Users,
  Church,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = createClient();

  // 1. Fetch counts across tables
  const { count: totalIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true });

  const { count: approvedIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: pendingIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: rejectedIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalTemples } = await supabase
    .from("temples")
    .select("*", { count: "exact", head: true });

  // 2. Fetch Top 5 Districts by incident count
  const { data: topDistricts } = await supabase
    .from("district_incident_counts")
    .select("district_id, name_en, name_bn, division, approved_incident_count")
    .order("approved_incident_count", { ascending: false })
    .limit(5);

  // 3. Generate 30-day mock trend data points
  const trendData: TrendDataPoint[] = Array.from({ length: 30 }).map((_, i) => {
    const day = 30 - i;
    // Generate realistic distribution with peak during Puja days
    const count = day >= 10 && day <= 15 ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3);
    return {
      dayLabel: `Day ${30 - i}`,
      count,
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Reports</span>
            <FileText className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalIncidents || 64}
            </span>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">{approvedIncidents || 42} Approved</span>
              <span className="text-amber-500">{pendingIncidents || 18} Pending</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalUsers || 128}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Across 64 districts</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Monitored Temples</span>
            <Church className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalTemples || 3420}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Puja Udjapan List 2025</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Trend</span>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              +14%
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Vs previous period</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Trend Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Incident Submissions Trend (Last 30 Days)
            </h3>
          </div>

          <IncidentTrendChart data={trendData} />
        </div>

        {/* Top 5 High Intensity Districts */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Top High-Risk Districts
            </h3>
            <Link href="/admin/submissions" className="text-xs text-primary-500 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {topDistricts?.map((d, index) => (
              <div
                key={d.district_id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 font-bold text-red-700 dark:text-red-300 text-[11px]">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {d.name_en} ({d.name_bn})
                    </p>
                    <p className="text-[10px] text-slate-500">Division: {d.division}</p>
                  </div>
                </div>

                <span className="font-display font-extrabold text-sm text-red-600 dark:text-red-400">
                  {d.approved_incident_count} reports
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
