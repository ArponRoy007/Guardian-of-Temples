"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createTempleAction, deleteTempleAction, updateTempleAction } from "@/app/admin/actions";
import { UnverifiedBadge } from "@/components/ui/UnverifiedBadge";
import { Church, Plus, Search, CheckCircle2, Trash2, Edit3, X, Loader2, AlertCircle, Filter } from "lucide-react";

interface TempleRecord {
  id: string;
  name: string;
  district_id: number;
  district?: { name_en: string } | null;
  address_text?: string | null;
  source: string;
  is_verified: boolean;
}

interface DistrictOption {
  id: number;
  name_en: string;
}

export default function AdminTemplesPage() {
  const [temples, setTemples] = useState<TempleRecord[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTemple, setEditingTemple] = useState<TempleRecord | null>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [districtId, setDistrictId] = useState<number>(1);
  const [addressText, setAddressText] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const supabase = createClient();

  const loadTemples = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("temples")
        .select("id, name, district_id, address_text, source, is_verified, district:districts(name_en)")
        .order("name", { ascending: true })
        .limit(200);

      if (error) {
        console.error("Error loading temples:", error.message);
      } else if (data) {
        setTemples(data as unknown as TempleRecord[]);
      }
    } catch (err) {
      console.error("Failed to query temples:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemples();
    async function loadDistricts() {
      const { data } = await supabase.from("districts").select("id, name_en").order("name_en");
      if (data) setDistricts(data);
    }
    loadDistricts();
  }, []);

  const handleToggleVerification = async (t: TempleRecord) => {
    const res = await updateTempleAction(t.id, {
      isVerified: !t.is_verified,
    });
    if (res?.success) {
      loadTemples();
    }
  };

  const handleOpenAddModal = () => {
    setEditingTemple(null);
    setName("");
    setDistrictId(districts[0]?.id || 1);
    setAddressText("");
    setIsVerified(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: TempleRecord) => {
    setEditingTemple(t);
    setName(t.name);
    setDistrictId(t.district_id);
    setAddressText(t.address_text || "");
    setIsVerified(t.is_verified);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Temple name is required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    let res;
    if (editingTemple) {
      res = await updateTempleAction(editingTemple.id, {
        name,
        districtId,
        addressText,
        isVerified,
      });
    } else {
      res = await createTempleAction({
        name,
        districtId,
        addressText,
        isVerified,
      });
    }

    setSubmitting(false);
    if (res?.error) {
      setFormError(res.error);
    } else {
      setIsModalOpen(false);
      loadTemples();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this temple record?")) return;
    const res = await deleteTempleAction(id);
    if (res?.success) {
      loadTemples();
    }
  };

  const unverifiedCount = temples.filter((t) => !t.is_verified).length;

  const filteredTemples = temples.filter((t) => {
    if (filter === "verified" && !t.is_verified) return false;
    if (filter === "unverified" && t.is_verified) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.district?.name_en || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Church className="h-5 w-5 text-amber-500" />
            Temple Database Manager & Verification Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review organic user-reported temples and manage official Puja Udjapan Parishad 2025 records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search temples..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Temple
          </button>
        </div>
      </div>

      {/* Filter Tabs & Unverified Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            All Temples ({temples.length})
          </button>

          <button
            onClick={() => setFilter("verified")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "verified"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Verified Only
          </button>

          <button
            onClick={() => setFilter("unverified")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors relative ${
              filter === "unverified"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
            }`}
          >
            Unverified / User Reported ({unverifiedCount})
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl glass-card p-12 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading temple directory...</p>
        </div>
      )}

      {!loading && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Temple Name</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Verification Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTemples.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {t.district?.name_en || `District #${t.district_id}`}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400 uppercase">
                      {t.source || "puja_udjapan_parishad_2025"}
                    </td>
                    <td className="px-4 py-3">
                      {t.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <UnverifiedBadge />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVerification(t)}
                        className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500"
                      >
                        {t.is_verified ? "Mark Unverified" : "Approve Verification"}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Temple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {editingTemple ? "Edit Temple Entry" : "Add Official Temple Entry"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Temple Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sri Sri Kalibari Temple"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  District *
                </label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address / Location Detail
                </label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Town Hall Road, Ward 4"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Mark as Verified Temple Entry</span>
              </label>

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
                  className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Temple
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
