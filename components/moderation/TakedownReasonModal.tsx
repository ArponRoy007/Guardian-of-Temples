"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  X,
  Loader2,
  Trash2,
  Info,
} from "lucide-react";

export interface TakedownPostPreview {
  id: string;
  templeName: string;
  imageUrl: string;
  caption?: string | null;
}

export interface TakedownReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: TakedownPostPreview | null;
  onConfirm: (reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  "Inappropriate or offensive content",
  "Not related to temple or puja activities",
  "Duplicate or spam post",
  "Low quality or misleading photo",
  "Copyright or privacy concern",
];

export function TakedownReasonModal({
  isOpen,
  onClose,
  post,
  onConfirm,
}: TakedownReasonModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val && val !== "Other") {
      setReason(val + ". ");
    }
  };

  const handleConfirm = async () => {
    if (reason.trim().length < 10) {
      setErrorMsg("Reason must be at least 10 characters long.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onConfirm(reason.trim());
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "Failed to remove post.");
    }
  };

  const isMinLengthMet = reason.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-display text-base text-slate-900 dark:text-white">
              Remove Post (Moderator Takedown)
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Post Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <img
            src={post.imageUrl}
            alt="Preview"
            className="h-16 w-16 rounded-xl object-cover shrink-0 bg-slate-800"
          />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Post
            </span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {post.templeName}
            </h4>
            {post.caption && (
              <p className="text-[11px] text-slate-500 truncate">{post.caption}</p>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Common Category Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Common Reason Category (Optional)
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Choose a category to pre-fill --</option>
            {COMMON_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="Other">Other / Custom</option>
          </select>
        </div>

        {/* Detailed Reason Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Moderation Takedown Reason *
            </label>
            <span
              className={`text-[10px] font-mono ${
                isMinLengthMet ? "text-emerald-500" : "text-slate-400"
              }`}
            >
              {reason.trim().length} / 10 min chars
            </span>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={isSubmitting}
            placeholder="Explain why this post is being removed. This will be sent directly to the temple admin..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
          />

          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="h-3.5 w-3.5 shrink-0 text-indigo-500 mt-0.5" />
            <span>
              This reason will be sent to the temple admin who posted this. Please be clear and respectful.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !isMinLengthMet}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-glow-danger hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Removing Post...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Confirm Removal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
