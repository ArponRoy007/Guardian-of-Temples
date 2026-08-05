import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { MapPin, PhoneCall, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="space-y-3">
        <Logo size={56} colorMode="fullColor" className="mx-auto" />
        <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
          404 — Page Not Found
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Sacred Path Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          The page or report location you requested could not be found. Please check the URL or return to the live district map.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
        >
          <MapPin className="h-4 w-4" />
          <span>Return to Incident Map</span>
        </Link>

        <Link
          href="/helpline"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <PhoneCall className="h-4 w-4 text-red-500" />
          <span>Emergency Helplines</span>
        </Link>
      </div>
    </div>
  );
}
