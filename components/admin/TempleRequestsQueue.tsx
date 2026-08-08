"use client";

import React, { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import {
  approveTempleAdminRequestAction,
  rejectTempleAdminRequestAction,
} from "@/app/admin/temple-requests/actions";
import {
  Church,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
} from "lucide-react";

export interface PendingRequestItem {
  id: string;
  requested_by: string;
  temple_id: string | null;
  new_temple_name: string | null;
  new_temple_district_id: number | null;
  new_temple_address: string | null;
  applicant_full_name: string;
  applicant_phone: string;
  applicant_role_at_temple: string;
  supporting_evidence_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  temple?: {
    id: string;
    name: string;
    districts?: {
      name_en: string;
      name_bn: string;
    } | null;
  } | null;
  district?: {
    name_en: string;
    name_bn: string;
  } | null;
}

export function TempleRequestsQueue({ requests }: { requests: PendingRequestItem[] }) {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);

  // Modal Action States
  const [activeModal, setActiveModal] = useState<{
    type: "approve" | "reject";
    request: PendingRequestItem;
  } | null>(null);

  const [noteInput, setNoteInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApprove = async (request: PendingRequestItem) => {
    setIsProcessing(true);
    setActionError(null);

    const res = await approveTempleAdminRequestAction({
      requestId: request.id,
      reviewNote: noteInput.trim() || undefined,
    });

    setIsProcessing(false);

    if (res?.error) {
      setActionError(res.error);
    } else {
      setActiveModal(null);
      setNoteInput("");
    }
  };

  const handleReject = async (request: PendingRequestItem) => {
    if (!noteInput.trim()) {
      setActionError("A detailed rejection reason is required.");
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    const res = await rejectTempleAdminRequestAction({
      requestId: request.id,
      reason: noteInput.trim(),
    });

    setIsProcessing(false);

    if (res?.error) {
      setActionError(res.error);
    } else {
      setActiveModal(null);
      setNoteInput("");
    }
  };

  if (!requests.length) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Verification Queue is Clear
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          There are no pending temple admin applications requiring review at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500">
          Pending Applications ({requests.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((item) => {
          const isNewTempleProposal = !item.temple_id;
          const formattedDate = new Date(item.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-md"
            >
              {/* Header Badges & Temple Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {isNewTempleProposal ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>New Temple Proposal</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Church className="h-3.5 w-3.5" />
                      <span>Existing Temple Match</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Submitted: {formattedDate}</span>
                </div>
              </div>

              {/* Grid Content Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Temple Target Details */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Target Temple
                  </span>

                  {isNewTempleProposal ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.new_temple_name}
                      </p>
                      {item.district && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                          <span>
                            {item.district.name_en} ({item.district.name_bn})
                          </span>
                        </p>
                      )}
                      {item.new_temple_address && (
                        <p className="text-[11px] text-slate-400 italic">
                          {item.new_temple_address}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.temple?.name || "Existing Temple"}
                      </p>
                      {item.temple?.districts && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          <span>
                            {item.temple.districts.name_en} ({item.temple.districts.name_bn})
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Applicant Details */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Applicant Information
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary-500" />
                    <span>{item.applicant_full_name}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Role: <code className="font-semibold text-primary-600 dark:text-primary-400">{item.applicant_role_at_temple}</code>
                  </p>

                  <a
                    href={`tel:${item.applicant_phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold hover:underline pt-0.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{item.applicant_phone}</span>
                  </a>
                </div>

                {/* 3. Supporting Evidence Proof Document(s) */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Proof Documents
                    </span>
                    {item.supporting_evidence_url ? (
                      (() => {
                        // Dynamically parse the URL field (handles both new JSON strings and old single strings)
                        let parsedUrls: { src: string; label: string }[] = [];
                        try {
                          const json = JSON.parse(item.supporting_evidence_url);
                          if (json.nid_front) parsedUrls.push({ src: json.nid_front, label: "NID Front" });
                          if (json.nid_back) parsedUrls.push({ src: json.nid_back, label: "NID Back" });
                          if (json.committee_doc) parsedUrls.push({ src: json.committee_doc, label: "Committee" });
                        } catch (e) {
                          // Fallback if it's an old single image URL
                          parsedUrls.push({ src: item.supporting_evidence_url, label: "Proof Document" });
                        }

                        return (
                          <div className={`grid gap-2 ${parsedUrls.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
                            {parsedUrls.map((doc, idx) => (
                              <div key={idx} className="space-y-1">
                                <div
                                  onClick={() =>
                                    setSelectedImage({
                                      src: doc.src,
                                      title: `${doc.label} — ${item.applicant_full_name} (${item.applicant_role_at_temple})`,
                                    })
                                  }
                                  className="relative h-14 w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer group bg-slate-900"
                                >
                                  <img
                                    src={doc.src}
                                    alt={doc.label}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                                    <span>Expand</span>
                                  </div>
                                </div>
                                <p className="text-center text-[9px] font-bold uppercase tracking-wide text-slate-500 truncate px-0.5">
                                  {doc.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-slate-400 italic">No document attached</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setNoteInput("");
                    setActiveModal({ type: "reject", request: item });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors active:scale-95"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setNoteInput("");
                    setActiveModal({ type: "approve", request: item });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-emerald-500 transition-colors active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve & Verify Admin</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Proof Documents */}
      {selectedImage && (
        <ImageLightbox
          src={selectedImage.src}
          alt={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Action Confirmation Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => !isProcessing && setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {activeModal.type === "approve" ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <XCircle className="h-6 w-6" />
                </div>
              )}

              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {activeModal.type === "approve"
                    ? "Approve Temple Admin Request"
                    : "Reject Temple Admin Request"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Applicant: <strong>{activeModal.request.applicant_full_name}</strong> (
                  {activeModal.request.applicant_role_at_temple})
                </p>
              </div>
            </div>

            {actionError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeModal.type === "approve"
                  ? "Admin Verification Note (Optional)"
                  : "Reason for Rejection * (Visible to applicant)"}
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
                placeholder={
                  activeModal.type === "approve"
                    ? "e.g. Verified via phone call with committee secretary..."
                    : "e.g. Document image was unreadable or committee authorization could not be verified..."
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() =>
                  activeModal.type === "approve"
                    ? handleApprove(activeModal.request)
                    : handleReject(activeModal.request)
                }
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors shadow-md ${
                  activeModal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {activeModal.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}