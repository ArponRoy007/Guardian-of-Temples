"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Upload, MapPin } from "lucide-react";

const incidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum([
    "temple_vandalism",
    "idol_destruction",
    "arson",
    "physical_assault",
    "land_encroachment",
    "threat_harassment",
    "other",
  ]),
  district: z.string().min(1, "District is required"),
  location: z.string().min(3, "Location detail is required"),
  description: z.string().min(20, "Please provide a detailed description (min 20 chars)"),
  incidentDate: z.string().min(1, "Incident date is required"),
  sourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

export function IncidentReportForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      category: "temple_vandalism",
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    console.log("Submitting incident report:", data);
    // Future integration with Supabase client to insert into 'incidents' table
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="space-y-1 mb-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Submit Incident Report
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provide accurate details and news links/media for verification by our team.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Incident Title *
        </label>
        <input
          {...register("title")}
          placeholder="e.g. Vandalism at Kalibari Mandir in Cumilla"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category *
          </label>
          <select
            {...register("category")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="temple_vandalism">Temple Vandalism</option>
            <option value="idol_destruction">Idol Destruction</option>
            <option value="arson">Arson / Fire Attack</option>
            <option value="physical_assault">Physical Assault</option>
            <option value="threat_harassment">Threat & Harassment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            District *
          </label>
          <input
            {...register("district")}
            placeholder="e.g. Chittagong, Cumilla, Rangpur"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
          />
          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Detailed Description *
        </label>
        <textarea
          rows={3}
          {...register("description")}
          placeholder="Describe what occurred, estimated time, and any known details..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all"
      >
        <Send className="h-4 w-4" /> Submit Report for Verification
      </button>
    </form>
  );
}
