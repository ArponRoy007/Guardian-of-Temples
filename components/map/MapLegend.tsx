"use client";

export function MapLegend() {
  const scale = [
    { count: "0", color: "bg-slate-200 dark:bg-slate-800", label: "0 (None)" },
    { count: "1", color: "bg-red-200 dark:bg-red-950", label: "1 (Minor)" },
    { count: "2", color: "bg-red-400 dark:bg-red-800", label: "2 (Moderate)" },
    { count: "3", color: "bg-red-500 dark:bg-red-700", label: "3 (High)" },
    { count: "4", color: "bg-red-600 dark:bg-red-600", label: "4 (Severe)" },
    { count: "5+", color: "bg-red-800 dark:bg-red-500", label: "5+ (Critical)" },
  ];

  return (
    <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-2.5 shadow-lg backdrop-blur-md text-[11px]">
      <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
        <span>Incident Intensity</span>
        <span className="text-[10px] text-slate-400 font-normal">Approved Reports</span>
      </div>

      <div className="flex items-center gap-1.5">
        {scale.map((item) => (
          <div key={item.count} className="flex flex-col items-center gap-1">
            <span
              className={`h-4 w-5 rounded ${item.color} border border-slate-300/40 dark:border-slate-700/40 shadow-xs`}
            />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
