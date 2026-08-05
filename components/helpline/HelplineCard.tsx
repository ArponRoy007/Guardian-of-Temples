"use client";

import React from "react";
import { PhoneCall, ShieldAlert, Scale, HeartHandshake, AlertCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HelplineItem {
  id: string;
  name: string;
  phone_number: string;
  category: "police" | "human_rights_org" | "minority_affairs" | "emergency_other";
  district_id?: number | null;
  district?: { name_en: string; name_bn: string } | null;
  isProminent?: boolean;
}

interface HelplineCardProps {
  helpline: HelplineItem;
}

export function HelplineCard({ helpline }: HelplineCardProps) {
  const getCategoryMeta = (category: string) => {
    switch (category) {
      case "police":
        return {
          label: "Police Emergency",
          icon: ShieldAlert,
          badgeBg: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
        };
      case "human_rights_org":
        return {
          label: "Human Rights & Legal Aid",
          icon: Scale,
          badgeBg: "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
        };
      case "minority_affairs":
        return {
          label: "Minority Assistance",
          icon: HeartHandshake,
          badgeBg: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
        };
      default:
        return {
          label: "National Emergency",
          icon: AlertCircle,
          badgeBg: "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800",
        };
    }
  };

  const meta = getCategoryMeta(helpline.category);
  const Icon = meta.icon;

  const sanitizedPhone = helpline.phone_number.replace(/[^0-9+]/g, "");

  return (
    <div
      className={cn(
        "glass-card rounded-3xl p-5 border space-y-4 shadow-lg transition-all flex flex-col justify-between",
        helpline.isProminent
          ? "border-red-500/50 bg-red-500/5 dark:bg-red-950/20 ring-2 ring-red-500/30"
          : "border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="space-y-2">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border",
              meta.badgeBg
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>

          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
            <MapPin className="h-3 w-3 text-slate-400" />
            {helpline.district ? `${helpline.district.name_en}` : "National Hotline"}
          </span>
        </div>

        {/* Organization Title */}
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">
          {helpline.name}
        </h3>
      </div>

      {/* Tap-to-Call Large Touch Button */}
      <div className="pt-2">
        <a
          href={`tel:${sanitizedPhone}`}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 font-mono font-extrabold text-base shadow-lg active:scale-95 transition-all",
            helpline.isProminent
              ? "bg-red-600 hover:bg-red-500 text-white shadow-glow-danger"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow"
          )}
        >
          <PhoneCall className="h-5 w-5 animate-pulse" />
          <span>Call {helpline.phone_number}</span>
        </a>
      </div>
    </div>
  );
}
