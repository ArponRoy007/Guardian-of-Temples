"use client";

import { useState } from "react";
import { computeSafetyVerdict, SafetyVerdict } from "@/lib/utils/safetyVerdict";
import { ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyVerdictBadgeProps {
  incidentCount: number;
  mostRecentIncidentDate?: string | Date | null;
  verdictOverride?: SafetyVerdict;
  className?: string;
  showExplanation?: boolean;
}

export function SafetyVerdictBadge({
  incidentCount,
  mostRecentIncidentDate = null,
  verdictOverride,
  className,
  showExplanation = true,
}: SafetyVerdictBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const verdict =
    verdictOverride || computeSafetyVerdict(incidentCount, mostRecentIncidentDate);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "inline-flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 border text-xs font-semibold shadow-xs transition-all",
          verdict.bgClass,
          verdict.borderClass,
          verdict.colorClass
        )}
      >
        <div className="flex items-center gap-1.5">
          {verdict.status === "safe" ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span>{verdict.label}</span>
        </div>

        {showExplanation && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle verdict details"
            className="rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {showExplanation && expanded && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/90 p-3 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p>{verdict.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
