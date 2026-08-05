import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-500">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary-500" />
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
      </div>
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
        <p>By using Guardian of Temples, you agree to these Terms of Service supporting community safety across Bangladesh.</p>
        <h2 className="font-bold text-sm text-slate-900 dark:text-white">2. Accurate Reporting</h2>
        <p>Users must submit accurate information. Deliberately filing false or fabricated incident reports will result in permanent account suspension.</p>
        <h2 className="font-bold text-sm text-slate-900 dark:text-white">3. Emergency Notice</h2>
        <p>This platform is an informational tracking tool. In active emergencies, contact national emergency services (e.g., 999) directly.</p>
      </div>
    </div>
  );
}