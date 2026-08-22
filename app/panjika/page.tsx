import { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "আজকের তিথি ও বাংলা পঞ্জিকা ২০২৬ — সময়সূচী ও নির্ঘণ্ট | Guardian of Temples",
  },
  description:
    "আজকের তিথি, বাংলা ক্যালেন্ডার ১৪৩৩, একাদশী ও দুর্গাপূজার সঠিক সময়সূচী এবং শুভ মুহুর্ত দেখুন Guardian of Temples পঞ্জিকায়।",
  keywords: [
    "আজকের তিথি",
    "বাংলা পঞ্জিকা",
    "আজকের পঞ্জিকা বাংলাদেশ",
    "আজকের তিথি ও শুভ সময়",
    "বাংলা ক্যালেন্ডার ২০২৬",
    "একাদশী সময়সূচী ২০২৬",
    "দুর্গাপূজা ২০২৬ পঞ্জিকা",
  ],
  alternates: {
    canonical: "/panjika",
  },
  openGraph: {
    title: "আজকের তিথি ও বাংলা পঞ্জিকা ২০২৬ — Guardian of Temples",
    description: "বাংলা পঞ্জিকা, আজকের তিথি, একাদশী ব্রত এবং হিন্দু উৎসবের নির্ভুল সময়সূচী।",
    url: "/panjika",
  },
};

export default function PanjikaPage() {
  // Major 2026 Tithi Events for Google Rich Results
  const panjikaEventsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        name: "মহালয়া ২০২৬ (Mahalaya)",
        startDate: "2026-10-10",
        endDate: "2026-10-10",
        description: "আশ্বিন অমাবস্যা দেবীপক্ষের সূচনা ও তর্পণ অনুষ্ঠান।",
        location: { "@type": "Place", name: "Bangladesh" },
      },
      {
        "@type": "Event",
        name: "শ্রীশ্রী দুর্গাপূজা ২০২৬ (Durga Puja)",
        startDate: "2026-10-16",
        endDate: "2026-10-20",
        description: "মহা ষষ্ঠী থেকে বিজয়া দশমী দুর্গাপূজা নির্ঘণ্ট।",
        location: { "@type": "Place", name: "Bangladesh" },
      },
      {
        "@type": "Event",
        name: "শ্যামাপূজা / দীপাবলী ২০২৬ (Kali Puja)",
        startDate: "2026-11-08",
        endDate: "2026-11-08",
        description: "কার্তিক অমাবস্যা মধ্যরাত্রিকালীন শ্যামাপূজা ও প্রদীপ প্রজ্জ্বলন।",
        location: { "@type": "Place", name: "Bangladesh" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(panjikaEventsJsonLd) }}
      />
      <main className="min-h-screen bg-slate-50 text-zinc-900 selection:bg-orange-500/30 pb-12">
        <DashboardClient />

        {/* Task 3: Static Explainer Section for Readers & Search Engines */}
        <section className="mx-auto max-w-2xl px-4 mt-8 pt-8 border-t border-zinc-200">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed">
            <h2 className="font-display text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
              <span className="text-orange-500">🛕</span>
              <span>পঞ্জিকা ও তিথি কী? (Understanding the Bengali Panjika & Tithi)</span>
            </h2>
            <p>
              <strong>বাংলা পঞ্জিকা (Panjika)</strong> হলো সনাতন হিন্দু ঐতিহ্য ও পঞ্জিকাবিদ্যার একটি বৈদিক নির্ঘণ্ট, যা সূর্য ও চন্দ্রমাসিক গতির ওপর নির্ভর করে রচিত হয়। এতে প্রতিদিনের <strong>তিথি (Tithi - চন্দ্রকলা সময়)</strong>, নক্ষত্র, যোগ, করণ এবং শুভ-অশুভ মুহুর্তের সঠিক হিসাব দেয়া থাকে।
            </p>
            <p>
              বাংলাদেশে দুর্গাপূজা, একাদশী ব্রত, জন্মাষ্টমী, এবং অন্নপ্রাশন বা শুভ বিবাহের মতো পারিবারিক ও সামাজিক অনুষ্ঠানের দিন নির্ধারণে পঞ্জিকা অত্যন্ত গুরুত্বপূর্ণ ভূমিকা পালন করে। সৌর পঞ্জিকা অনুসারে বৈশাখ থেকে চৈত্র ১২ মাসে বছর গণনা করা হয়, আর চন্দ্রকলার বৃদ্ধিক্রম (শুক্লপক্ষ ও কৃষ্ণপক্ষ) অনুযায়ী তিথি নির্ধারিত হয়।
            </p>
          </div>
        </section>
      </main>
    </>
  );
}