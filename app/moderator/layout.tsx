import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Clock, History, User } from "lucide-react";

export default async function ModeratorLayout({
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
    redirect("/login?redirectTo=/moderator");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // FIX: Ensure this perfectly matches the middleware.ts logic
  if (
    !profile ||
    (profile.role !== "moderator" && 
     profile.role !== "verifier" && 
     profile.role !== "admin")
  ) {
    redirect("/not-authorized");
  }

  // 2. Fetch pending count for badge indicator
  const { count: pendingCount } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const displayName = profile.full_name || user.email?.split("@")[0] || "Moderator";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Moderator Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Moderator Portal
              </h1>
              <span className="rounded-md bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <User className="h-3.5 w-3.5 text-slate-400" /> Logged in as:{" "}
              <strong className="text-slate-700 dark:text-slate-300">{displayName}</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Mobile Header / Desktop Buttons) */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-slate-800">
          <Link
            href="/moderator"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <Clock className="h-4 w-4 text-amber-500" />
            <span>Pending Queue</span>
            {pendingCount !== null && pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white font-bold px-2 py-0.5 text-[10px]">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/moderator/history"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <History className="h-4 w-4 text-slate-400" />
            <span>My Moderation History</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-6">{children}</div>
    </div>
  );
}