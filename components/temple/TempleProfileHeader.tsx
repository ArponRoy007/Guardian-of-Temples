"use client";

import React from "react";
import Link from "next/link";
import { SafetyVerdictBadge } from "@/components/ui/SafetyVerdictBadge";
import { computeSafetyVerdict } from "@/lib/utils/safetyVerdict";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Church,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Camera,
  Sparkles,
} from "lucide-react";

export interface TempleProfileHeaderProps {
  temple: {
    id: string;
    name: string;
    address_text?: string | null;
    source?: string;
    is_verified: boolean;
    cover_image_url?: string | null;
    district_id: number;
    districts?: {
      name_en: string;
      name_bn: string;
      division: string;
    } | null;
  };
  incidentCount: number;
  mostRecentIncidentDate?: string | null;
}

export function TempleProfileHeader({
  temple,
  incidentCount,
  mostRecentIncidentDate = null,
}: TempleProfileHeaderProps) {
  const { user, profile } = useAuth();

  const isMyTempleAdmin =
    profile?.role === "temple_admin" && profile?.linked_temple_id === temple.id;

  const safetyVerdict = computeSafetyVerdict(incidentCount, mostRecentIncidentDate);
  const districtNameEn = temple.districts?.name_en || "";
  const districtNameBn = temple.districts?.name_bn || "";

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl space-y-0">
      {/* 1. Cover Photo Header or Brand Gradient Background */}
      <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-primary-950 via-indigo-950 to-slate-950 flex items-end p-6">
        {temple.cover_image_url ? (
          <img
            src={temple.cover_image_url}
            alt={`${temple.name} cover`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Profile Avatar Badge Overlay */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-2xl text-primary-600 dark:text-primary-400 font-bold shrink-0">
            <Church className="h-9 w-9 sm:h-11 sm:w-11" />
          </div>

          <div className="space-y-1 text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                {temple.name}
              </h1>

              {temple.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold backdrop-blur-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {districtNameEn && (
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary-400" />
                <span>
                  {districtNameEn} {districtNameBn ? `(${districtNameBn})` : ""}
                  {temple.districts?.division ? `, ${temple.districts.division}` : ""}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Temple Information & Actions Body */}
      <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-[#0b1320]">
        {/* Address & Source Details */}
        {temple.address_text && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{temple.address_text}</span>
          </p>
        )}

        {/* Safety Verdict Card */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Safety & Risk Verdict
              </span>
              <SafetyVerdictBadge
                incidentCount={incidentCount}
                mostRecentIncidentDate={mostRecentIncidentDate}
              />
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(temple.name)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline shrink-0"
            >
              <span>View full safety details & incident history</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href={`/submit-incident?templeId=${temple.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white px-5 py-3 text-xs font-bold shadow-glow-danger transition-all active:scale-95"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Report Incident at This Temple</span>
          </Link>

          {/* Special CTA for this Temple's Admin */}
          {isMyTempleAdmin && (
            <Link
              href="/temple-feed/new-post"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 text-xs font-bold shadow-glow transition-all active:scale-95"
            >
              <Camera className="h-4 w-4" />
              <span>Share Temple Update / Photo</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
