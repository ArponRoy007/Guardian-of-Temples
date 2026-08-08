"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { CloudinaryUploadResult } from "@/lib/cloudinary/uploadImage";
import { createTemplePostAction } from "@/app/temple-feed/new-post/actions";
import {
  Church,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MapPin,
  Info,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface TemplePostFormProps {
  templeInfo: {
    id: string;
    name: string;
    districtName?: string;
  };
}

export function TemplePostForm({ templeInfo }: TemplePostFormProps) {
  const router = useRouter();

  const [uploadedImage, setUploadedImage] = useState<CloudinaryUploadResult | null>(null);
  const [caption, setCaption] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setImageError(null);

    if (!uploadedImage?.url || !uploadedImage?.publicId) {
      setImageError("Please upload a photo for your temple feed post.");
      return;
    }

    if (caption.length > 500) {
      setSubmitError("Caption exceeds maximum length of 500 characters.");
      return;
    }

    setIsSubmitting(true);

    const res = await createTemplePostAction({
      imageUrl: uploadedImage.url,
      cloudinaryPublicId: uploadedImage.publicId,
      caption: caption.trim() || null,
    });

    setIsSubmitting(false);

    if (res?.error) {
      setSubmitError(res.error);
    } else if (res?.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto border border-emerald-500/30 bg-emerald-500/5 shadow-2xl animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Published Live
          </span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            Your Post is Now Live!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your post for <strong>{templeInfo.name}</strong> has been published to the Temple Feed. Redirecting to home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl"
    >
      {/* Temple Admin Affiliation Header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
          <Church className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Verified Admin Affiliation
          </span>
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Posting as: {templeInfo.name}</span>
          </h2>
          {templeInfo.districtName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
              <span>{templeInfo.districtName} District</span>
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/60 p-4 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 1. Photo Upload Field */}
      <div className="space-y-2">
        {imageError && (
          <p className="text-xs text-red-500 font-semibold">{imageError}</p>
        )}
        <ImageUploader
          folder="temple-posts"
          maxImages={1}
          label="Upload Temple Photo *"
          helperText="Upload a clear, high-quality photo of your temple, puja preparation, or festival celebration."
          onUploadComplete={(results) => {
            if (results.length > 0) {
              setUploadedImage(results[0]);
              setImageError(null);
            } else {
              setUploadedImage(null);
            }
          }}
        />
      </div>

      {/* 2. Caption Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Caption / Update Description (Optional)
          </label>
          <span
            className={`text-[11px] font-mono ${
              caption.length > 500 ? "text-red-500 font-bold" : "text-slate-400"
            }`}
          >
            {caption.length} / 500
          </span>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Share what's happening at your temple today (puja preparations, festival updates, daily news)..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* 3. Moderation Notice Banner */}
      <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <Info className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
        <span>
          Posts are published live immediately to your temple feed. Community volunteer moderators monitor content to ensure safety guidelines are maintained.
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !uploadedImage}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-glow hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Publishing to Temple Feed...</span>
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            <span>Post to Temple Feed</span>
          </>
        )}
      </button>
    </form>
  );
}
