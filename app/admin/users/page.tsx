"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateUserRoleAction } from "@/app/admin/actions";
import { Users, Search, ShieldCheck, User, Calendar, Loader2 } from "lucide-react";

interface UserProfileRecord {
  id: string;
  full_name: string;
  phone?: string;
  role: "user" | "moderator" | "admin";
  created_at: string;
  submission_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfileRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const supabase = createClient();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading users:", error.message);
      } else if (profiles) {
        const usersWithCounts = await Promise.all(
          profiles.map(async (p) => {
            const { count } = await supabase
              .from("incidents")
              .select("*", { count: "exact", head: true })
              .eq("submitted_by", p.id);

            return {
              ...p,
              submission_count: count || 0,
            };
          })
        );
        setUsers(usersWithCounts);
      }
    } catch (err) {
      console.error("Failed to query users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "moderator" ? "user" : "moderator";
    const res = await updateUserRoleAction(userId, nextRole);
    if (res?.success) {
      loadUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.full_name || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Registered User Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View registered user profiles, submission counts, and role privileges.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading user directory...</p>
        </div>
      )}

      {!loading && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Reports Submitted</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3 text-right">Role Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {u.full_name || "User Profile"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                            : u.role === "moderator"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{u.submission_count} report(s)</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 transition-colors"
                        >
                          {u.role === "moderator" ? "Demote to User" : "Make Moderator"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
