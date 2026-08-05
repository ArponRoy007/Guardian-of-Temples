"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createHelplineAction, deleteHelplineAction } from "@/app/admin/actions";
import { PhoneCall, Plus, Trash2, X, Loader2, Shield } from "lucide-react";

interface HelplineRecord {
  id: string;
  name: string;
  phone_number: string;
  category: "police" | "human_rights_org" | "minority_affairs" | "emergency_other";
  district_id?: number | null;
  district?: { name_en: string } | null;
}

export default function AdminHelplinesPage() {
  const [helplines, setHelplines] = useState<HelplineRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState<
    "police" | "human_rights_org" | "minority_affairs" | "emergency_other"
  >("police");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const supabase = createClient();

  const loadHelplines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("helpline_contacts")
        .select("id, name, phone_number, category, district_id, district:districts(name_en)")
        .order("name");

      if (error) {
        console.error("Error loading helplines:", error.message);
      } else if (data) {
        setHelplines(data as unknown as HelplineRecord[]);
      }
    } catch (err) {
      console.error("Failed to query helplines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelplines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setFormError("Name and phone number are required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const res = await createHelplineAction({
      name,
      phoneNumber,
      category,
    });

    setSubmitting(false);
    if (res?.error) {
      setFormError(res.error);
    } else {
      setIsModalOpen(false);
      setName("");
      setPhoneNumber("");
      loadHelplines();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this helpline contact?")) return;
    const res = await deleteHelplineAction(id);
    if (res?.success) {
      loadHelplines();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-emerald-500" />
            Emergency Helplines & Crisis Contacts Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maintain national and district-level hotlines for police, legal aid, and minority affairs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-emerald-500 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Emergency Hotline
        </button>
      </div>

      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading helpline contacts...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {helplines.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    {item.category.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.name}
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-primary-600 dark:text-primary-400">
                  {item.phone_number}
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.district?.name_en || "National Hotline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Helpline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Add Emergency Hotline
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Helpline Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bangladesh Police Emergency"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 999 or 16108"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="police">Police Emergency</option>
                  <option value="human_rights_org">Human Rights Org</option>
                  <option value="minority_affairs">Minority Affairs</option>
                  <option value="emergency_other">Other Emergency</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Hotline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
