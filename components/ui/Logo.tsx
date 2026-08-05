"use client";

import React from "react";

interface LogoProps {
  size?: number;
  colorMode?: "fullColor" | "monochrome";
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = 36,
  colorMode = "fullColor",
  showText = false,
  className = "",
}: LogoProps) {
  const isFullColor = colorMode === "fullColor";

  const shieldStroke = isFullColor ? "#d97706" : "currentColor";
  const templeFill = isFullColor ? "#f59e0b" : "currentColor";
  const kalashaColor = isFullColor ? "#b45309" : "currentColor";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        {/* Protective Outer Shield Contour */}
        <path
          d="M24 4L8 10V22C8 32.5 14.8 41.8 24 44C33.2 41.8 40 32.5 40 22V10L24 4Z"
          stroke={shieldStroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isFullColor ? "rgba(217, 119, 6, 0.08)" : "none"}
        />

        {/* Temple Shikhara Curved Roof Lines */}
        <path
          d="M24 12L15 26H33L24 12Z"
          fill={templeFill}
          opacity={isFullColor ? 0.9 : 1}
        />
        <path
          d="M24 17L18 26H30L24 17Z"
          fill={isFullColor ? "#ffffff" : "var(--background, #ffffff)"}
          opacity={0.3}
        />

        {/* Temple Base & Pillar Structure */}
        <path
          d="M16 26V36H32V26H16Z"
          fill={templeFill}
        />
        <path
          d="M21 30V36H27V30H21Z"
          fill={isFullColor ? "#ffffff" : "var(--background, #ffffff)"}
        />

        {/* Top Kalasha / Finial Spire */}
        <circle cx="24" cy="10" r="2" fill={kalashaColor} />
      </svg>

      {/* Optional Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Guardian of Temples
          </span>
          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase mt-0.5">
            Bangladesh
          </span>
        </div>
      )}
    </div>
  );
}
