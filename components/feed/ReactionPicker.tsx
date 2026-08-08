"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ReactionType, PostReactionSummary } from "@/lib/queries/getPostReactions";
import { toggleReactionAction } from "@/app/temple-feed/reaction-actions";
import { ReactionSummary } from "@/components/feed/ReactionSummary";
import { AlertCircle, Smile } from "lucide-react";

export interface ReactionPickerProps {
  postId: string;
  initialSummary?: PostReactionSummary;
  onReactionChange?: (newSummary: PostReactionSummary) => void;
}

const REACTION_OPTIONS: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
  activeClass: string;
}> = [
  {
    type: "pray",
    emoji: "🙏",
    label: "Pray",
    activeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    type: "love",
    emoji: "❤️",
    label: "Love",
    activeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  {
    type: "flower",
    emoji: "🌺",
    label: "Flower",
    activeClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
  },
];

export function ReactionPicker({
  postId,
  initialSummary = {
    userReaction: null,
    counts: { pray: 0, love: 0, flower: 0, total: 0 },
  },
  onReactionChange,
}: ReactionPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [summary, setSummary] = useState<PostReactionSummary>(initialSummary);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on tap outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectReaction = async (targetType: ReactionType) => {
    setIsOpen(false);

    // 1. Guest Check: Redirect unauthenticated user to login
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (isPending) return;

    setErrorMsg(null);
    const previousSummary = { ...summary, counts: { ...summary.counts } };

    // 2. Compute Optimistic Local State Update
    let newReaction: ReactionType | null = null;
    const newCounts = { ...summary.counts };

    if (summary.userReaction === targetType) {
      // Toggle off
      newReaction = null;
      newCounts[targetType] = Math.max(0, newCounts[targetType] - 1);
      newCounts.total = Math.max(0, newCounts.total - 1);
    } else {
      if (summary.userReaction) {
        // Change existing reaction
        newCounts[summary.userReaction] = Math.max(0, newCounts[summary.userReaction] - 1);
      } else {
        // New reaction
        newCounts.total++;
      }
      newReaction = targetType;
      newCounts[targetType]++;
    }

    const optimisticSummary: PostReactionSummary = {
      userReaction: newReaction,
      counts: newCounts,
    };

    // Instant UI feedback
    setSummary(optimisticSummary);
    onReactionChange?.(optimisticSummary);
    setIsPending(true);

    // 3. Call Server Action
    const res = await toggleReactionAction({ postId, reactionType: targetType });

    setIsPending(false);

    if (res?.error) {
      // Rollback optimistic state on server failure
      setSummary(previousSummary);
      onReactionChange?.(previousSummary);
      setErrorMsg("Couldn't save your reaction. Please try again.");
    } else if (res?.success && res.counts) {
      // Reconcile with exact server counts
      const finalSummary: PostReactionSummary = {
        userReaction: res.userReaction ?? null,
        counts: res.counts,
      };
      setSummary(finalSummary);
      onReactionChange?.(finalSummary);
    }
  };

  const currentOption = REACTION_OPTIONS.find((o) => o.type === summary.userReaction);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-3">
      {/* Toast Error Alert Banner */}
      {errorMsg && (
        <div className="absolute -top-10 left-0 z-50 rounded-xl bg-red-600 text-white px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-lg animate-in fade-in">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Expanded Reactions Popover Row */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-950 p-1.5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-90 fade-in duration-150">
          {REACTION_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              disabled={isPending}
              onClick={() => handleSelectReaction(opt.type)}
              className="group flex flex-col items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-125 active:scale-95 cursor-pointer"
              title={opt.label}
            >
              <span className="text-xl leading-none">{opt.emoji}</span>
              <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all active:scale-95 ${
          currentOption
            ? currentOption.activeClass
            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        {currentOption ? (
          <>
            <span className="text-sm">{currentOption.emoji}</span>
            <span>{currentOption.label}</span>
          </>
        ) : (
          <>
            <Smile className="h-4 w-4 text-slate-400" />
            <span>React</span>
          </>
        )}
      </button>

      {/* Aggregate Reaction Summary Display */}
      <ReactionSummary counts={summary.counts} />
    </div>
  );
}
