"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Check,
  ArrowRight,
  Sparkles,
  Inbox,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "post_deleted" | "temple_admin_approved" | "temple_admin_rejected";
  title: string;
  message: string;
  related_post_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login?redirectTo=/notifications");
    }
  }, [user, isAuthLoading, router]);

  // Fetch All User Notifications
  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, message, related_post_id, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data as NotificationItem[]);
      }
      setLoading(false);
    }

    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (!user) return;

    // Optimistically set read state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );

    await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id);

    // Contextual navigation based on notification type
    if (notification.type === "temple_admin_approved") {
      router.push("/temple-feed/new-post");
    } else if (notification.type === "temple_admin_rejected") {
      router.push("/become-temple-admin");
    } else if (notification.type === "post_deleted") {
      router.push("/temple-feed");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "post_deleted":
        return <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />;
      case "temple_admin_approved":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "temple_admin_rejected":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      default:
        return <Bell className="h-5 w-5 text-indigo-500 shrink-0" />;
    }
  };

  if (isAuthLoading || loading) {
    return (
      <main className="min-h-screen py-10 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="glass-card rounded-3xl p-12 text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800">
          Loading notifications...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Updates regarding your temple admin verification requests and feed post status.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shrink-0"
            >
              <Check className="h-4 w-4" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List / Empty State */}
      {notifications.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Inbox className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              No Notifications Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You're all caught up! Updates regarding temple verification requests or post moderation will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item)}
              className={`group p-5 rounded-3xl border transition-all cursor-pointer space-y-2 shadow-sm hover:shadow-md ${
                !item.is_read
                  ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80"
                  : "bg-white dark:bg-[#0b1320] border-slate-200 dark:border-slate-800 opacity-90"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.title}</span>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {formatRelativeTime(item.created_at)}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-11">
                {item.message}
              </p>

              <div className="flex items-center justify-end pl-11 pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
