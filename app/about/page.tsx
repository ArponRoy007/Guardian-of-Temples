import { Metadata } from "next";
import Link from "next/link";
import { Church, ShieldCheck, HeartHandshake, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & Funding Disclosure — Guardian of Temples",
  description:
    "Learn about Guardian of Temples, our platform independence, funding disclosure, and mission to empower Hindu temple communities across Bangladesh.",
};

export default function AboutPage() {
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
            <Church className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              About Guardian of Temples
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              A community-driven digital platform for temple updates, cultural connection, and verified safety awareness across Bangladesh.
            </p>
          </div>
        </div>
      </div>

      {/* About Content Cards */}
      <div className="space-y-6">
        {/* Mission Statement */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-primary-500">
            <Church className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Our Mission</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Guardian of Temples was established to connect Hindu temple committees, devotees, and local communities nationwide. By highlighting daily festival celebrations, historic mandir heritage, and cross-verified area safety information, we strive to build a transparent, peaceful, and supportive environment across all 64 districts of Bangladesh.
          </p>
        </section>

        {/* Funding & Independence Disclosure */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Funding & Independence Disclosure
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Guardian of Temples is an independent, non-partisan, community-funded digital initiative. We operate strictly free from political affiliations, commercial influence, or government sponsorships. Our operations are maintained by volunteer developers, community moderators, and private donations dedicated solely to community service, safety awareness, and cultural preservation.
          </p>
        </section>

        {/* Governance & Privacy */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-500">
            <HeartHandshake className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Community Governance & Safety
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We hold reporter anonymity and data privacy to the highest standard. Incident report details are strictly verified prior to public publication, ensuring data integrity while protecting individual privacy at all times.
          </p>
        </section>
      </div>
    </main>
  );
}
