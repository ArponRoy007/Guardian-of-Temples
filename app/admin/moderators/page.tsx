"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, CheckCircle2, XCircle, Calendar, User, Code, Clock } from "lucide-react";

interface ModeratorProfile {
  id: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at: string;
  approved_count: number;
  rejected_count: number;
  last_activity?: string;
}

export default function AdminModeratorsPage() {
  const [moderators, setModerators] = useState<ModeratorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadModerators() {
      try {
        setLoading(true);
        // Query profiles with moderator or admin role
        const { data: mods, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone, role, created_at")
          .in("role", ["moderator", "admin"]);

        if (error) {
          console.error("Error loading moderators:", error.message);
        } else if (mods) {
          // For each moderator, fetch approved/rejected statistics
          const modsWithStats = await Promise.all(
            mods.map(async (mod) => {
              const { count: approved } = await supabase
                .from("incidents")
                .select("*", { count: "exact", head: true })
                .eq("moderated_by", mod.id)
                .eq("status", "approved");

              const { count: rejected } = await supabase
                .from("incidents")
                .select("*", { count: "exact", head: true })
                .eq("moderated_by", mod.id)
                .eq("status", "rejected");

              return {
                ...mod,
                approved_count: approved || 0,
                rejected_count: rejected || 0,
                last_activity: "2025-10-12",
              };
            })
          );
          setModerators(modsWithStats);
        }
      } catch (err) {
        console.error("Failed to query moderators:", err);
      } finally {
        setLoading(false);
      }
    }

    loadModerators();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Fixed Moderator Team Directory & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Performance stats for authorized incident verifiers.
          </p>
        </div>
      </div>

      {/* SQL Promotion Helper Box */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
        <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
          <Code className="h-4 w-4 text-amber-500" /> SQL Snippet to Assign Moderator Role in Supabase Editor:
        </div>
        <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-amber-300 overflow-x-auto">
          {`-- Run in Supabase SQL Editor to promote a registered user to moderator:
UPDATE public.profiles 
SET role = 'moderator' 
WHERE id = 'TARGET_USER_UUID';`}
        </pre>
      </div>

      {/* Moderators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moderators.map((mod) => (
          <div
            key={mod.id}
            className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-sm">
                  {mod.full_name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {mod.full_name || "Assigned Moderator"}
                  </h3>
                  <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">
                    {mod.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 border border-emerald-200 dark:border-emerald-900/50">
                <span className="block text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">
                  Approved
                </span>
                <span className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {mod.approved_count}
                </span>
              </div>

              <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50">
                <span className="block text-[10px] text-red-700 dark:text-red-300 font-semibold uppercase">
                  Rejected
                </span>
                <span className="font-display text-2xl font-extrabold text-red-600 dark:text-red-400">
                  {mod.rejected_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
