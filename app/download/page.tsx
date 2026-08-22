import { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  Download,
  ShieldCheck,
  ArrowLeft,
  Copy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Download Android App (APK) — Guardian of Temples",
  description:
    "Download the official Guardian of Temples Android APK (v1.0.2) for live temple feeds, festival alerts, and 64-district safety updates.",
};

export default function DownloadPage() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* APK Download Card */}
      <section className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-md">
              <Smartphone className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                  Guardian of Temples App
                </h1>
                <span className="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  v1.0.2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official Android APK Build • Updated August 2026
              </p>
            </div>
          </div>

          <a
            href="/Guardian-of-Temples.apk"
            download="Guardian-of-Temples.apk"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download APK (v1.0.2)</span>
          </a>
        </div>

        {/* SHA-256 Verification Section */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              SHA-256 Checksum Hash
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Verified Official Build
            </span>
          </div>
          <code className="block text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 break-all select-all">
            04cec708ff491435deaf032ddf91bd041effb01abae56c7838427ea9565c7877
          </code>
        </div>

        {/* 2-Step Sideloading Instructions */}
        <div className="space-y-3 pt-2">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Quick 2-Step Android Installation Guide
          </h2>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-extrabold mb-1">
                1
              </span>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                Download APK
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Click the download button above to save the{" "}
                <code>Guardian-of-Temples.apk</code> file directly to your
                mobile device.
              </p>
            </li>

            <li className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-extrabold mb-1">
                2
              </span>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                Allow Unknown Sources & Install
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Open Settings &gt; Security and toggle{" "}
                <strong>"Allow Install from Unknown Sources"</strong> for your
                browser, then tap the downloaded APK to install.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
