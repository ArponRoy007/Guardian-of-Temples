"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminOverrideIncidentAction } from "@/app/admin/actions";
import {
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  X,
  Loader2,
  User,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface AdminIncidentItem {
  id: string;
  temple_name_raw?: string | null;
  temple?: { name: string } | null;
  district?: { name_en: string; name_bn: string } | null;
  submitter?: { full_name: string; email?: string } | null;
  moderator?: { full_name: string } | null;
  incident_date: string;
  incident_type: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  moderation_note?: string | null;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [incidents, setIncidents] = useState<AdminIncidentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Override Modal States
  const [overrideIncident, setOverrideIncident] = useState<AdminIncidentItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<"pending" | "approved" | "rejected">("approved");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const supabase = createClient();

  const loadAllIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("incidents")
        .select(`
          id,
          temple_name_raw,
          temple:temples(name),
          district:districts(name_en, name_bn),
          submitter:profiles!submitted_by(full_name),
          moderator:profiles!moderated_by(full_name),
          incident_date,
          incident_type,
          description,
          status,
          moderation_note,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading all incidents:", error.message);
      } else if (data) {
        setIncidents(data as unknown as AdminIncidentItem[]);
      }
    } catch (err) {
      console.error("Failed to query incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllIncidents();
  }, []);

  const handleExecuteOverride = async () => {
    if (!overrideIncident) return;
    if (!overrideReason.trim()) {
      setOverrideError("A detailed administrative override reason is required.");
      return;
    }

    setSubmitting(true);
    setOverrideError(null);

    const res = await adminOverrideIncidentAction({
      incidentId: overrideIncident.id,
      newStatus: targetStatus,
      reason: overrideReason,
    });

    setSubmitting(false);
    if (res?.error) {
      setOverrideError(res.error);
    } else if (res?.success) {
      setOverrideIncident(null);
      setOverrideReason("");
      loadAllIncidents();
    }
  };

  // Filter logic
  const filteredIncidents = incidents.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tName = (item.temple?.name || item.temple_name_raw || "").toLowerCase();
      const dName = (item.district?.name_en || "").toLowerCase();
      return tName.includes(q) || dName.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            All Incident Submissions Master List
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, audit, and administratively override status for all incident reports.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by temple or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading all incident submissions...</p>
        </div>
      )}

      {/* Submissions Table (Desktop) / Cards (Mobile) */}
      {!loading && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Temple / Site</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Submitted By</th>
                  <th className="px-4 py-3">Moderator</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredIncidents.map((item) => {
                  const templeName = item.temple?.name || item.temple_name_raw || "Unlisted Temple";
                  const districtName = item.district ? item.district.name_en : "District";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate">
                        {templeName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{districtName}</td>
                      <td className="px-4 py-3 capitalize text-slate-500">
                        {item.incident_type.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {item.submitter?.full_name || "User"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.moderator?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.status === "approved"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : item.status === "rejected"
                              ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setOverrideIncident(item);
                            setTargetStatus(item.status === "approved" ? "rejected" : "approved");
                          }}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-500 transition-colors"
                        >
                          Override Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Override Action Modal */}
      {overrideIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900 dark:text-white">
                <Sliders className="h-5 w-5 text-red-500" />
                Administrative Status Override
              </div>
              <button onClick={() => setOverrideIncident(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Target Incident:{" "}
              <strong className="text-slate-900 dark:text-white">
                {overrideIncident.temple?.name || overrideIncident.temple_name_raw}
              </strong>{" "}
              (Current status: <span className="font-semibold uppercase">{overrideIncident.status}</span>)
            </p>

            {overrideError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{overrideError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select New Override Status *
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="approved">Approved & Published</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Reset to Pending Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Reason (Logged in Audit Trail) *
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why this status is being administratively overridden..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideIncident(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOverride}
                disabled={submitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-red-500 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sliders className="h-4 w-4" />}
                Log & Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
