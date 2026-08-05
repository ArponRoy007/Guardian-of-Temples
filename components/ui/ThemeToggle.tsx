"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Mobile-friendly Theme Toggle component switching between Light and Dark mode using next-themes.
 * Prevents SSR hydration mismatch by deferring rendering until mounted.
 */
export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent server-side hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme placeholder"
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800",
          className
        )}
      >
        <span className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle light and dark theme"
      className={cn(
        "relative inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
        {showLabel && (
          <span className="text-xs uppercase tracking-wider font-semibold">
            {isDark ? "Light" : "Dark"}
          </span>
        )}
      </div>
    </button>
  );
}
