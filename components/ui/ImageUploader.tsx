"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { uploadImage, UploadFolder, CloudinaryUploadResult } from "@/lib/cloudinary/uploadImage";

export interface UploadedFileState {
  id: string;
  file?: File;
  previewUrl: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg?: string;
  result?: CloudinaryUploadResult;
}

export interface ImageUploaderProps {
  folder: UploadFolder;
  maxImages?: number;
  onUploadComplete?: (results: CloudinaryUploadResult[]) => void;
  onFilesChange?: (results: CloudinaryUploadResult[]) => void;
  initialImages?: CloudinaryUploadResult[];
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ImageUploader({
  folder,
  maxImages = 1,
  onUploadComplete,
  onFilesChange,
  initialImages = [],
  disabled = false,
  label,
  helperText,
}: ImageUploaderProps) {
  const [items, setItems] = useState<UploadedFileState[]>(() =>
    initialImages.map((img, i) => ({
      id: `initial-${i}`,
      previewUrl: img.url,
      progress: 100,
      status: "success",
      result: img,
    }))
  );
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyChange = useCallback(
    (updatedItems: UploadedFileState[]) => {
      const successfulResults = updatedItems
        .filter((item) => item.status === "success" && item.result)
        .map((item) => item.result!);

      onUploadComplete?.(successfulResults);
      onFilesChange?.(successfulResults);
    },
    [onUploadComplete, onFilesChange]
  );

  const processFile = async (file: File) => {
    setValidationError(null);

    // 1. Client-side Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError(`Invalid format for ${file.name}. Only JPG, PNG, and WEBP allowed.`);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(
        `File ${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Limit is 5MB.`
      );
      return;
    }

    const newItemId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const previewUrl = URL.createObjectURL(file);

    const newItem: UploadedFileState = {
      id: newItemId,
      file,
      previewUrl,
      progress: 0,
      status: "uploading",
    };

    setItems((prev) => {
      // If maxImages is 1, replace previous image
      const nextItems = maxImages === 1 ? [newItem] : [...prev, newItem];
      return nextItems;
    });

    // 2. Perform Upload using Utility
    try {
      const result = await uploadImage({
        file,
        folder,
        onProgress: (percent) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === newItemId ? { ...item, progress: percent } : item
            )
          );
        },
      });

      setItems((prev) => {
        const nextItems = prev.map((item) =>
          item.id === newItemId
            ? { ...item, status: "success" as const, progress: 100, result }
            : item
        );
        notifyChange(nextItems);
        return nextItems;
      });
    } catch (err: any) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === newItemId
            ? { ...item, status: "error" as const, errorMsg: err.message || "Upload failed." }
            : item
        )
      );
    }
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    if (disabled) return;
    const fileArray = Array.from(files);

    if (maxImages > 1 && items.length + fileArray.length > maxImages) {
      setValidationError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const filesToUpload = maxImages === 1 ? [fileArray[0]] : fileArray.slice(0, maxImages - items.length);

    for (const f of filesToUpload) {
      if (f) processFile(f);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || !e.dataTransfer.files?.length) return;
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    setItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id);
      notifyChange(nextItems);
      return nextItems;
    });
  };

  const canAddMore = items.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Optional Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {items.length} / {maxImages} {maxImages === 1 ? "image" : "images"}
          </span>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Upload Dropzone & Grid */}
      <div className="space-y-3">
        {/* Thumbnails Display */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-square flex flex-col items-center justify-center"
              >
                <img
                  src={item.previewUrl}
                  alt="Upload thumbnail"
                  className="h-full w-full object-cover"
                />

                {/* Uploading Overlay */}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-white">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-400 mb-1" />
                    <span className="text-[11px] font-semibold">{item.progress}%</span>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-primary-500 h-full transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Overlay */}
                {item.status === "error" && (
                  <div className="absolute inset-0 bg-red-950/85 p-3 flex flex-col items-center justify-center text-center text-white">
                    <AlertCircle className="h-6 w-6 text-red-400 mb-1" />
                    <span className="text-[10px] text-red-200 leading-tight">
                      {item.errorMsg || "Upload Failed"}
                    </span>
                    <button
                      type="button"
                      onClick={() => item.file && processFile(item.file)}
                      className="mt-2 text-[10px] underline font-semibold flex items-center gap-1 hover:text-red-300"
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  </div>
                )}

                {/* Success Badge */}
                {item.status === "success" && (
                  <div className="absolute top-2 left-2 rounded-full bg-emerald-500 text-white p-1 shadow-md">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Remove Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 rounded-full bg-slate-900/80 text-white p-1 hover:bg-red-600 transition-colors shadow-md"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dropzone Trigger */}
        {canAddMore && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              disabled
                ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30"
                : dragActive
                ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:bg-primary-500/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple={maxImages > 1}
              disabled={disabled}
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
              className="hidden"
            />

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-xs text-primary-500 mb-2">
              <Upload className="h-5 w-5" />
            </div>

            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {dragActive ? "Drop images here..." : "Click or drag images to upload"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              JPG, PNG, WEBP (Max 5MB per file)
            </p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}