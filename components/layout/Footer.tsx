import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-8 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-primary-500 transition-colors">
            Map Tracker
          </Link>
          <Link href="/helpline" className="hover:text-red-500 transition-colors font-semibold">
            Emergency Helplines
          </Link>
          <Link href="/submit-incident" className="hover:text-primary-500 transition-colors">
            Report Incident
          </Link>
        </div>

        <p className="text-[11px] text-slate-400">
          © 2025-2026 Guardian of Temples. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
