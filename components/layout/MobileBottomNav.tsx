"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Search, PlusCircle, PhoneCall, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on admin/moderator sub-dashboards if needed, or keep for main navigation
  const isDashboardRoute = pathname.startsWith("/admin") || pathname.startsWith("/moderator");

  if (isDashboardRoute) return null;

  const navItems = [
    { name: "Map", href: "/", icon: MapPin },
    { name: "Search", href: "/search", icon: Search },
    {
      name: "Report",
      href: "/submit-incident",
      icon: PlusCircle,
      isCenter: true,
    },
    { name: "Helpline", href: "/helpline", icon: PhoneCall },
    { name: "My Reports", href: "/my-submissions", icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 dark:bg-[#060b13]/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-[env(safe-area-inset-bottom)] shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Report New Incident"
                className="flex items-center justify-center -mt-5 h-13 w-13 rounded-full bg-primary-600 text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all ring-4 ring-white dark:ring-[#060b13]"
              >
                <Icon className="h-6 w-6" />
              </Link>
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
  );
}
