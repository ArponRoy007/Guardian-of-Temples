"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AlertCircle, RefreshCw, PhoneCall } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="space-y-3">
        <Logo size={56} colorMode="fullColor" className="mx-auto" />
        <span className="rounded-full bg-red-100 dark:bg-red-950/80 px-3 py-1 text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
          System Interruption
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          An Unexpected Error Occurred
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          We encountered an issue loading this section of Guardian of Temples. Please try reloading or contact emergency services directly if in immediate danger.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Reloading</span>
        </button>

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
