import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPanchangForDate, toBnDigits } from "@/lib/panjika/engine";
import { ArrowLeft, Calendar, Sun, Moon, Sparkles, ArrowRight } from "lucide-react";

interface PanjikaDatePageProps {
  params: {
    date: string; // ISO format e.g. 2026-10-16 or 'today'
  };
}

export async function generateMetadata({ params }: PanjikaDatePageProps): Promise<Metadata> {
  const targetDate = params.date === "today" ? new Date() : new Date(params.date);

  if (isNaN(targetDate.getTime())) {
    return { title: "Invalid Date | Guardian of Temples" };
  }

  const panchang = getPanchangForDate(targetDate);
  const formattedEn = targetDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return {
    title: {
      absolute: `${panchang.tithiBn} (${formattedEn}) — আজকের পঞ্জিকা ও তিথি | Guardian of Temples`,
    },
    description: `${formattedEn} (${panchang.bengaliDay} ${panchang.bengaliMonth} ${panchang.bengaliYear}) এর তিথি: ${panchang.tithiBn}। সূর্যোদয়, সূর্যাস্ত এবং উৎসবের তথ্য দেখুন।`,
    alternates: {
      canonical: `/panjika/${params.date}`,
    },
  };
}

export default function PanjikaDatePage({ params }: PanjikaDatePageProps) {
  const targetDate = params.date === "today" ? new Date() : new Date(params.date);

  if (isNaN(targetDate.getTime())) {
    notFound();
  }

  const panchang = getPanchangForDate(targetDate);
  const formattedEn = targetDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${panchang.tithiBn} - ${formattedEn}`,
    startDate: targetDate.toISOString().slice(0, 10),
    description: `${panchang.bengaliDay} ${panchang.bengaliMonth} ${panchang.bengaliYear}, ${panchang.tithiBn}`,
    location: { "@type": "Place", name: "Bangladesh" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <main className="min-h-screen py-10 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/panjika"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>সকল পঞ্জিকা ও সময়সূচীতে ফিরে যান</span>
          </Link>
        </div>

        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/20 bg-white dark:bg-slate-900 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                দৈনিক পঞ্জিকা ও তিথি
              </span>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {panchang.bengaliDay} {panchang.bengaliMonth} {panchang.bengaliYear}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formattedEn} ({panchang.weekdayBn})
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
              {toBnDigits(targetDate.getDate())}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">বর্তমান তিথি</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">{panchang.tithiBn}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">বাংলা মাস</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">{panchang.bengaliMonth} ({panchang.bengaliYear})</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/festivals/durga-puja"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              <span>পূজা ও উৎসব নির্ঘণ্ট দেখুন</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
