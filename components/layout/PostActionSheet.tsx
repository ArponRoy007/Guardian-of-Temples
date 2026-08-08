"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, ShieldAlert, X, Church, ChevronRight } from "lucide-react";

export interface PostActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostActionSheet({ isOpen, onClose }: PostActionSheetProps) {
  const router = useRouter();

  // Prevent background scrolling when action sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSelectOption = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0b1320] border-t sm:border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200 sm:duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Mobile) & Header */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mb-1 sm:hidden" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                <Church className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Create Content
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an action as a verified Temple Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Choice Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Post Temple Photo / Feed Update */}
          <button
            type="button"
            onClick={() => handleSelectOption("/temple-feed/new-post")}
            className="flex items-center justify-between p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-left hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/60 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <span className="inline-block rounded-md bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Temple Feed
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📸 Post Photo & Update</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  Share news, puja highlights, or daily photos from your temple.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Option 2: Submit Incident Report */}
          <button
            type="button"
            onClick={() => handleSelectOption("/submit-incident")}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md shadow-primary-600/30 group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <span className="inline-block rounded-md bg-red-100 dark:bg-red-950/80 px-2 py-0.5 text-[10px] font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wider">
                  Safety Report
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📋 Submit Incident Report</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  Report vandalism, arson, threats, or damage affecting a temple.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
