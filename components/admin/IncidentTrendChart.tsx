"use client";

import React from "react";

export interface TrendDataPoint {
  dayLabel: string;
  count: number;
}

interface IncidentTrendChartProps {
  data: TrendDataPoint[];
}

export function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 5);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Submissions Over Last 30 Days</span>
        <span>Peak: {maxCount} / day</span>
      </div>

      <div className="relative h-44 w-full flex items-end justify-between gap-1 pt-6 pb-4 px-2 rounded-2xl bg-slate-950/60 border border-slate-800">
        {/* Grid lines */}
        <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/50 border-dashed" />
        <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/50 border-dashed" />
        <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/50 border-dashed" />

        {data.map((point, index) => {
          const heightPercent = Math.round((point.count / maxCount) * 100);
          return (
            <div
              key={index}
              className="relative flex-1 flex flex-col items-center h-full justify-end group z-10"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                {point.dayLabel}: {point.count} report(s)
              </div>

              {/* Bar */}
              <div
                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                className={`w-full rounded-t-xs transition-all duration-300 ${
                  point.count >= 4
                    ? "bg-red-600 shadow-glow-danger"
                    : point.count >= 2
                    ? "bg-amber-500"
                    : "bg-primary-500/80"
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>30 days ago</span>
        <span>15 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
