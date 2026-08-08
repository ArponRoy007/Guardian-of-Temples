"use client";

import React from "react";
import { ReactionType } from "@/lib/queries/getPostReactions";

export interface ReactionSummaryProps {
  counts: {
    pray: number;
    love: number;
    flower: number;
    total: number;
  };
  onClick?: () => void;
}

const EMOJI_MAP: Record<ReactionType, string> = {
  pray: "🙏",
  love: "❤️",
  flower: "🌺",
};

export function ReactionSummary({ counts, onClick }: ReactionSummaryProps) {
  if (counts.total === 0) {
    return (
      <span className="text-[11px] text-slate-400 italic">
        Be the first to react
      </span>
    );
  }

  // Get active reaction types sorted by count descending
  const activeTypes = (["pray", "love", "flower"] as ReactionType[])
    .filter((t) => counts[t] > 0)
    .sort((a, b) => counts[b] - counts[a]);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium ${
        onClick ? "cursor-pointer hover:underline" : ""
      }`}
    >
      {/* Stacked Emojis */}
      <div className="flex items-center -space-x-1">
        {activeTypes.map((type) => (
          <span
            key={type}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] ring-2 ring-white dark:ring-slate-900 shadow-2xs"
          >
            {EMOJI_MAP[type]}
          </span>
        ))}
      </div>

      <span className="font-semibold font-mono text-slate-900 dark:text-white">
        {counts.total}
      </span>
    </div>
  );
}
