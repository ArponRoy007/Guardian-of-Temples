"use client";

import React from "react";
import { Logo } from "@/components/ui/Logo";

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "Loading Guardian of Temples..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in">
      <div className="relative">
        <Logo size={44} colorMode="fullColor" />
        <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
      </div>
      {label && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}
