import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert, Trash2, Calendar, User, Search, Church } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/formatDate";

export const metadata = {
  title: "Removed Posts Audit Log | Admin Portal",
  description: "Audit log of all temple post removals and takedown reasons executed by moderators.",
};

export default async function RemovedPostsAuditPage() {
  const supabase = createClient();

  // 1. Authenticate user server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/removed-posts");
  }

  // 2. Strict Admin Role Verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/not-authorized");
  }

  // 3. Fetch Post Moderation Log Entries
  const { data: logs, error } = await supabase
    .from("post_moderation_log")
    .select(`
      id,
      post_id,
      reason,
      notified,
      created_at,
      moderator:profiles!post_moderation_log_deleted_by_fkey(full_name, role),
      post:temple_posts(
        image_url,
        caption,
        created_at,
        temple:temples(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch moderation log error:", error.message);
  }

  const logEntries = logs || [];

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Post Takedown Audit Log
              </h1>
              <span className="rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">
                {logEntries.length} Removals
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive audit trail of all temple feed posts soft-deleted by volunteer moderators and system admins.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Table / Cards */}
      <div className="space-y-4">
        {logEntries.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800">
            No posts have been removed by moderators yet.
          </div>
        ) : (
          <div className="space-y-3">
            {logEntries.map((log: any) => {
              const templeName = log.post?.temple?.name || "Temple";
              const modName = log.moderator?.full_name || "Moderator";
              const modRole = log.moderator?.role || "moderator";
              const timeAgo = formatRelativeTime(log.created_at);

              return (
                <div
                  key={log.id}
                  className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      {log.post?.image_url ? (
                        <img
                          src={log.post.image_url}
                          alt="Removed post"
                          className="h-12 w-12 rounded-xl object-cover shrink-0 bg-slate-900"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                          <Church className="h-6 w-6" />
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {templeName}
                        </h3>
                        {log.post?.caption && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            "{log.post.caption}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Removed by:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {modName}
                      </span>
                      <span className="rounded-md bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 capitalize">
                        {modRole}
                      </span>
                    </div>
                  </div>

                  {/* Takedown Reason */}
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Takedown Reason
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {log.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Log ID: {log.id.slice(0, 8)}...</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
