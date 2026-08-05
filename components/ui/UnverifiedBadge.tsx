"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnverifiedBadgeProps {
  className?: string;
}

export function UnverifiedBadge({ className }: UnverifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 shadow-xs",
        className
      )}
      title="This temple was organically added via an incident report submission and requires official admin verification."
    >
      <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
      <span>Unverified (User Reported)</span>
    </span>
  );
}
