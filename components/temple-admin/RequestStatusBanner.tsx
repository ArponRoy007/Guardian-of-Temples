"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Clock, AlertTriangle, ArrowRight, RefreshCw, Church } from "lucide-react";

export interface RequestStatusBannerProps {
  profile?: {
    role: string;
    linked_temple_id?: string | null;
  } | null;
  latestRequest?: {
    id: string;
    status: "pending" | "approved" | "rejected";
    temple_id?: string | null;
    new_temple_name?: string | null;
    review_note?: string | null;
    created_at: string;
    reviewed_at?: string | null;
  } | null;
  onReapply?: () => void;
}

export function RequestStatusBanner({
  profile,
  latestRequest,
  onReapply,
}: RequestStatusBannerProps) {
  // 1. Verified Temple Admin Status
  if (profile?.role === "temple_admin") {
    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xl space-y-4 animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              Official Verified Role
            </span>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              You are a Verified Temple Admin
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have full administrative verification to post photos, announcements, and updates on your temple feed.
            </p>
          </div>
        </div>

        {profile.linked_temple_id && (
          <div className="pt-2 flex items-center gap-3">
            <Link
              href={`/search?temple=${profile.linked_temple_id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-emerald-500 transition-all"
            >
              <Church className="h-4 w-4" />
              <span>View Temple Page & Feed</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // 2. Pending Verification Request
  if (latestRequest?.status === "pending") {
    const formattedDate = new Date(latestRequest.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 shadow-xl space-y-4 animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Under Review
            </span>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Your Temple Admin Request is Pending Review
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your request submitted on <strong className="text-slate-900 dark:text-white">{formattedDate}</strong> is currently being reviewed by our moderation team. We are verifying your supporting authorization document.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 p-4 border border-amber-200/50 dark:border-amber-900/30 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">What happens next?</p>
          <p>
          Once verified, your profile will be granted <strong className="font-bold text-slate-900 dark:text-white">Temple Admin</strong> privileges and you will receive an in-app notification. Review usually completes within 1-3 business days.
          </p>
        </div>
      </div>
    );
  }

  // 3. Rejected Application Notice
  if (latestRequest?.status === "rejected") {
    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 shadow-xl space-y-4 animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
              Application Not Approved
            </span>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Previous Admin Request Was Declined
            </h3>
            {latestRequest.review_note && (
              <p className="text-xs text-rose-800 dark:text-rose-200 bg-rose-100/50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                <strong>Moderator Note:</strong> {latestRequest.review_note}
              </p>
            )}
            <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
              You can re-apply below with updated authorization details or a clearer proof document.
            </p>
          </div>
        </div>

        {onReapply && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onReapply}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-md active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Submit New Verification Request</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. Default / Unapplied State: render nothing
  return null;
}
