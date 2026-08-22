import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, FileSearch, XCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Incident Verification Methodology — Guardian of Temples",
  description:
    "Learn about our multi-step verification process, moderation protocols, corroboration criteria, and rejection standards for temple safety reports.",
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Incident Verification Methodology
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Our 3-stage governance protocol for verified public incident tracking across Bangladesh.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Content Cards */}
      <div className="space-y-6">
        {/* Stage 1: Moderation */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <h2 className="font-display text-lg font-bold">1. Primary Moderation Review</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every submitted incident report enters a pending moderation queue. Certified volunteer moderators examine submission details, metadata, uploaded photo/video evidence, timestamp consistency, and geographical coordinates.
          </p>
        </section>

        {/* Stage 2: Corroboration */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <FileSearch className="h-6 w-6 shrink-0" />
            <h2 className="font-display text-lg font-bold">2. Evidence Corroboration & Cross-Checking</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Reports must meet corroboration standards before public display. Verification requires at least one of the following:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 pl-2">
            <li>Direct confirmation from a verified temple committee administrator.</li>
            <li>Cross-reference with reputable mainstream news media coverage or official police statements.</li>
            <li>Clear, geo-tagged photo/video evidence verified against local surroundings.</li>
          </ul>
        </section>

        {/* Stage 3: Rejection Criteria */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <XCircle className="h-6 w-6 shrink-0" />
            <h2 className="font-display text-lg font-bold">3. Rejection & Takedown Criteria</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Submissions are rejected or removed immediately under any of the following conditions:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 pl-2">
            <li>Unsubstantiated claims lacking verifiable evidence or news corroboration.</li>
            <li>Misleading, recycled, or AI-generated media created to inflate risk ratings.</li>
            <li>Hate speech, inflammatory rhetoric, or unverified personal accusations.</li>
            <li>Duplicate reports for previously logged and verified incidents.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
