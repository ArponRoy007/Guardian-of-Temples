"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks/useAuth";
import { Logo } from "@/components/ui/Logo";
import {
  Sun,
  Moon,
  PlusCircle,
  PhoneCall,
  LogOut,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { EmergencyFloatingButton } from "@/components/ui/EmergencyFloatingButton";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const isModerator = profile?.role === "verifier" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Guardian of Temples SVG Logo & Wordmark */}
          <Link href="/" className="flex items-center group">
            <Logo showText={true} size={36} colorMode="fullColor" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Link
              href="/"
              className={`hover:text-primary-500 transition-colors ${
                pathname === "/" ? "text-primary-600 dark:text-primary-400 font-bold" : ""
              }`}
            >
              Incident Map
            </Link>

            <Link
              href="/helpline"
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${
                pathname.startsWith("/helpline") ? "text-red-600 font-bold" : ""
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              <span>Emergency Helplines</span>
            </Link>

            {user && (
              <Link
                href="/my-submissions"
                className={`hover:text-primary-500 transition-colors ${
                  pathname.startsWith("/my-submissions") ? "text-primary-600 dark:text-primary-400 font-bold" : ""
                }`}
              >
                My Reports
              </Link>
            )}

            {isModerator && (
              <Link
                href="/moderator"
                className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Moderator Portal
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-950/80 px-2.5 py-1 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
              >
                <Sliders className="h-3.5 w-3.5" /> Admin Control
              </Link>
            )}
          </nav>

          {/* Action Buttons (Report Incident, Theme Toggle, Auth) */}
          <div className="flex items-center gap-3">
            <Link
              href="/submit-incident"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Report Incident</span>
            </Link>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => signOut()}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Persistent Floating Emergency Hotline Button for Mobile */}
      <EmergencyFloatingButton />
    </>
  );
}
