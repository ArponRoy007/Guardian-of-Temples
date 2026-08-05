"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PendingCard, PendingIncidentItem } from "@/components/moderator/PendingCard";
import { CheckCircle2, Clock, Loader2, Sparkles } from "lucide-react";

export default function ModeratorQueuePage() {
  const [incidents, setIncidents] = useState<PendingIncidentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const supabase = createClient();

  const loadPendingQueue = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("incidents")
        .select(`
          id,
          temple_id,
          temple_name_raw,
          temple:temples(name),
          district:districts(name_en, name_bn),
          incident_date,
          incident_type,
          description,
          evidence_url,
          submitter_contact,
          created_at
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true }); // Oldest-first order

      if (error) {
        console.error("Error loading pending queue:", error.message);
      } else if (data) {
        setIncidents(data as unknown as PendingIncidentItem[]);
      }
    } catch (err) {
      console.error("Failed to query pending incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingQueue();
  }, []);

  const handleModerated = (id: string, message: string) => {
    // Optimistic UI card removal
    setIncidents((prev) => prev.filter((item) => item.id !== id));
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-emerald-600 text-white px-4 py-3 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Review Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submissions are ordered oldest-first. Review media evidence and submitter notes prior to publishing.
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading pending queue...</p>
        </div>
      )}

      {!loading && incidents.length === 0 && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              All Caught Up!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              There are no pending submissions in the queue right now. Excellent job!
            </p>
          </div>
        </div>
      )}

      {!loading && incidents.length > 0 && (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <PendingCard
              key={incident.id}
              incident={incident}
              onModerated={handleModerated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
