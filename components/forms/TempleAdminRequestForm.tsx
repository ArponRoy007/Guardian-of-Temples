"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { CloudinaryUploadResult } from "@/lib/cloudinary/uploadImage";
import { submitTempleAdminRequestAction } from "@/app/become-temple-admin/actions";
import {
  Church,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Phone,
  FileImage,
} from "lucide-react";

// Bangladeshi phone regex: +8801XXXXXXXXX or 01XXXXXXXXX
const BD_PHONE_REGEX = /^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/;

const clientSchema = z
  .object({
    templeId: z.string().optional(),
    isUnlistedTemple: z.boolean().default(false),
    newTempleName: z.string().optional(),
    newTempleDistrictId: z.number().optional(),
    newTempleAddress: z.string().optional(),
    applicantFullName: z
      .string()
      .min(2, "আপনার পূর্ণ নাম প্রদান করুন (At least 2 characters)")
      .max(100, "নাম ১০০ অক্ষরের বেশি হতে পারবে না"),
    applicantPhone: z
      .string()
      .regex(
        BD_PHONE_REGEX,
        "সঠিক হোয়াটসঅ্যাপ ফোন নম্বর দিন (যেমন: 01700000000)"
      ),
    applicantRoleAtTemple: z
      .string()
      .min(2, "মন্দিরে আপনার পদবি লিখুন (যেমন: সাধারণ সম্পাদক, সভাপতি)")
      .max(100, "পদবি ১০০ অক্ষরের বেশি হতে পারবেবিধা"),
  })
  .refine(
    (data) => {
      if (data.isUnlistedTemple) {
        return (
          data.newTempleName &&
          data.newTempleName.trim().length >= 3 &&
          data.newTempleDistrictId &&
          data.newTempleDistrictId > 0
        );
      }
      return !!data.templeId;
    },
    {
      message:
        "অনুগ্রহ করে তালিকা থেকে মন্দির সিলেক্ট করুন অথবা 'তালিকাভুক্ত নয়' নির্বাচন করুন।",
      path: ["templeId"],
    }
  );

type ClientFormData = z.infer<typeof clientSchema>;

interface DistrictOption {
  id: number;
  name_en: string;
  name_bn: string;
}

interface TempleOption {
  id: string;
  name: string;
  district_id: number;
  districts?: {
    name_en: string;
    name_bn: string;
  } | null;
}

export function TempleAdminRequestForm() {
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [templeSearch, setTempleSearch] = useState("");
  const [templeOptions, setTempleOptions] = useState<TempleOption[]>([]);
  const [selectedTemple, setSelectedTemple] = useState<TempleOption | null>(
    null
  );
  const [isUnlisted, setIsUnlisted] = useState(false);
  const [templeDropdownOpen, setTempleDropdownOpen] = useState(false);

  // 3-Slot Image Evidence State
  const [nidFront, setNidFront] = useState<CloudinaryUploadResult | null>(null);
  const [nidBack, setNidBack] = useState<CloudinaryUploadResult | null>(null);
  const [committeeDoc, setCommitteeDoc] =
    useState<CloudinaryUploadResult | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  // Submission feedback state
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null
  );

  const debouncedTempleQuery = useDebounce(templeSearch, 300);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      isUnlistedTemple: false,
    },
  });

  // Load 64 Districts
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

  // Search Temples
  useEffect(() => {
    async function searchTemples() {
      if (!debouncedTempleQuery.trim() || isUnlisted) {
        setTempleOptions([]);
        setTempleDropdownOpen(false);
        return;
      }

      const { data } = await supabase
        .from("temples")
        .select("id, name, district_id, districts(name_en, name_bn)")
        .ilike("name", `%${debouncedTempleQuery.trim()}%`)
        .limit(5);

      if (data) {
        setTempleOptions(data as any[]);
        setTempleDropdownOpen(data.length > 0);
      }
    }
    searchTemples();
  }, [debouncedTempleQuery, isUnlisted]);

  // Form Submit Handler
  const onSubmit = async (data: ClientFormData) => {
    setSubmitError(null);
    setEvidenceError(null);

    // Validate that all 3 photos are provided
    if (!nidFront?.url || !nidBack?.url || !committeeDoc?.url) {
      setEvidenceError(
        "যাচাইকরণের জন্য এনআইডির উভয় পাশ এবং কমিটির তালিকার ৩টি ছবিই আপলোড করা আবশ্যক। (All 3 photos are required)"
      );
      return;
    }

    // Pack all 3 image URLs into JSON structure
    const allEvidenceUrls = JSON.stringify({
      nid_front: nidFront.url,
      nid_back: nidBack.url,
      committee_doc: committeeDoc.url,
    });

    const payload = {
      templeId: isUnlisted ? null : selectedTemple?.id || null,
      isUnlistedTemple: isUnlisted,
      newTempleName: isUnlisted ? data.newTempleName : null,
      newTempleDistrictId: isUnlisted ? data.newTempleDistrictId : null,
      newTempleAddress: isUnlisted ? data.newTempleAddress : null,
      applicantFullName: data.applicantFullName,
      applicantPhone: data.applicantPhone,
      applicantRoleAtTemple: data.applicantRoleAtTemple,
      supportingEvidenceUrl: allEvidenceUrls,
    };

    const res = await submitTempleAdminRequestAction(payload);

    if (res?.error) {
      setSubmitError(res.error);
    } else if (res?.success && res.requestId) {
      setSubmittedRequestId(res.requestId);
    }
  };

  // Render Confirmation Screen on Success
  if (submittedRequestId) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            আবেদন জমা হয়েছে (Request Submitted)
          </span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            ধন্যবাদ! আপনার তথ্য সংরক্ষিত হয়েছে।
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            আপনার ট্র্যাকিং আইডি (Tracking ID):{" "}
            <code className="text-primary-500 font-mono font-bold">
              #{submittedRequestId.split("-")[0].toUpperCase()}
            </code>
            । আমাদের অ্যাডমিন টিম আপনার জাতীয় পরিচয়পত্র এবং মন্দির কমিটির তথ্য
            যাচাই করে দ্রুত হোয়াটসঅ্যাপে যোগাযোগ করবেন।
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-xs font-semibold text-white shadow-glow hover:bg-primary-500 transition-all"
          >
            <span>হোমপেজে ফিরে যান (Return Home)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl"
    >
      <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary-500" />
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            মন্দির অ্যাডমিন এক্সেস আবেদন (Apply for Temple Admin)
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          যাচাইকৃত অ্যাডমিনগণ তাদের মন্দিরের ছবি, পূজার আপডেট এবং ঘোষণা পোস্ট
          করতে পারবেন।
        </p>
      </div>

      {submitError && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/60 p-4 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 1. Temple Selection */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          ১. মন্দির নির্বাচন করুন (Select Temple)
        </h3>

        {!isUnlisted ? (
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              বিদ্যমান মন্দির খুঁজুন (Search Existing Temple) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={templeSearch}
                onChange={(e) => {
                  setTempleSearch(e.target.value);
                  setSelectedTemple(null);
                  setValue("templeId", undefined);
                }}
                placeholder="মন্দিরের নাম লিখুন (যেমন: ঢাকেশ্বরী, কালীবাড়ি...)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
              />

              {templeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl max-h-52 overflow-y-auto">
                  {templeOptions.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTemple(t);
                        const displayName = `${t.name} — ${
                          t.districts?.name_en || ""
                        }`;
                        setTempleSearch(displayName);
                        setValue("templeId", t.id);
                        setTempleDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Church className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-semibold">{t.name}</span>
                      {t.districts && (
                        <span className="text-[11px] text-slate-400">
                          — {t.districts.name_en} ({t.districts.name_bn})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errors.templeId && !isUnlisted && (
              <p className="text-xs text-red-500 mt-1">
                {errors.templeId.message}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                নতুন মন্দিরের পূর্ণ নাম (New Temple Name) *
              </label>
              <input
                type="text"
                {...register("newTempleName")}
                placeholder="মন্দির বা পূজা কমিটির অফিসিয়াল নাম"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                জেলা (District / Zilla) *
              </label>
              <select
                {...register("newTempleDistrictId", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- জেলা নির্বাচন করুন --</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_en} ({d.name_bn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                পূর্ণ ঠিকানা / বিস্তারিত অবস্থান (Full Address)
              </label>
              <input
                type="text"
                {...register("newTempleAddress")}
                placeholder="উপজেলা, গ্রাম/এলাকা, রাস্তার ঠিকানা..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isUnlisted}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsUnlisted(checked);
              setValue("isUnlistedTemple", checked);
              if (checked) {
                setSelectedTemple(null);
                setTempleSearch("");
                setValue("templeId", undefined);
              }
            }}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span>আমার মন্দিরটি তালিকায় নেই (নতুন মন্দির প্রস্তাব করুন)</span>
        </label>
      </div>

      {/* 2. Applicant Information */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          ২. আবেদনকারীর তথ্য (Applicant Information)
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            আপনার পূর্ণ নাম (Full Legal Name) *
          </label>
          <input
            type="text"
            {...register("applicantFullName")}
            placeholder="এনআইডি অনুযায়ী পূর্ণ নাম লিখুন"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          {errors.applicantFullName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.applicantFullName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              <span>ফোন নম্বর (WhatsApp Active Number) *</span>
            </label>
            <input
              type="text"
              {...register("applicantPhone")}
              placeholder="01700000000"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              * তথ্য যাচাইয়ের জন্য এই নম্বরে সরাসরি হোয়াটসঅ্যাপ মেসেজ পাঠানো
              হবে।
            </p>
            {errors.applicantPhone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.applicantPhone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              মন্দিরে আপনার পদবি / দায়িত্ব (Role at Temple) *
            </label>
            <input
              type="text"
              {...register("applicantRoleAtTemple")}
              placeholder="যেমন: সাধারণ সম্পাদক, সভাপতি, কোষাধ্যক্ষ"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
            {errors.applicantRoleAtTemple && (
              <p className="text-xs text-red-500 mt-1">
                {errors.applicantRoleAtTemple.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Proof Documents (3 Slots) */}
      <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileImage className="h-4 w-4 text-primary-500" />
            <span>৩. প্রমাণপত্র এবং ছবি (Proof & Verification Photos)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            যাচাইকরণের সুবিধার্থে নিচে ৩টি পরিষ্কার ছবি তুলুন বা আপলোড করুন।
          </p>
        </div>

        {evidenceError && (
          <p className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
            {evidenceError}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Slot 1: NID Front */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <ImageUploader
              folder="temple-admin-requests"
              maxImages={1}
              label="১. জাতীয় পরিচয়পত্র - সামনের অংশ (NID Front) *"
              helperText="আপনার NID কার্ডের সামনের স্পষ্ট ছবি দিন।"
              onUploadComplete={(results) => {
                setNidFront(results.length > 0 ? results[0] : null);
              }}
            />
          </div>

          {/* Slot 2: NID Back */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <ImageUploader
              folder="temple-admin-requests"
              maxImages={1}
              label="২. জাতীয় পরিচয়পত্র - পেছনের অংশ (NID Back) *"
              helperText="আপনার NID কার্ডের পেছনের অংশের ছবি দিন।"
              onUploadComplete={(results) => {
                setNidBack(results.length > 0 ? results[0] : null);
              }}
            />
          </div>

          {/* Slot 3: Committee List */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <ImageUploader
              folder="temple-admin-requests"
              maxImages={1}
              label="৩. মন্দির কমিটির তালিকা (Committee List) *"
              helperText="কমিটির নামযুক্ত তালিকা বা প্রত্যয়নপত্রের ছবি দিন।"
              onUploadComplete={(results) => {
                setCommitteeDoc(results.length > 0 ? results[0] : null);
              }}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>যাচাইকরণ আবেদন জমা হচ্ছে...</span>
          </>
        ) : (
          <>
            <UserCheck className="h-4 w-4" />
            <span>আবেদন জমা দিন (Submit Verification Request)</span>
          </>
        )}
      </button>
    </form>
  );
}
