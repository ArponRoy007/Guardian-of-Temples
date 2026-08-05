"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import {
  Sun,
  Moon,
  PlusCircle,
  PhoneCall,
  LogOut,
  Sliders,
  ShieldCheck,
  User as UserIcon
} from "lucide-react";
import { EmergencyFloatingButton } from "@/components/ui/EmergencyFloatingButton";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  // Local Auth State for real-time UI updates
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial session on mount
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(data);
        }
        setIsAuthLoading(false);
      }
    }
    loadUser();

    // 2. Listen for auth changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            setProfile(data);
          } else {
            setProfile(null);
          }
          setIsAuthLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isModerator = profile?.role === "verifier" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

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

            {/* User Auth Buttons / Profile Indicator */}
            {isAuthLoading ? (
              <div className="h-8 w-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            ) : user ? (
              <div className="flex items-center gap-3 ml-2">
                {/* Profile Display */}
                <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase shadow-sm border border-primary-200 dark:border-primary-800">
                    {profile?.full_name ? profile.full_name.charAt(0) : <UserIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate leading-tight">
                      {profile?.full_name || "User"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 capitalize leading-tight">
                      {profile?.role || "Member"}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors ml-2"
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