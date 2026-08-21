"use client";

import DailyToast from "./daily-toast";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CloudSun, MapPin, ChevronRight, CalendarDays, X } from "lucide-react";
import { getPanchangForDate, toBnDigits } from "@/lib/panjika/engine";
import { getUpcomingEvents, getAllUpcomingEvents } from "@/lib/panjika/festivals";

export default function DashboardClient() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the popup

  // Live clock tick
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const panchang = getPanchangForDate(today);
  const upcomingEvents = getUpcomingEvents(panchang.isoDate, 5);
  const allYearEvents = getAllUpcomingEvents(panchang.isoDate); // Fetches everything for modal

  // Time greeting logic
  const hour = currentTime.getHours();
  let greeting = "শুভ রাত্রি";
  if (hour >= 5 && hour < 12) greeting = "শুভ সকাল";
  else if (hour >= 12 && hour < 16) greeting = "শুভ অপরাহ্ন";
  else if (hour >= 16 && hour < 20) greeting = "শুভ সন্ধ্যা";

  const timeString = currentTime.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Mini Calendar Generation (TYPESCRIPT ERROR FIXED HERE)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  // We explicitly tell TS: <(number | null)[]> so it accepts both nulls and numbers!
  const calendarCells = (Array.from({ length: firstDayIndex }, () => null) as (number | null)[])
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    
  const weekDaysShort = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

  // Bangladesh Weekend Logic
  const isTodayWeekend = today.getDay() === 5 || today.getDay() === 6;

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-md w-full pb-20 pt-4 px-4 flex flex-col gap-5 relative">
      <DailyToast />
      {/* 1. HERO WEATHER/GREETING BANNER */}
      <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-200 z-0" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-5 flex flex-col justify-between h-full">
          <h2 className="text-lg font-bold text-white drop-shadow-md tracking-wide">
            {greeting}
          </h2>
          <div className="flex items-center gap-2 text-sm font-semibold text-white drop-shadow-md">
            <CloudSun className="w-5 h-5 text-yellow-300" />
            <span>৩২° C</span>
            <span className="opacity-70">|</span>
            <MapPin className="w-4 h-4 text-zinc-100" />
            <span>ঢাকা, বাংলাদেশ</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN DATE & MINI CALENDAR SPLIT */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex flex-row gap-4 items-center justify-between">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-zinc-900 flex items-baseline gap-2">
            {panchang.bengaliDay} <span className="text-xl font-semibold text-zinc-700">{panchang.bengaliMonth}</span>
          </h1>
          <p className="text-[14px] font-medium mt-1">
            <span className={isTodayWeekend ? "text-red-600 font-bold" : "text-zinc-600"}>
              {panchang.weekdayBn}
            </span>
            <span className="text-zinc-600">, {panchang.bengaliYear}</span>
          </p>
          <p className="text-[13px] text-zinc-500 mb-1 font-medium">
            {today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <div className="inline-flex items-center gap-1.5 px-0 w-fit mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[13px] font-semibold text-zinc-700">{panchang.tithiBn}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-zinc-900 mt-auto">
            {timeString}
          </p>
        </div>

        <div className="w-[160px] flex-shrink-0 bg-white rounded-xl">
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center mb-2">
            {weekDaysShort.map((day, i) => (
              <span key={i} className={`text-[10px] font-bold ${i === 5 || i === 6 ? "text-red-600" : "text-zinc-800"}`}>
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
            {calendarCells.map((day, i) => {
              const isToday = day === today.getDate();
              const dayOfWeek = i % 7;
              const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
              return (
                <div key={i} className="flex justify-center items-center h-6 w-full">
                  {day ? (
                    <span className={`text-[13px] w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday 
                        ? "bg-green-700 text-white font-bold shadow-md" 
                        : isWeekend 
                          ? "text-red-600 font-bold" 
                          : "text-zinc-800 font-medium"
                    }`}>
                      {toBnDigits(day)}
                    </span>
                  ) : <span />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. UPCOMING EVENTS CAROUSEL */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[17px] font-bold text-zinc-900">আসন্ন অনুষ্ঠান</h3>
          
          {/* THE MODAL TRIGGER BUTTON */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center transition-colors"
          >
            সব দেখুন <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        
        <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {upcomingEvents.map((evt, idx) => {
            const bgGradients = {
              festival: "from-orange-500 to-amber-600",
              ekadashi: "from-emerald-600 to-teal-700",
              purnima: "from-blue-600 to-indigo-700",
              amavasya: "from-slate-700 to-slate-900",
              puja: "from-rose-500 to-red-600"
            };
            const gradient = bgGradients[evt.type] || bgGradients.festival;
            const eventDate = new Date(evt.date);
            const panchangForEvent = getPanchangForDate(eventDate);

            return (
              <div key={idx} className={`relative w-[130px] h-[160px] flex-shrink-0 snap-start rounded-2xl overflow-hidden shadow-md bg-gradient-to-b ${gradient}`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-md">
                  <span className="text-[10px] font-semibold text-white">
                    {evt.daysRemaining === 0 ? "আজ" : `আর ${toBnDigits(evt.daysRemaining)} দিন`}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                  <span className="text-2xl font-bold text-white leading-none drop-shadow-sm">
                    {panchangForEvent.bengaliDay}
                  </span>
                  <span className="text-[11px] font-semibold text-white/90 drop-shadow-sm mb-1">
                    {panchangForEvent.bengaliMonth}
                  </span>
                  <span className="text-[13px] font-bold text-white leading-tight drop-shadow-sm line-clamp-2">
                    {evt.titleBn}
                  </span>
                  <span className="text-[10px] text-white/80 font-medium mt-1">
                    {panchangForEvent.weekdayBn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CTA TO FULL CALENDAR */}
      <div className="mt-1">
        <Link 
          href="/panjika/calendar" 
          className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 font-bold text-[15px] py-4 rounded-xl border border-zinc-200 shadow-sm hover:bg-zinc-50 active:scale-[0.98] transition-all"
        >
          <CalendarDays className="w-5 h-5 text-zinc-600" />
          সম্পূর্ণ পঞ্জিকা দেখুন
        </Link>
      </div>

      {/* 5. THE POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
          <div className="bg-slate-50 w-full max-w-md h-[80vh] sm:h-[70vh] sm:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-white rounded-t-3xl sm:rounded-t-3xl">
              <div>
                <h2 className="text-[18px] font-bold text-zinc-900">উৎসবের তালিকা</h2>
                <p className="text-[12px] font-medium text-zinc-500">সম্পূর্ণ বছর</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {allYearEvents.map((evt, idx) => {
                const eventDate = new Date(evt.date);
                const panchangForEvent = getPanchangForDate(eventDate);
                
                return (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex flex-col items-center justify-center bg-orange-50 px-3 py-2 rounded-xl border border-orange-100 min-w-[65px]">
                      <span className="text-[20px] font-bold text-orange-600 leading-none">
                        {panchangForEvent.bengaliDay}
                      </span>
                      <span className="text-[11px] font-semibold text-orange-800 mt-1">
                        {panchangForEvent.bengaliMonth}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-bold text-zinc-900 truncate">
                        {evt.titleBn}
                      </h4>
                      <p className="text-[12px] font-medium text-zinc-500 mt-0.5">
                        {panchangForEvent.weekdayBn}, {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end whitespace-nowrap">
                      {evt.daysRemaining === 0 ? (
                        <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-1 rounded-md">
                          আজ!
                        </span>
                      ) : (
                        <>
                          <span className="text-[15px] font-bold text-zinc-800">
                            {toBnDigits(evt.daysRemaining)}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-500">দিন বাকি</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}