"use client";

import React from "react";
import { X, MapPin, ArrowRight, Calendar, Church } from "lucide-react";
import { SafetyVerdictBadge } from "@/components/ui/SafetyVerdictBadge";
import { UnverifiedBadge } from "@/components/ui/UnverifiedBadge";
import Link from "next/link";

export interface TempleSummary {
  id: string;
  name: string;
  incidentCount: number;
  lastIncidentDate?: string;
  is_verified?: boolean;
}

export interface DistrictData {
  district_id: number;
  name_en: string;
  name_bn: string;
  division: string;
  geo_code: string;
  approved_incident_count: number;
  mostRecentIncidentDate?: string | null;
  temples?: TempleSummary[];
}

interface DistrictDetailPanelProps {
  district: DistrictData | null;
  onClose: () => void;
}

export function DistrictDetailPanel({ district, onClose }: DistrictDetailPanelProps) {
  if (!district) return null;

  const mockTemples: TempleSummary[] = district.temples?.length
    ? district.temples
    : district.approved_incident_count > 0
    ? [
        {
          id: "t-1",
          name: `Central Sri Sri Radha Govinda Mandir (${district.name_en})`,
          incidentCount: Math.ceil(district.approved_incident_count * 0.6),
          lastIncidentDate: "2025-10-12",
          is_verified: true,
        },
        {
          id: "t-2",
          name: `Kali Mata Temple (${district.name_en} Town)`,
          incidentCount: Math.floor(district.approved_incident_count * 0.4),
          lastIncidentDate: "2025-10-11",
          is_verified: false,
        },
      ]
    : [];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
      />

      {/* Panel Container */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-6 shadow-2xl transition-all duration-300 md:absolute md:inset-y-0 md:right-0 md:left-auto md:w-96 md:max-h-none md:rounded-none md:border-l md:border-t-0">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-500" />
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {district.name_en}
              </h2>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                ({district.name_bn})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Division: {district.division}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close detail panel"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Safety Assessment Badge */}
        <div className="my-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Safety Assessment
            </span>
            <span className="text-xs text-slate-400">Geo Code: {district.geo_code}</span>
          </div>

          <SafetyVerdictBadge
            incidentCount={district.approved_incident_count}
            mostRecentIncidentDate={district.mostRecentIncidentDate}
            showExplanation={true}
          />
        </div>

        {/* Incident Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-center">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200/80 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">
              Total Approved
            </span>
            <span className="font-display text-2xl font-extrabold text-primary-600 dark:text-primary-400">
              {district.approved_incident_count}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200/80 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">
              Affected Temples
            </span>
            <span className="font-display text-2xl font-extrabold text-slate-800 dark:text-slate-200">
              {mockTemples.length}
            </span>
          </div>
        </div>

        {/* Affected Temples List */}
        <div className="space-y-3">
          <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Church className="h-4 w-4 text-primary-500" />
            Affected Temples ({mockTemples.length})
          </h3>

          {mockTemples.length === 0 ? (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800">
              No specific temple damage reported in this district.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {mockTemples.map((temple) => (
                <div
                  key={temple.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {temple.name}
                    </p>
                    {temple.is_verified === false && <UnverifiedBadge />}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {temple.incidentCount} incident report(s)
                    </span>
                    {temple.lastIncidentDate && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" /> {temple.lastIncidentDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Full District Reports Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/search?q=${encodeURIComponent(district.name_en)}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 active:scale-95 transition-all"
          >
            <span>View All District Incidents</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
