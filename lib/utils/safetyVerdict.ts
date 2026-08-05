export type SafetyStatus = "safe" | "caution" | "high-risk";

export interface SafetyVerdict {
  status: SafetyStatus;
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  explanation: string;
}

/**
 * Computes safety risk verdict based on total approved incident count and recency.
 */
export function computeSafetyVerdict(
  incidentCount: number,
  mostRecentIncidentDate: string | Date | null
): SafetyVerdict {
  if (incidentCount === 0) {
    return {
      status: "safe",
      label: "No Reported Incidents",
      colorClass: "text-emerald-700 dark:text-emerald-300",
      bgClass: "bg-emerald-100 dark:bg-emerald-950/80",
      borderClass: "border-emerald-300 dark:border-emerald-800",
      explanation: "No approved temple vandalism or violence incidents have been documented in this district.",
    };
  }

  // Calculate months since most recent incident if date available
  let isRecent = true;
  if (mostRecentIncidentDate) {
    const incidentTime = new Date(mostRecentIncidentDate).getTime();
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    isRecent = incidentTime > sixMonthsAgo;
  }

  if (incidentCount >= 4 || (incidentCount >= 2 && isRecent)) {
    return {
      status: "high-risk",
      label: "High Risk Area",
      colorClass: "text-red-700 dark:text-red-300",
      bgClass: "bg-red-100 dark:bg-red-950/80",
      borderClass: "border-red-300 dark:border-red-800",
      explanation: "Multiple recent incidents reported. High vigilance and law enforcement monitoring recommended.",
    };
  }

  return {
    status: "caution",
    label: "Moderate Risk / Caution",
    colorClass: "text-amber-700 dark:text-amber-300",
    bgClass: "bg-amber-100 dark:bg-amber-950/80",
    borderClass: "border-amber-300 dark:border-amber-800",
    explanation: "Occasional incidents reported in this district. Community awareness advised during Puja festivities.",
  };
}
