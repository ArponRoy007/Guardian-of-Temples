"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Shield, X, Church, Bell } from "lucide-react";

export function HomepageWelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner only if user has not dismissed it in localStorage
    const isDismissed = localStorage.getItem("dismissed_welcome_banner");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("dismissed_welcome_banner", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-primary-950/50 p-6 sm:p-8 border border-slate-800 text-white shadow-2xl space-y-3 animate-in fade-in">
      <button
        onClick={handleDismiss}
        aria-label="Dismiss welcome message"
        className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">
        {/* Changed from Sparkles to Bell for a traditional temple feel */}
        <Bell className="h-3.5 w-3.5" />
        <span>গার্ডিয়ান অব টেম্পলস-এ আপনাকে স্বাগতম</span>
      </div>

      <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
        উৎসবের প্রতিটি মুহূর্ত{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-300 to-red-400">
          একসাথে
        </span>
      </h2>

      {/* Short, stylish, and SEO-friendly description */}
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
        সনাতন ধর্মাবলম্বীদের সবচেয়ে বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। আপনার আশেপাশের মন্দিরের দৈনন্দিন আপডেট, সঠিক পঞ্জিকা এবং উৎসবের সব খবর পান এক জায়গায়। যুক্ত থাকুন নিজের সম্প্রদায়ের সাথে।
      </p>
    </div>
  );
}
