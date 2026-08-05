"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { MapLegend } from "@/components/map/MapLegend";
import { DistrictDetailPanel, DistrictData } from "@/components/map/DistrictDetailPanel";
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Loader2 } from "lucide-react";

const GEOJSON_URL = "/data/bangladesh-districts.geojson";

// Approximate District Center Coordinates Map for Auto-Zooming
const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "BD-13": [90.4, 23.8],  // Dhaka
  "BD-10": [91.9, 22.3],  // Chittagong
  "BD-08": [91.1, 23.4],  // Comilla / Cumilla
  "BD-47": [91.1, 22.7],  // Noakhali
  "BD-55": [89.2, 25.7],  // Rangpur
  "BD-27": [89.4, 22.8],  // Khulna
  "BD-54": [88.6, 24.4],  // Rajshahi
  "BD-62": [91.9, 24.9],  // Sylhet
  "BD-06": [90.3, 22.7],  // Barisal
  "BD-39": [90.4, 24.7],  // Mymensingh
};

export function getDistrictColor(count: number, isDark: boolean): string {
  if (count === 0) return isDark ? "#1e293b" : "#f1f5f9";
  if (count === 1) return isDark ? "#450a0a" : "#fecaca";
  if (count === 2) return isDark ? "#7f1d1d" : "#fca5a5";
  if (count === 3) return isDark ? "#991b1b" : "#f87171";
  if (count === 4) return isDark ? "#b91c1c" : "#ef4444";
  return isDark ? "#dc2626" : "#991b1b";
}

interface BangladeshMapProps {
  focusedDistrictId?: string; // GeoCode (e.g. BD-08) or Name (e.g. Cumilla)
  interactive?: boolean;
}

export function BangladeshMap({
  focusedDistrictId,
  interactive = true,
}: BangladeshMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [dbDistricts, setDbDistricts] = useState<Record<string, DistrictData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [90.3563, 23.685], zoom: 1 });

  const supabase = createClient();

  // Fetch live district incident counts
  useEffect(() => {
    async function fetchDistrictCounts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("district_incident_counts")
          .select("district_id, name_en, name_bn, division, geo_code, approved_incident_count");

        if (error) {
          console.error("Error fetching district counts:", error.message);
        } else if (data) {
          const map: Record<string, DistrictData> = {};
          data.forEach((row) => {
            map[row.geo_code] = row as DistrictData;
            // Also key by lowercased English name for flexible search matching
            map[row.name_en.toLowerCase()] = row as DistrictData;
          });
          setDbDistricts(map);
        }
      } catch (err) {
        console.error("Failed to query district counts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDistrictCounts();
  }, []);

  // Auto-zoom to focusedDistrictId when passed
  useEffect(() => {
    if (!focusedDistrictId) return;

    const lowerTarget = focusedDistrictId.toLowerCase();
    const matchedRecord =
      dbDistricts[focusedDistrictId] ||
      dbDistricts[lowerTarget] ||
      Object.values(dbDistricts).find(
        (d) =>
          d.geo_code.toLowerCase() === lowerTarget ||
          d.name_en.toLowerCase() === lowerTarget ||
          d.name_bn === focusedDistrictId
      );

    if (matchedRecord) {
      const coords = DISTRICT_CENTERS[matchedRecord.geo_code] || [90.3563, 23.685];
      setPosition({ coordinates: coords, zoom: 2.2 });
    }
  }, [focusedDistrictId, dbDistricts]);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [90.3563, 23.685], zoom: 1 });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#070b12] shadow-xl">
      {/* Map Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 py-3 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-500" />
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              {focusedDistrictId ? `Focused Map View` : `Bangladesh 64-District Map`}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tap any district to view incident details & safety assessment
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Map View"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltipContent && (
        <div className="absolute top-16 left-4 z-30 pointer-events-none rounded-xl bg-slate-900/90 text-white px-3 py-1.5 text-xs font-semibold shadow-xl border border-slate-700 backdrop-blur-md animate-in fade-in">
          {tooltipContent}
        </div>
      )}

      {/* SVG Map Canvas */}
      <div className="relative min-h-[400px] sm:min-h-[480px] w-full flex items-center justify-center p-2">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-xs">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-2" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Loading District Boundaries...
            </span>
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 3600,
            center: [90.3563, 23.685],
          }}
          className="w-full h-auto max-h-[550px] outline-none"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={(pos) => setPosition(pos)}
          >
            <Geographies geography={GEOJSON_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoCode = geo.properties.geo_code || geo.id;
                  const dbRecord = dbDistricts[geoCode] || dbDistricts[geo.properties.name_en?.toLowerCase()];
                  const incidentCount = dbRecord ? dbRecord.approved_incident_count : 0;
                  const fillColor = getDistrictColor(incidentCount, isDark);

                  const districtNameEn = dbRecord?.name_en || geo.properties.name_en || "District";
                  const districtNameBn = dbRecord?.name_bn || geo.properties.name_bn || "";

                  const isFocused =
                    focusedDistrictId &&
                    (geoCode.toLowerCase() === focusedDistrictId.toLowerCase() ||
                      districtNameEn.toLowerCase() === focusedDistrictId.toLowerCase() ||
                      districtNameBn === focusedDistrictId);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setTooltipContent(
                          `${districtNameEn} (${districtNameBn}): ${incidentCount} Approved Incident(s)`
                        );
                      }}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                      onClick={() => {
                        if (!interactive) return;
                        const selected: DistrictData = dbRecord ?? {
                          district_id: 0,
                          name_en: districtNameEn,
                          name_bn: districtNameBn,
                          division: geo.properties.division || "Bangladesh",
                          geo_code: geoCode,
                          approved_incident_count: incidentCount,
                        };
                        setSelectedDistrict(selected);
                      }}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isFocused ? "#f59e0b" : isDark ? "#334155" : "#cbd5e1",
                          strokeWidth: isFocused ? 2.5 : 0.8,
                          outline: "none",
                          transition: "all 250ms ease",
                        },
                        hover: {
                          fill: isDark ? "#e05314" : "#f59a50",
                          stroke: "#ffffff",
                          strokeWidth: 1.5,
                          cursor: interactive ? "pointer" : "default",
                          outline: "none",
                        },
                        pressed: {
                          fill: "#c73d0a",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <MapLegend />
      </div>

      {/* Selected District Detail Panel */}
      {interactive && (
        <DistrictDetailPanel
          district={selectedDistrict}
          onClose={() => setSelectedDistrict(null)}
        />
      )}
    </div>
  );
}
