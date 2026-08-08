"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, MapPin, Search, PlusCircle, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { PostActionSheet } from "@/components/layout/PostActionSheet";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuth();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Hide bottom nav on admin/moderator sub-dashboards
  const isDashboardRoute = pathname.startsWith("/admin") || pathname.startsWith("/moderator");

  if (isDashboardRoute) return null;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Safety Map", href: "/safety-map", icon: MapPin },
    {
      name: "Create",
      href: "/submit-incident",
      icon: PlusCircle,
      isCenter: true,
    },
    { name: "Search", href: "/search", icon: Search },
    { name: "Profile", href: user ? "/my-submissions" : "/login", icon: User },
  ];

  const handleCenterClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // 1. If unauthenticated, redirect to login with return path
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname || "/submit-incident")}`);
      return;
    }

    // 2. If temple_admin role, open role-aware action sheet
    if (role === "temple_admin") {
      setIsActionSheetOpen(true);
      return;
    }

    // 3. For regular users, moderators, and admins: route to submit incident report
    router.push("/submit-incident");
  };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 dark:bg-[#060b13]/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            if (item.isCenter) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={handleCenterClick}
                  aria-label="Create Content or Report Incident"
                  className="flex items-center justify-center -mt-5 h-13 w-13 rounded-full bg-primary-600 text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all ring-4 ring-white dark:ring-[#060b13]"
                >
                  <Icon className="h-6 w-6" />
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "text-primary-600 dark:text-primary-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "scale-110 transition-transform")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role-Aware Action Sheet for Temple Admins */}
      <PostActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />
    </>
  );
}
