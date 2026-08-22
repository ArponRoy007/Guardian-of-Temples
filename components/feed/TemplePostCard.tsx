"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FeedPostItem } from "@/lib/queries/getFeedPosts";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { ReactionPicker } from "@/components/feed/ReactionPicker";
import { useAuth } from "@/lib/hooks/useAuth";
import { TakedownReasonModal } from "@/components/moderation/TakedownReasonModal";
import { removeTemplePostAction } from "@/app/moderation/temple-post-actions";
import { deleteOwnTemplePostAction } from "@/app/temple-feed/post-actions";
import {
  Church,
  CheckCircle2,
  MapPin,
  Clock,
  MoreVertical,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

export function TemplePostCard({
  post,
  priority = false,
}: {
  post: FeedPostItem;
  priority?: boolean;
}) {
  const { user, profile, role } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Modals & Status States
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false);
  const [isSelfDeleteModalOpen, setIsSelfDeleteModalOpen] = useState(false);
  const [isDeletingOwnPost, setIsDeletingOwnPost] = useState(false);
  const [isDeletedLocally, setIsDeletedLocally] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Exact Role & Ownership Logic
  const isModeratorOrAdmin = role === "moderator" || role === "admin";
  const isOwnTemplePost =
    profile?.role === "temple_admin" &&
    profile?.linked_temple_id === post.temple_id &&
    user?.id === post.created_by;

  const showOverflowMenu = isModeratorOrAdmin || isOwnTemplePost;

  const templeName = post.temple?.name || "Temple";
  const districtName = post.temple?.districts?.name_en || "";
  const isVerified = post.temple?.is_verified ?? false;
  const timeAgo = formatRelativeTime(post.created_at);

  const captionText = post.caption || "";
  const isLongCaption = captionText.length > 150;
  const displayedCaption =
    isLongCaption && !isExpanded ? `${captionText.slice(0, 150)}...` : captionText;

  // 1. Moderator Takedown Handler (Requires Reason)
  const handleConfirmTakedown = async (reason: string) => {
    const res = await removeTemplePostAction({ postId: post.id, reason });

    if (res?.error) {
      throw new Error(res.error);
    }

    setIsDeletedLocally(true);
    setToastMessage("Post removed by moderator");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 2. Temple Admin Self-Delete Handler (No Reason Required)
  const handleConfirmSelfDelete = async () => {
    setDeleteError(null);
    setIsDeletingOwnPost(true);

    const res = await deleteOwnTemplePostAction({ postId: post.id });

    setIsDeletingOwnPost(false);

    if (res?.error) {
      setDeleteError(res.error);
    } else if (res?.success) {
      setIsSelfDeleteModalOpen(false);
      setIsDeletedLocally(true);
      setToastMessage("Post deleted successfully");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  if (isDeletedLocally) {
    return (
      <div className="rounded-3xl p-4 bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-out-to-top-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>Post deleted ({templeName})</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <article className="relative glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1320] shadow-xl transition-all space-y-3">
        {/* Toast Notification Bar */}
        {toastMessage && (
          <div className="absolute top-2 inset-x-4 z-30 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Card Header */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/temple/${post.temple_id}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:scale-105 transition-transform"
            >
              <Church className="h-5 w-5" />
            </Link>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/temple/${post.temple_id}`}
                  className="font-display font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {templeName}
                </Link>

                {isVerified && (
                  <span
                    title="Verified Temple Committee"
                    className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {districtName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{districtName} District</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </span>

            {/* Role & Ownership Aware Overflow Menu */}
            {showOverflowMenu && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Post options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                    {/* Option A: Moderator Takedown */}
                    {isModeratorOrAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsTakedownModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Post</span>
                      </button>
                    )}

                    {/* Option B: Temple Admin Self-Delete */}
                    {!isModeratorOrAdmin && isOwnTemplePost && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsSelfDeleteModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Post</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Main Post Image & Caption (Semantic figure & figcaption) */}
        <figure className="m-0 space-y-3">
          <div className="relative w-full aspect-square sm:aspect-[4/3] bg-slate-900 overflow-hidden">
            <Image
              src={post.image_url}
              alt={`Community photo from ${templeName}${districtName ? `, ${districtName}` : ""}`}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority={priority}
              placeholder={(post as any).blur_data_url ? "blur" : "empty"}
              blurDataURL={(post as any).blur_data_url || undefined}
              onLoad={() => setImageLoaded(true)}
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {captionText && (
            <figcaption className="px-5 space-y-1">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                {displayedCaption}
                {isLongCaption && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </p>
            </figcaption>
          )}
        </figure>

        {/* 4. Reaction Picker & Summary Row */}
        <div className="px-5 pb-4 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
          <ReactionPicker postId={post.id} initialSummary={post.reactions} />
        </div>
      </article>

      {/* Moderator Takedown Modal (Requires Reason) */}
      {isModeratorOrAdmin && (
        <TakedownReasonModal
          isOpen={isTakedownModalOpen}
          onClose={() => setIsTakedownModalOpen(false)}
          post={{
            id: post.id,
            templeName,
            imageUrl: post.image_url,
            caption: post.caption,
          }}
          onConfirm={handleConfirmTakedown}
        />
      )}

      {/* Temple Admin Self-Delete Dialog Modal (No Reason Needed) */}
      {!isModeratorOrAdmin && isOwnTemplePost && isSelfDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span>Delete Post</span>
              </h3>
              <button
                onClick={() => setIsSelfDeleteModalOpen(false)}
                disabled={isDeletingOwnPost}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete this post for <strong>{templeName}</strong>? This action will remove the photo from the community feed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSelfDeleteModalOpen(false)}
                disabled={isDeletingOwnPost}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSelfDelete}
                disabled={isDeletingOwnPost}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-glow-danger hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {isDeletingOwnPost ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
