"use client";

import React, { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

export interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = "Enlarged document preview", onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls Header */}
        <div className="w-full flex items-center justify-between p-3 bg-slate-900/90 text-white rounded-t-2xl border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-300 truncate max-w-md">
            {alt}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Original</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative w-full bg-black/50 rounded-b-2xl overflow-hidden flex items-center justify-center p-2 min-h-[300px] max-h-[80vh]">
          <img
            src={src}
            alt={alt}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
