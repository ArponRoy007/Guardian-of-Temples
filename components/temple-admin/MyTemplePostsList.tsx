"use client";

import React, { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Clock, Image as ImageIcon, Sparkles } from "lucide-react";

export interface TemplePostItem {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export function MyTemplePostsList({ posts }: { posts: TemplePostItem[] }) {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);

  if (!posts.length) {
    return (
      <div className="glass-card rounded-3xl p-6 text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800">
        You haven't published any posts yet. Upload your first photo above to start your temple feed!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>My Recent Temple Posts ({posts.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {posts.map((post) => {
          const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={post.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 space-y-2 group shadow-sm hover:shadow-md transition-all"
            >
              {/* Thumbnail image with lightbox click */}
              <div
                onClick={() =>
                  setSelectedImage({
                    src: post.image_url,
                    title: post.caption || "Temple Post",
                  })
                }
                className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={post.image_url}
                  alt="Temple post"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 rounded-md bg-emerald-500/90 text-white px-2 py-0.5 text-[9px] font-extrabold shadow-sm">
                  Live
                </div>
              </div>

              {/* Caption preview & timestamp */}
              <div className="p-3 pt-1 space-y-1">
                {post.caption ? (
                  <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
                    {post.caption}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No caption provided</p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <ImageLightbox
          src={selectedImage.src}
          alt={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
