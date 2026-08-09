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
      <footer className="w-full relative z-[90] pointer-events-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 text-xs text-slate-500">
          {/* LOGO & BRANDING */}
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

          {/* LINKS SECTION */}
          <div className="flex flex-col items-center md:items-end gap-4 md:gap-3 w-full md:w-auto">
            {/* 
              MOBILE STACKING & DESKTOP ROW 
              Uses flex-col on mobile, flex-row on desktop (md:)
            */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 md:gap-3 text-[12px] font-bold text-slate-700 dark:text-slate-300 w-full">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3">
                {/* REPRESENT A TEMPLE LINK */}
                <Link
                  href="/become-temple-admin"
                  className="relative z-[100] hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm text-center"
                >
                  Represent a Temple
                </Link>

                {/* Hidden dot on mobile, visible on desktop */}
                <span className="hidden md:inline-block text-slate-300 dark:text-slate-700">
                  •
                </span>

                {/* DOWNLOAD APK BUTTON (Upper) */}
                <a
                  href="/Guardian-of-Temples.apk"
                  download="Guardian-of-Temples.apk"
                  className="relative z-[100] flex items-center justify-center gap-1.5 text-white bg-primary-600 hover:bg-primary-700 cursor-pointer px-4 py-2 rounded-lg active:scale-95 transition-all shadow-sm font-semibold"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Get App (APK)</span>
                </a>
              </div>

              <span className="hidden md:inline-block text-slate-300 dark:text-slate-700">
                •
              </span>

              {/* PRIVACY & TERMS (Forced to be on the same line) */}
              <div className="flex flex-row items-center justify-center gap-3 w-full md:w-auto">
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

              <span className="hidden md:inline-block text-slate-300 dark:text-slate-700">
                •
              </span>

              {/* SUPPORT LINK (Lower) */}
              <Link
                href="/support"
                className="relative z-[100] text-slate-500 hover:text-primary-600 transition-colors py-2"
              >
                Support
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 text-center md:text-right w-full">
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
