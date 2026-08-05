"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface MySubmission {
  id: string;
  temple_name_raw?: string;
  temple?: { name: string } | null;
  district?: { name_en: string; name_bn: string } | null;
  incident_date: string;
  incident_type: string;
  status: "pending" | "approved" | "rejected";
  moderation_note?: string | null;
  created_at: string;
}

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function loadUserSubmissions() {
      try {
        setLoading(true);
        
        // 1. Get user directly from Supabase (bypassing custom hook issues)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          if (isMounted) setLoading(false);
          return;
        }

        // 2. Fetch the user's submissions
        const { data, error } = await supabase
          .from("incidents")
          .select(`
            id,
            temple_name_raw,
            temple:temples(name),
            district:districts(name_en, name_bn),
            incident_date,
            incident_type,
            status,
            moderation_note,
            created_at
          `)
          .eq("submitted_by", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading submissions:", error.message);
        } else if (data && isMounted) {
          setSubmissions(data as unknown as MySubmission[]);
        }
      } catch (err) {
        console.error("Failed to query submissions:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUserSubmissions();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5" /> Approved & Live
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
          <XCircle className="h-3.5 w-3.5" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <Clock className="h-3.5 w-3.5" /> Pending Review
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-500" />
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              My Submitted Incident Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track the verification status of your reported incidents and view moderator notes.
          </p>
        </div>

        <Link
          href="/submit-incident"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
        >
          <PlusCircle className="h-4 w-4" /> New Report
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading your submitted reports...</p>
        </div>
      )}

      {/* Submissions Card List */}
      {!loading && (
        <>
          {submissions.length === 0 ? (
            <div className="rounded-3xl glass-card p-10 text-center space-y-4 max-w-lg mx-auto border border-slate-200 dark:border-slate-800">
              <FileText className="h-12 w-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  No Reports Submitted Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You haven't submitted any incident reports. If you witness or know of violence or vandalism against temples, submit a report for verification.
                </p>
              </div>
              <Link
                href="/submit-incident"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
              >
                <PlusCircle className="h-4 w-4" /> Submit Your First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const templeName =
                  sub.temple?.name || sub.temple_name_raw || "Unlisted Temple Site";
                const districtName = sub.district
                  ? `${sub.district.name_en} (${sub.district.name_bn})`
                  : "District";

                return (
                  <div
                    key={sub.id}
                    className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {getStatusBadge(sub.status)}
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Submitted on{" "}
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {templeName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-primary-500" /> {districtName} •{" "}
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {sub.incident_type.replace("_", " ")}
                        </span>
                      </p>
                    </div>

                    {/* Moderation Note Alert if Rejected */}
                    {sub.status === "rejected" && sub.moderation_note && (
                      <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 space-y-1">
                        <div className="font-semibold flex items-center gap-1 text-red-700 dark:text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" /> Moderator Note / Rejection Reason:
                        </div>
                        <p className="pl-4">{sub.moderation_note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}