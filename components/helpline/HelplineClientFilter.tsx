"use client";

import React, { useState } from "react";
import { HelplineCard, HelplineItem } from "@/components/helpline/HelplineCard";
import { Search, MapPin, Filter, AlertCircle, PhoneCall } from "lucide-react";

interface DistrictItem {
  id: number;
  name_en: string;
  name_bn: string;
}

interface HelplineClientFilterProps {
  allHelplines: HelplineItem[];
  districts: DistrictItem[];
}

export function HelplineClientFilter({
  allHelplines,
  districts,
}: HelplineClientFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  // Filter Helplines
  const filteredHelplines = allHelplines.filter((h) => {
    // Category match
    if (selectedCategory !== "all" && h.category !== selectedCategory) {
      return false;
    }

    // District match
    if (selectedDistrictId !== null) {
      // Show contacts matching district OR national contacts if none specifically found
      if (h.district_id && h.district_id !== selectedDistrictId) {
        return false;
      }
    }

    return true;
  });

  const selectedDistrictName = districts.find((d) => d.id === selectedDistrictId)?.name_en;

  const hasLocalEntries = selectedDistrictId !== null && filteredHelplines.some((h) => h.district_id === selectedDistrictId);

  return (
    <div className="space-y-6">
      {/* Category Chips & District Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Helplines" },
            { id: "police", label: "Police Emergency" },
            { id: "human_rights_org", label: "Human Rights" },
            { id: "minority_affairs", label: "Minority Affairs" },
            { id: "emergency_other", label: "National Other" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* District Dropdown Selector */}
        <div className="flex items-center gap-2 min-w-[220px]">
          <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
          <select
            value={selectedDistrictId || ""}
            onChange={(e) =>
              setSelectedDistrictId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-semibold"
          >
            <option value="">All Bangladesh / National</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_en} ({d.name_bn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fallback Message for District Selection */}
      {selectedDistrictId !== null && !hasLocalEntries && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/60 p-4 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">No local police hotline listed for {selectedDistrictName} yet.</span>
            <p className="mt-0.5">
              Showing national emergency numbers below. Local station numbers can be added by administrators via the verified admin portal.
            </p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHelplines.map((item) => (
          <HelplineCard key={item.id} helpline={item} />
        ))}
      </div>
    </div>
  );
}
