"use client";

import React, { useState } from "react";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { CloudinaryUploadResult } from "@/lib/cloudinary/uploadImage";

/**
 * Structural example component showing how ImageUploader integrates
 * into the Temple Post Creation Form for verified temple admins.
 */
export function TemplePostCreationForm({ templeId }: { templeId: string }) {
  const [uploadedPhoto, setUploadedPhoto] = useState<CloudinaryUploadResult | null>(null);
  const [caption, setCaption] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uploadedPhoto) {
      alert("Please upload a photo for your temple post.");
      return;
    }

    const payload = {
      temple_id: templeId,
      image_url: uploadedPhoto.url,
      cloudinary_public_id: uploadedPhoto.publicId,
      caption: caption.trim() || null,
    };

    console.log("Submitting new temple post:", payload);
    // Call server action / API endpoint...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temple Post Image Upload */}
      <ImageUploader
        folder="temple-posts"
        maxImages={1}
        label="Post Photo *"
        helperText="Upload high-resolution festival or temple daily event photos."
        onUploadComplete={(results) => {
          if (results.length > 0) {
            setUploadedPhoto(results[0]);
          } else {
            setUploadedPhoto(null);
          }
        }}
      />

      {/* Caption Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Caption (Optional, max 500 chars)
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Share news, puja preparation updates, or festival highlights..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={!uploadedPhoto}
        className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white shadow-glow hover:bg-primary-500 transition-all disabled:opacity-50"
      >
        Publish Temple Post
      </button>
    </form>
  );
}
