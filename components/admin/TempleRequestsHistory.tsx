"use client";

import React, { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Church,
  MapPin,
  Search,
  Filter,
} from "lucide-react";

export interface HistoryRequestItem {
  id: string;
  applicant_full_name: string;
  applicant_phone: string;
  applicant_role_at_temple: string;
  new_temple_name: string | null;
  status: "approved" | "rejected";
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  supporting_evidence_url: string | null;
  temple?: {
    name: string;
    districts?: {
      name_en: string;
    } | null;
  } | null;
  district?: {
    name_en: string;
  } | null;
}

export function TempleRequestsHistory({ requests }: { requests: HistoryRequestItem[] }) {
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const targetTempleName = r.temple?.name || r.new_temple_name || "";
    const matchesSearch =
      !searchQuery.trim() ||
      r.applicant_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.applicant_phone.includes(searchQuery) ||
      targetTempleName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All History ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("approved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "approved"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Approved ({requests.filter((r) => r.status === "approved").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("rejected")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "rejected"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Rejected ({requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant or temple..."
            className="w-full sm:w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Requests History List */}
      {!filteredRequests.length ? (
        <div className="glass-card rounded-3xl p-8 text-center text-xs text-slate-500">
          No past applications match the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredRequests.map((item) => {
            const isApproved = item.status === "approved";
            const templeDisplayName = item.temple?.name || item.new_temple_name || "Temple";
            const districtDisplayName =
              item.temple?.districts?.name_en || item.district?.name_en || "";

            const formattedReviewDate = item.reviewed_at
              ? new Date(item.reviewed_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A";

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                      isApproved
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}
                  >
                    {isApproved ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {item.status}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {templeDisplayName}
                      </h4>
                      {districtDisplayName && (
                        <span className="text-xs text-slate-400">({districtDisplayName})</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Applicant: <strong>{item.applicant_full_name}</strong> ({item.applicant_role_at_temple}) — Phone: {item.applicant_phone}
                    </p>

                    {item.review_note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 p-2 rounded-lg italic">
                        "{item.review_note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Reviewed: {formattedReviewDate}
                  </span>

                  {item.supporting_evidence_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage({
                          src: item.supporting_evidence_url!,
                          title: `Proof Document — ${item.applicant_full_name}`,
                        })
                      }
                      className="text-xs text-primary-500 underline font-semibold hover:text-primary-400"
                    >
                      View Proof
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <ImageLightbox
          src={selectedImage.src}
          alt={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
