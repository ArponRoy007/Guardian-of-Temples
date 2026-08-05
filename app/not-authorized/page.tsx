import Link from "next/link";
import { ShieldAlert, Home, LogIn } from "lucide-react";

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-glow-danger">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-md bg-red-100 dark:bg-red-950/80 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
            Error 403 — Access Denied
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Unauthorized Role Access
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You do not have the required permissions (Moderator or Admin) to view this section. If you believe this is an error, please contact the administrator.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
