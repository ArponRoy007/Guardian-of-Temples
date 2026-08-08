"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import { X, ShieldCheck, FileText, Smartphone } from "lucide-react";

export function Footer() {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(
    null
  );

  // Prevent background scrolling when the modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  return (
    <>
      {/* 
        FOOTER FIX: 
        Added relative and z-[90] so it sits ABOVE all floating buttons.
        Added pointer-events-auto so it forcibly accepts clicks.
      */}
      <footer className="w-full relative z-[90] pointer-events-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
            <Logo size={28} colorMode="fullColor" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Guardian of Temples
              </p>
              <p className="text-[11px] text-slate-500">
                Protecting Sacred Spaces, Informing Safe Journeys
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-[12px] font-bold text-slate-700 dark:text-slate-300">
              {/* REPRESENT A TEMPLE LINK */}
              <a
                href="/become-temple-admin"
                className="relative z-[100] hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all shadow-xs"
              >
                Represent a Temple
              </a>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              {/* DOWNLOAD APK BUTTON */}
              <a
                href="/Guardian-of-Temples.apk"
                download="Guardian-of-Temples.apk"
                className="relative z-[100] flex items-center gap-1.5 text-white bg-primary-600 hover:bg-primary-700 cursor-pointer px-3 py-2 rounded-lg active:scale-95 transition-all shadow-sm font-semibold"
              >
                <Smartphone className="h-4 w-4" />
                <span>Get App (APK)</span>
              </a>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              {/* BUTTON FIX: Added z-[100] directly to the buttons to ensure clickability */}
              <Link
                href="/privacy"
                className="relative z-[100] hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
              >
                Privacy Policy
              </Link>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <Link
                href="/terms"
                className="relative z-[100] hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Guardian of Temples. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL POPUP */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                {activeModal === "privacy" ? (
                  <ShieldCheck className="h-5 w-5 text-primary-500" />
                ) : (
                  <FileText className="h-5 w-5 text-primary-500" />
                )}
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {activeModal === "privacy"
                    ? "Privacy Policy"
                    : "Terms of Service"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModal === "privacy" ? (
                <>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Effective Date: August 2026
                  </p>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      1. Information Collection
                    </h4>
                    <p>
                      <strong>Guardian of Temples</strong> collects minimal
                      personal details necessary to verify incident reports and
                      ensure platform safety. This includes user account
                      information and optional contact numbers provided during
                      incident submission.
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      2. Purpose & Utilization
                    </h4>
                    <p>
                      Submitted incident details are utilized strictly for
                      cross-verification, public mapping, and safety awareness.
                      Personal submitter information remains private.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Effective Date: August 2026
                  </p>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      1. Acceptance of Terms
                    </h4>
                    <p>
                      By accessing or reporting information through{" "}
                      <strong>Guardian of Temples</strong>, you agree to these
                      Terms of Service. This platform operates as an incident
                      monitoring network supporting community safety across
                      Bangladesh.
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      2. Accurate Reporting & Integrity
                    </h4>
                    <p>
                      Users pledge that all submitted information, media
                      attachments, and timestamps are accurate to the best of
                      their knowledge. Fabricating incidents will result in
                      permanent account termination.
                    </p>
                  </section>
                </>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer active:scale-95 shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
