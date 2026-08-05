"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  History,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Church,
  Loader2,
  FileText,
} from "lucide-react";

interface ModeratedHistoryItem {
  id: string;
  temple_name_raw?: string | null;
  temple?: { name: string } | null;
  district?: { name_en: string; name_bn: string } | null;
  incident_date: string;
  incident_type: string;
  description: string;
  status: "approved" | "rejected";
  moderation_note?: string | null;
  updated_at: string;
}

export default function ModeratorHistoryPage() {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<ModeratedHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "approved" | "rejected">("all");

  const supabase = createClient();

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("incidents")
          .select(`
            id,
            temple_name_raw,
            temple:temples(name),
            district:districts(name_en, name_bn),
            incident_date,
            incident_type,
            description,
            status,
            moderation_note,
            updated_at
          `)
          .eq("moderated_by", user.id)
          .in("status", ["approved", "rejected"])
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error loading moderation history:", error.message);
        } else if (data) {
          setHistoryItems(data as unknown as ModeratedHistoryItem[]);
        }
      } catch (err) {
        console.error("Failed to query moderation history:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadHistory();
    }
  }, [user]);

  // Filter items based on active tab
  const filteredItems = historyItems.filter((item) => {
    if (filter === "approved") return item.status === "approved";
    if (filter === "rejected") return item.status === "rejected";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            My Moderation Audit History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit log of reports you have approved or rejected, ordered most recent first.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            All ({historyItems.length})
          </button>

          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Approved ({historyItems.filter((i) => i.status === "approved").length})
          </button>

          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "rejected"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Rejected ({historyItems.filter((i) => i.status === "rejected").length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading audit history...</p>
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="rounded-3xl glass-card p-10 text-center space-y-3 max-w-md mx-auto border border-slate-200 dark:border-slate-800">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
            No Records Found
          </h3>
          <p className="text-xs text-slate-500">
            No moderation history matches the selected filter tab.
          </p>
        </div>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const templeName =
              item.temple?.name || item.temple_name_raw || "Unlisted Temple Site";
            const districtName = item.district
              ? `${item.district.name_en} (${item.district.name_bn})`
              : "District";

            const isApproved = item.status === "approved";

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Decision: Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-950/80 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                        <XCircle className="h-3.5 w-3.5" /> Decision: Rejected
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Action Date: {new Date(item.updated_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Church className="h-4 w-4 text-amber-500" />
                    {templeName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" /> {districtName} •{" "}
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                      {item.incident_type.replace("_", " ")}
                    </span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 leading-relaxed">
                  {item.description}
                </p>

                {item.moderation_note && (
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-900 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-slate-500 block uppercase text-[10px]">
                      Moderation Note Logged:
                    </span>
                    <p>{item.moderation_note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
