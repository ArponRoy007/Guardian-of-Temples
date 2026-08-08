import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TempleRequestsHistory } from "@/components/admin/TempleRequestsHistory";
import { UserCheck, History, Clock } from "lucide-react";

export const metadata = {
  title: "Request History | Temple Admin Requests",
  description: "View past approved and rejected temple admin verification decisions.",
};

export default async function AdminTempleRequestsHistoryPage() {
  const supabase = createClient();

  // 1. Authenticated User & Admin Role Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/temple-requests/history");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/not-authorized");
  }

  // 2. Fetch Pending Count for Tab Badge
  const { count: pendingCount } = await supabase
    .from("temple_admin_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  // 3. Query History Requests (Approved & Rejected, newest first)
  const { data: historyRequests, error } = await supabase
    .from("temple_admin_requests")
    .select(`
      *,
      temple:temples(id, name, districts(name_en)),
      district:districts!new_temple_district_id(name_en)
    `)
    .in("status", ["approved", "rejected"])
    .order("reviewed_at", { ascending: false });

  if (error) {
    console.error("Error fetching temple admin request history:", error.message);
  }

  return (
    <div className="space-y-6">
      {/* Sub-Header Bar with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500 border border-slate-500/20">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Verification Decision History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of all processed temple admin verification requests.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/temple-requests"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Pending Queue</span>
            {pendingCount !== null && pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/temple-requests/history"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
          >
            <History className="h-3.5 w-3.5" />
            <span>Decision History</span>
          </Link>
        </div>
      </div>

      {/* History Requests Component */}
      <TempleRequestsHistory requests={(historyRequests as any[]) || []} />
    </div>
  );
}
