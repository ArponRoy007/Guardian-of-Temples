"use client";

import { useState } from "react";
import { Map, Layers, AlertCircle, Filter, Maximize2, ShieldAlert, Sparkles } from "lucide-react";

export function MapPlaceholder() {
  const [activeLayer, setActiveLayer] = useState<"pins" | "choropleth" | "heatmap">("pins");

  // Sample District Intensity Mock Data for visual demonstration
  const sampleDistricts = [
    { name: "Chittagong", count: 14, severity: "high" },
    { name: "Cumilla", count: 11, severity: "critical" },
    { name: "Rangpur", count: 8, severity: "medium" },
    { name: "Dhaka", count: 7, severity: "medium" },
    { name: "Noakhali", count: 9, severity: "high" },
    { name: "Gazipur", count: 4, severity: "low" },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl">
      {/* Map Control Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary-400" />
          <span className="font-display font-semibold text-sm text-slate-100">
            Interactive Bangladesh Incident Map
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Data Feed Ready
          </span>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveLayer("pins")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === "pins"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Incident Pins
          </button>
          <button
            onClick={() => setActiveLayer("choropleth")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === "choropleth"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            District Density
          </button>
          <button
            onClick={() => setActiveLayer("heatmap")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === "heatmap"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Heatmap
          </button>
        </div>
      </div>

      {/* Main Map Visual Canvas Placeholder */}
      <div className="relative min-h-[360px] sm:min-h-[440px] w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center p-6 text-center">
        
        {/* Animated Map Grid Graphic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Simulated Map Pin Clusters */}
        <div className="absolute top-1/4 left-1/3 animate-bounce">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600/80 text-white font-bold text-xs shadow-glow-danger border-2 border-white/40">
            14
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2">
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-500/80 text-white font-bold text-xs shadow-glow border-2 border-white/40">
            8
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/3">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-red-800/90 text-white font-bold text-xs shadow-glow-danger border-2 border-white/40 animate-pulse">
            11
          </div>
        </div>

        {/* Central Coming Soon Card */}
        <div className="relative z-10 max-w-md rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/30 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>

          <h3 className="font-display text-lg font-bold text-white mb-2">
            Coming Soon: Bangladesh Interactive Map
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-5">
            Integrating Leaflet / React-Simple-Maps for live district choropleth visualization, GeoJSON division filters, and verified temple vandalism pin clusters.
          </p>

          <div className="grid grid-cols-2 gap-2 text-left text-xs mb-4">
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Map Library</span>
              <span className="font-medium text-slate-200">React-Leaflet / SVG</span>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Boundary Layers</span>
              <span className="font-medium text-slate-200">64 Districts TopoJSON</span>
            </div>
          </div>
        </div>

        {/* Bottom Legend Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/90 border border-slate-800 px-3 py-2 text-[11px] backdrop-blur-md">
          <span className="font-medium text-slate-400">Severity Intensity:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Vandalism
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Desecration
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Physical Attack
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-red-900" /> Critical Mass
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
