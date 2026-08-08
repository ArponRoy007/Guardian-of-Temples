"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Fetch Recent Notifications (Top 5 for dropdown)
  const fetchNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, message, related_post_id, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setNotifications(data as NotificationItem[]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Supabase Realtime Subscription: Instant unread badge updates when open
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "post_deleted":
        return <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />;
      case "temple_admin_approved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "temple_admin_rejected":
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-glow-danger animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Quick Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-950 p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
              <Bell className="h-3.5 w-3.5 text-indigo-500" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-md bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:text-indigo-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Body (Top 5 Recent) */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    !item.is_read
                      ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60"
                      : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      {getNotificationIcon(item.type)}
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-sans pl-5 line-clamp-2">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer Link to Full Notifications Page */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>See all notifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
