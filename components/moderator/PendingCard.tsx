"use client";

import React, { useState } from "react";
import {
  Church,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertCircle,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { approveIncidentAction, rejectIncidentAction } from "@/app/moderator/actions";

export interface PendingIncidentItem {
  id: string;
  temple_id?: string | null;
  temple_name_raw?: string | null;
  temple?: { name: string } | null;
  district?: { name_en: string; name_bn: string } | null;
  incident_date: string;
  incident_type: string;
  description: string;
  evidence_url?: string | null;
  submitter_contact?: string | null;
  created_at: string;
}

interface PendingCardProps {
  incident: PendingIncidentItem;
  onModerated: (id: string, message: string) => void;
}

export function PendingCard({ incident, onModerated }: PendingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Modal / Action States
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [moderationNote, setModerationNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const templeName =
    incident.temple?.name || incident.temple_name_raw || "Unlisted Temple Site";
  const districtName = incident.district
    ? `${incident.district.name_en} (${incident.district.name_bn})`
    : "District";

  // Parse evidence URLs (supports comma-separated string)
  const evidencePhotos = incident.evidence_url
    ? incident.evidence_url.split(",").map((url) => url.trim()).filter(Boolean)
    : [];

  // Truncate long descriptions
  const shouldTruncate = incident.description.length > 220;
  const displayDescription =
    shouldTruncate && !expanded
      ? `${incident.description.slice(0, 220)}...`
      : incident.description;

  const handleApprove = async () => {
    setSubmitting(true);
    setNoteError(null);

    const res = await approveIncidentAction({
      incidentId: incident.id,
      note: moderationNote || undefined,
    });

    setSubmitting(false);
    if (res?.error) {
      setNoteError(res.error);
    } else if (res?.success) {
      onModerated(incident.id, res.message);
    }
  };

  const handleReject = async () => {
    if (!moderationNote.trim()) {
      setNoteError("A moderation note explaining the rejection reason is required.");
      return;
    }

    setSubmitting(true);
    setNoteError(null);

    const res = await rejectIncidentAction({
      incidentId: incident.id,
      note: moderationNote,
    });

    setSubmitting(false);
    if (res?.error) {
      setNoteError(res.error);
    } else if (res?.success) {
      onModerated(incident.id, res.message);
    }
  };

  return (
    <>
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-all">
        {/* Header & Badges */}
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-amber-500 shrink-0" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {templeName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-primary-500" /> {districtName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-red-100 dark:bg-red-950/80 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300 capitalize">
              {incident.incident_type.replace("_", " ")}
            </span>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> Submitting Date: {new Date(incident.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-200/80 dark:border-slate-800">
            <Calendar className="h-4 w-4 text-primary-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Incident Date</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{incident.incident_date}</span>
            </div>
          </div>

          {/* Submitter Contact (Moderator Only) */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-200/80 dark:border-slate-800">
            <PhoneCall className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-bold">
                Private Submitter Contact (Mods Only)
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                {incident.submitterContact || incident.submitter_contact || "No contact provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Incident Description */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Report Description
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            {displayDescription}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              {expanded ? (
                <>Show Less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Read Full Description <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Evidence Photos Gallery */}
        {evidencePhotos.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Uploaded Evidence Photos ({evidencePhotos.length})
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {evidencePhotos.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxImage(url)}
                  className="relative h-20 w-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer group shadow-sm"
                >
                  <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error notification */}
        {noteError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{noteError}</span>
          </div>
        )}

        {/* Inline Rejection / Approval Note Prompt */}
        {(isRejecting || isApproving) && (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isRejecting ? "Rejection Reason (Required)" : "Approval Note (Optional)"}
              </span>
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setIsApproving(false);
                  setNoteError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              rows={2}
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              placeholder={
                isRejecting
                  ? "Explain why this report is rejected (e.g. Unverified claim, duplicate report, insufficient evidence)..."
                  : "Add optional note for internal audit..."
              }
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setIsApproving(false);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>

              {isRejecting ? (
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Confirm Rejection
                </button>
              ) : (
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Confirm Approval & Publish
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isRejecting && !isApproving && (
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsRejecting(true);
                setIsApproving(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/80 active:scale-95 transition-all"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>

            <button
              onClick={() => {
                setIsApproving(true);
                setIsRejecting(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve & Publish
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-2">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 rounded-full bg-slate-950/80 p-2 text-white hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={lightboxImage} alt="Evidence Full Resolution" className="h-auto max-h-[85vh] w-auto max-w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
