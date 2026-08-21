"use client";

import { useEffect, useState } from "react";
import { X, BellRing, Sparkles } from "lucide-react";
import { generateDailyNotification, DailyNotification } from "@/lib/panjika/notifications";

export default function DailyToast() {
  const [notification, setNotification] = useState<DailyNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Get today's date string (e.g., "2026-08-21")
    const todayStr = new Date().toISOString().split("T")[0];
    
    // 2. Check if we already showed a notification today
    const lastSeen = localStorage.getItem("last_panjika_notification_date");

    if (lastSeen !== todayStr) {
      // If not seen today, generate the message and show it!
      const dailyMsg = generateDailyNotification();
      setNotification(dailyMsg);
      
      // Slight delay for a smooth entrance after page loads
      setTimeout(() => setIsVisible(true), 1000);
      
      // Save today's date so it doesn't show again until tomorrow
      localStorage.setItem("last_panjika_notification_date", todayStr);
    }
  }, []);

  if (!isVisible || !notification) return null;

  // Determine colors based on notification type
  const isFestival = notification.type === "festival";
  const isEkadashi = notification.type === "ekadashi-alert";
  
  const bgColor = isFestival ? "bg-orange-50" : isEkadashi ? "bg-emerald-50" : "bg-white";
  const borderColor = isFestival ? "border-orange-200" : isEkadashi ? "border-emerald-200" : "border-zinc-200";
  const iconColor = isFestival ? "text-orange-500" : isEkadashi ? "text-emerald-600" : "text-amber-500";

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-in slide-in-from-top-10 fade-in duration-500">
      <div className={`pointer-events-auto max-w-sm w-full ${bgColor} border ${borderColor} shadow-xl rounded-2xl p-4 flex gap-4 items-start relative`}>
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`mt-0.5 p-2 bg-white rounded-full shadow-sm border ${borderColor}`}>
          {isFestival ? <Sparkles className={`w-5 h-5 ${iconColor}`} /> : <BellRing className={`w-5 h-5 ${iconColor}`} />}
        </div>

        {/* Text Content */}
        <div className="flex-1 pr-4">
          <h4 className="text-[15px] font-bold text-zinc-900 mb-0.5">
            {notification.title}
          </h4>
          <p className="text-[13px] font-medium text-zinc-600 leading-snug">
            {notification.message}
          </p>
        </div>

      </div>
    </div>
  );
}