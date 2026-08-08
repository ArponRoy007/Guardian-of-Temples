import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TempleRequestsQueue } from "@/components/admin/TempleRequestsQueue";
import { UserCheck, History, Clock } from "lucide-react";

export const metadata = {
  title: "Temple Admin Requests | Admin Control",
  description: "Review and verify user requests for temple_admin access.",
};

export default async function AdminTempleRequestsQueuePage() {
  const supabase = createClient();

  // 1. Authenticated User & Admin Role Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/temple-requests");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/not-authorized");
  }

  // 2. Query Pending Requests (Oldest first for queue priority)
  const { data: pendingRequests, error } = await supabase
    .from("temple_admin_requests")
    .select(`
      *,
      temple:temples(id, name, districts(name_en, name_bn)),
      district:districts!new_temple_district_id(name_en, name_bn)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending temple admin requests:", error.message);
  }

  return (
    <div className="space-y-6">
      {/* Sub-Header Bar with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Temple Admin Verification Queue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify committee proof documents and assign temple_admin privileges.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/temple-requests"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Pending Queue</span>
            {pendingRequests && pendingRequests.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold">
                {pendingRequests.length}
              </span>
            )}
          </Link>

          <Link
            href="/admin/temple-requests/history"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>Decision History</span>
          </Link>
        </div>
      </div>

      {/* Pending Requests Queue Component */}
      <TempleRequestsQueue requests={(pendingRequests as any[]) || []} />
    </div>
  );
}
