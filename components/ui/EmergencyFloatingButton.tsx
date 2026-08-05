"use client";

import Link from "next/link";
import { PhoneCall } from "lucide-react";

export function EmergencyFloatingButton() {
  return (
    <Link
      href="/helpline"
      aria-label="Emergency Helplines One-Tap Shortcut"
      className="fixed bottom-5 right-5 z-40 sm:hidden flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/50 hover:bg-red-500 active:scale-95 transition-all ring-4 ring-red-500/20"
    >
      <PhoneCall className="h-6 w-6 animate-pulse" />
    </Link>
  );
}
