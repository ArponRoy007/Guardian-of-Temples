import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-500">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary-500" />
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
      </div>
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white">1. Information Collection</h2>
        <p>Guardian of Temples collects minimal personal details necessary to verify incident reports, including user account information (full name, email) and contact details provided during submissions.</p>
        <h2 className="font-bold text-sm text-slate-900 dark:text-white">2. Purpose & Utilization</h2>
        <p>Incident details are used for verification, public mapping, and safety awareness. Submitter identity details remain private and restricted to verified administrators.</p>
        <h2 className="font-bold text-sm text-slate-900 dark:text-white">3. Data Security</h2>
        <p>We use Row-Level Security (RLS) policies and encrypted authentication. We do not sell or share user data with third-party advertisers.</p>
      </div>
    </div>
  );
}