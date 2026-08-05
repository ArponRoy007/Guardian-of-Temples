"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { submitIncidentAction } from "@/app/submit-incident/actions";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  ShieldAlert,
  Church,
  MapPin,
  Calendar,
  Flame,
  AlertTriangle,
  Home,
  UserX,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  HelpCircle,
  PhoneCall,
  ArrowRight,
} from "lucide-react";

// Client Zod Validation Schema
const clientSubmissionSchema = z.object({
  districtId: z.number({ required_error: "Please select a district" }).min(1, "District is required"),
  isUnlistedTemple: z.boolean().default(false),
  templeId: z.string().optional(),
  templeNameRaw: z.string().optional(),
  incidentDate: z.string().min(1, "Incident date & time is required"),
  incidentType: z.enum([
    "idol_vandalism",
    "arson",
    "assault",
    "property_damage",
    "threats",
    "other",
  ]),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  submitterContact: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSubmissionSchema>;

interface DistrictOption {
  id: number;
  name_en: string;
  name_bn: string;
}

interface TempleOption {
  id: string;
  name: string;
  district_id: number;
}

export function IncidentSubmissionForm() {
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [templeSearch, setTempleSearch] = useState("");
  const [templeOptions, setTempleOptions] = useState<TempleOption[]>([]);
  const [selectedTemple, setSelectedTemple] = useState<TempleOption | null>(null);
  const [isUnlisted, setIsUnlisted] = useState(false);
  const [templeDropdownOpen, setTempleDropdownOpen] = useState(false);

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Status & Feedback State
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedIncidentId, setSubmittedIncidentId] = useState<string | null>(null);

  const debouncedTempleQuery = useDebounce(templeSearch, 300);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSubmissionSchema),
    defaultValues: {
      isUnlistedTemple: false,
      incidentType: "idol_vandalism",
      incidentDate: new Date().toISOString().slice(0, 16), // current datetime-local
    },
  });

  const descriptionValue = watch("description") || "";
  const currentIncidentType = watch("incidentType");

  // Fetch 64 Districts for Select Dropdown
  useEffect(() => {
    async function loadDistricts() {
      const { data } = await supabase
        .from("districts")
        .select("id, name_en, name_bn")
        .order("name_en", { ascending: true });

      if (data) {
        setDistricts(data);
      }
    }
    loadDistricts();
  }, []);

  // Debounced Temple Autocomplete Query
  useEffect(() => {
    async function searchTemples() {
      if (!debouncedTempleQuery.trim() || isUnlisted) {
        setTempleOptions([]);
        setTempleDropdownOpen(false);
        return;
      }

      const { data } = await supabase
        .from("temples")
        .select("id, name, district_id")
        .ilike("name", `%${debouncedTempleQuery.trim()}%`)
        .limit(5);

      if (data) {
        setTempleOptions(data);
        setTempleDropdownOpen(data.length > 0);
      }
    }
    searchTemples();
  }, [debouncedTempleQuery, isUnlisted]);

  // Image Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      setFileError("Maximum 3 evidence photos allowed");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setFileError(`Invalid file format: ${file.name}. Only JPG, PNG, WEBP allowed.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`File exceeds 5MB limit: ${file.name}`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload Files to Supabase Storage Bucket
  const uploadPhotosToStorage = async (): Promise<string[]> => {
    if (!selectedFiles.length) return [];
    setUploadingImages(true);

    const uploadedUrls: string[] = [];
    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id || "anon"}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("incident-evidence")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError.message);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("incident-evidence").getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    setUploadingImages(false);
    return uploadedUrls;
  };

  // Form Submit Handler
  const onSubmit = async (data: ClientFormData) => {
    setSubmitError(null);

    // Upload evidence photos if any
    const evidenceUrls = await uploadPhotosToStorage();

    const serverPayload = {
      districtId: Number(data.districtId),
      templeId: isUnlisted ? null : selectedTemple?.id || null,
      templeNameRaw: isUnlisted ? templeSearch : selectedTemple ? selectedTemple.name : templeSearch,
      incidentDate: data.incidentDate,
      incidentType: data.incidentType,
      description: data.description,
      evidenceUrls,
      submitterContact: data.submitterContact || undefined,
    };

    const res = await submitIncidentAction(serverPayload);

    if (res?.error) {
      setSubmitError(res.error);
    } else if (res?.success && res.incidentId) {
      setSubmittedIncidentId(res.incidentId);
    }
  };

  // Incident Type Selection Cards Config
  const incidentTypes = [
    { id: "idol_vandalism", label: "Idol Vandalism", icon: Flame, color: "text-red-500" },
    { id: "arson", label: "Arson / Fire Attack", icon: Flame, color: "text-orange-500" },
    { id: "assault", label: "Physical Assault", icon: UserX, color: "text-red-600" },
    { id: "property_damage", label: "Property Damage", icon: Home, color: "text-amber-500" },
    { id: "threats", label: "Threats & Extortion", icon: AlertTriangle, color: "text-yellow-500" },
    { id: "other", label: "Other Incident", icon: HelpCircle, color: "text-slate-400" },
  ];

  // Render Success Screen upon submission
  if (submittedIncidentId) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Report Submitted Successfully
          </span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            Thank You for Your Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your incident report has been registered under ID:{" "}
            <code className="text-primary-500 font-mono font-bold">{submittedIncidentId}</code>. Our volunteer moderators will review and cross-reference your submission before verifying it on the live map.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/my-submissions"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
          >
            <span>Track My Submissions</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary-500" />
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Submit Incident Report
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Document violence, vandalism, or threats against temples to assist community safety and legal authorities.
        </p>
      </div>

      {submitError && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/60 p-4 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 1. District Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          District (Zilla) *
        </label>
        <div className="relative">
          <select
            {...register("districtId", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select Bangladesh District --</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_en} ({d.name_bn})
              </option>
            ))}
          </select>
        </div>
        {errors.districtId && (
          <p className="text-xs text-red-500 mt-1">{errors.districtId.message}</p>
        )}
      </div>

      {/* 2. Temple Autocomplete & Unlisted Fallback */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Temple / Mandap Name *
        </label>

        {!isUnlisted ? (
          <div className="relative">
            <input
              type="text"
              value={templeSearch}
              onChange={(e) => {
                setTempleSearch(e.target.value);
                setSelectedTemple(null);
                setValue("templeNameRaw", e.target.value);
              }}
              placeholder="Search temple name (e.g. Kalibari, Radha Govinda...)"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
            />

            {/* Autocomplete Dropdown */}
            {templeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl max-h-48 overflow-y-auto">
                {templeOptions.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTemple(t);
                      setTempleSearch(t.name);
                      setValue("templeId", t.id);
                      setValue("templeNameRaw", t.name);
                      setTempleDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Church className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={templeSearch}
              onChange={(e) => {
                setTempleSearch(e.target.value);
                setValue("templeNameRaw", e.target.value);
              }}
              placeholder="Enter full unlisted temple name & local area"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {/* Checkbox for unlisted temple */}
        <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isUnlisted}
            onChange={(e) => {
              setIsUnlisted(e.target.checked);
              setValue("isUnlistedTemple", e.target.checked);
              if (e.target.checked) {
                setSelectedTemple(null);
                setValue("templeId", undefined);
              }
            }}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span>This temple is not in our official list (enter custom name/address above)</span>
        </label>
      </div>

      {/* 3. Incident Date & Time */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Date & Time of Incident *
        </label>
        <input
          {...register("incidentDate")}
          type="datetime-local"
          max={new Date().toISOString().slice(0, 16)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
        {errors.incidentDate && (
          <p className="text-xs text-red-500 mt-1">{errors.incidentDate.message}</p>
        )}
      </div>

      {/* 4. Incident Type Selection Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Type of Incident *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {incidentTypes.map((t) => {
            const isSelected = currentIncidentType === t.id;
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                onClick={() => setValue("incidentType", t.id as any)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-500/10 text-primary-900 dark:text-white shadow-glow"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${t.color}`} />
                <span className="text-xs font-semibold">{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Detailed Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Detailed Description *
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {descriptionValue.length} / 2000 chars
          </span>
        </div>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe what occurred, estimated time, perpetrators if known, and extent of damage..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* 6. Photo Uploads */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Upload Evidence Photos (Optional, Max 3, 5MB each)
        </label>

        {fileError && <p className="text-xs text-red-500">{fileError}</p>}

        <div className="flex flex-wrap items-center gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
              <img src={url} alt="Evidence thumbnail" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {selectedFiles.length < 3 && (
            <label className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-colors">
              <Upload className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-semibold">Add Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* 7. Submitter Optional Contact Info */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Follow-up Contact Number or Email (Optional — Private for Verifiers Only)
        </label>
        <div className="relative">
          <input
            {...register("submitterContact")}
            type="text"
            placeholder="+880 1700-000000 or contact@email.com"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Submit Action Button */}
      <button
        type="submit"
        disabled={isSubmitting || uploadingImages}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSubmitting || uploadingImages ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Submitting Report & Evidence...</span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-4 w-4" />
            <span>Submit Report for Moderation</span>
          </>
        )}
      </button>
    </form>
  );
}
