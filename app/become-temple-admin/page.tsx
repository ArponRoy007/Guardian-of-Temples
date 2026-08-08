import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequestStatusBanner } from "@/components/temple-admin/RequestStatusBanner";
import { TempleAdminRequestForm } from "@/components/forms/TempleAdminRequestForm";
import { Church, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Become a Temple Admin | Guardian of Temples",
  description: "Apply for temple admin verification to manage and share positive photo updates for your temple.",
};

export default async function BecomeTempleAdminPage() {
  const supabase = createClient();

  // 1. Authenticated User Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/become-temple-admin");
  }

  // 2. Fetch User Profile and Latest Application Request
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, linked_temple_id")
    .eq("id", user.id)
    .single();

  const { data: latestRequest } = await supabase
    .from("temple_admin_requests")
    .select("id, status, temple_id, new_temple_name, review_note, created_at, reviewed_at")
    .eq("requested_by", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isVerifiedAdmin = profile?.role === "temple_admin";
  const isPending = latestRequest?.status === "pending";

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Church className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Temple Admin Verification Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify your affiliation with a temple committee to post daily photos, festival updates, and announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Render Status Banner if Admin or Pending */}
      {(isVerifiedAdmin || isPending) && (
        <RequestStatusBanner profile={profile} latestRequest={latestRequest} />
      )}

      {/* Render Request Form if not currently admin or pending */}
      {!isVerifiedAdmin && !isPending && (
        <div className="space-y-6">
          {latestRequest?.status === "rejected" && (
            <RequestStatusBanner profile={profile} latestRequest={latestRequest} />
          )}

          <TempleAdminRequestForm />
        </div>
      )}
    </main>
  );
}
