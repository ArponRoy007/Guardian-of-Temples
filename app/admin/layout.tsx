import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  Church,
  PhoneCall,
  User,
  Sliders,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // 1. Defense-in-Depth Server Role Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/not-authorized");
  }

  // 2. Fetch Pending Temple Admin Requests Count for Badge
  const { count: pendingRequestsCount } = await supabase
    .from("temple_admin_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const displayName = profile.full_name || user.email?.split("@")[0] || "Administrator";

  const navLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "All Submissions", href: "/admin/submissions", icon: FileText },
    {
      name: "Temple Admin Requests",
      href: "/admin/temple-requests",
      icon: UserCheck,
      count: pendingRequestsCount,
    },
    { name: "Removed Posts", href: "/admin/removed-posts", icon: ShieldAlert },
    { name: "Moderators", href: "/admin/moderators", icon: ShieldCheck },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Manage Temples", href: "/admin/temples", icon: Church },
    { name: "Manage Helplines", href: "/admin/helplines", icon: PhoneCall },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-glow-danger font-bold">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Admin Control Center
              </h1>
              <span className="rounded-md bg-red-100 dark:bg-red-950 px-2 py-0.5 text-xs font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wider">
                System Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <User className="h-3.5 w-3.5 text-slate-400" /> Authenticated Administrator:{" "}
              <strong className="text-slate-800 dark:text-slate-200">{displayName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Header Bar (Scrollable on mobile) */}
      <div className="overflow-x-auto pb-1">
        <nav className="flex items-center gap-1.5 min-w-max rounded-2xl bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>{link.name}</span>
                {typeof link.count === "number" && link.count > 0 && (
                  <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold shadow-xs">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Admin Page Content */}
      <div>{children}</div>
    </div>
  );
}
