"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Sunrise, Sunset, Clock, Bell, BellRing } from "lucide-react";
import { getPanchangForDate, toBnDigits } from "@/lib/panjika/engine";
import { getEventsForDate } from "@/lib/panjika/festivals";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// --- CUSTOM ANIMATED MOON COMPONENT ---
const AnimatedMoon = ({ tithiBn, pakshaBn }: { tithiBn: string, pakshaBn: string }) => {
  const isFull = tithiBn.includes("পূর্ণিমা");
  const isNew = tithiBn.includes("অমাবস্যা");
  const isShukla = pakshaBn.includes("শুক্ল");
  
  const tithis = ["প্রতিপদ", "দ্বিতীয়া", "তৃতীয়া", "চতুর্থী", "পঞ্চমী", "ষষ্ঠী", "সপ্তমী", "অষ্টমী", "নবমী", "দশমী", "একাদশী", "দ্বাদশী", "ত্রয়োদশী", "চতুর্দশী"];
  let index = tithis.findIndex(t => tithiBn.includes(t)) + 1;
  if (isFull || isNew) index = 15;

  // Calculate translation percentage for the shadow
  const progress = (index / 15) * 100;
  let translateX = "0%"; 

  if (isFull) {
    translateX = "100%"; // Fully expose the yellow moon
  } else if (isNew) {
    translateX = "0%"; // Fully cover with shadow
  } else if (isShukla) {
    translateX = `-${progress}%`; // Waxing: light grows on the right
  } else {
    translateX = `${100 - progress}%`; // Waning: light shrinks on the left
  }

  return (
    <div className="relative w-8 h-8 rounded-full bg-yellow-200 overflow-hidden shadow-sm flex-shrink-0 ring-1 ring-zinc-200">
      {/* The moving dark shadow */}
      <div 
        className="absolute inset-0 bg-slate-700 rounded-full transition-transform duration-700 ease-in-out scale-[1.05]"
        style={{ transform: `translateX(${translateX})` }}
      />
    </div>
  );
};

export default function CalendarClient() {
  const [mounted, setMounted] = useState(false);
  const today = new Date();
  
  // States for navigation and selection
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  // --- NEW NOTIFICATION STATE ---
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check current permission on load
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // --- HANDLERS ---
  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const handleGoToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const handleNotificationToggle = async () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
  
    if (!nextState) {
      // Optional: Call your API to remove the subscription token
      return;
    }
  
    try {
      if (Capacitor.isNativePlatform()) {
        // 1. Check current native permission status
        let permStatus = await PushNotifications.checkPermissions();
  
        if (permStatus.receive === 'prompt') {
          // 2. Triggers the native Android 13+ dialog
          permStatus = await PushNotifications.requestPermissions();
        }
  
        if (permStatus.receive === 'granted') {
          // 3. Registers device and triggers token event
          await PushNotifications.register();
        } else {
          setNotificationsEnabled(false);
        }
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        // Browser fallback (Chrome, Safari, etc.)
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setNotificationsEnabled(false);
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setNotificationsEnabled(false);
    }
  };

  // Generate Calendar Grid (42 cells to maintain consistent height)
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Go back to Sunday
    
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      cells.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === month,
      });
    }
    return cells;
  }, [viewDate]);

  const weekDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
  const selectedPanchang = getPanchangForDate(selectedDate);
  
  // Generate Header Data
  const firstDayPanchang = getPanchangForDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
  const lastDayPanchang = getPanchangForDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0));
  const mainTitle = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  // --- SPECIAL EVENT LOGIC ---
  let specialEventName = null;
  
  // 1. Format the selected date to match your database format (YYYY-MM-DD)
  const yearStr = selectedDate.getFullYear();
  const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(selectedDate.getDate()).padStart(2, '0');
  const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;

  // 2. Check your KNOWN_FESTIVALS_2026 database for events on this day
  const todaysEvents = getEventsForDate(formattedDate);

  if (todaysEvents && todaysEvents.length > 0) {
    // If a major festival is found (e.g. "শুভ জন্মাষ্টমী"), show it!
    specialEventName = todaysEvents[0].titleBn;
  } else {
    // 3. Fallback: Automatically detect recurring Tithis if not in the database
    const currentTithi = selectedPanchang.tithiBn || "";

    if (currentTithi.includes("একাদশী")) {
      specialEventName = "আজ একাদশী";
    } else if (currentTithi.includes("পূর্ণিমা")) {
      specialEventName = "আজ পূর্ণিমা";
    } else if (currentTithi.includes("অমাবস্যা")) {
      specialEventName = "আজ অমাবস্যা";
    } else if (currentTithi.includes("সপ্তমী")) {
      specialEventName = "শুভ সপ্তমী";
    } else if (currentTithi.includes("অষ্টমী")) {
      specialEventName = "শুভ মহাঅষ্টমী";
    } else if (currentTithi.includes("নবমী")) {
      specialEventName = "শুভ মহানবমী";
    }
  }

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-md w-full bg-white min-h-screen flex flex-col">
      
      {/* 1. HEADER ROW */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-slate-50">
        <div className="flex flex-col">
          <button className="flex items-center gap-1 text-[17px] font-bold text-zinc-900">
            {mainTitle}
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </button>
          <span className="text-[12px] font-medium text-zinc-500">
            {firstDayPanchang.bengaliMonth} / {lastDayPanchang.bengaliMonth} {firstDayPanchang.bengaliYear}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGoToToday}
            className="bg-[#205b26] text-white text-[13px] font-semibold px-4 py-1.5 rounded-md active:scale-95 transition-transform"
          >
            আজ
          </button>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CALENDAR GRID */}
      <div className="flex flex-col bg-white">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200">
          {weekDays.map((day, i) => (
            <div key={i} className={`text-center py-2 text-[13px] font-bold ${i === 5 || i === 6 ? "text-red-600" : "text-zinc-900"}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 border-l border-zinc-200">
          {calendarCells.map((cell, i) => {
            const isToday = cell.date.toDateString() === today.toDateString();
            const isSelected = cell.date.toDateString() === selectedDate.toDateString();
            const dayOfWeek = cell.date.getDay();
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; 
            
            const cellPanchang = getPanchangForDate(cell.date);
            const bnDay = cellPanchang.bengaliDay;
            const enDay = cell.date.getDate();

            let bgColor = "bg-white";
            let bnTextColor = cell.isCurrentMonth ? (isWeekend ? "text-red-600" : "text-zinc-900") : "text-zinc-300";
            let enTextColor = cell.isCurrentMonth ? (isWeekend ? "text-red-400" : "text-zinc-500") : "text-zinc-300";
            
            if (isSelected) {
              bgColor = "bg-[#205b26]"; 
              bnTextColor = "text-white";
              enTextColor = "text-green-200";
            }

            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(cell.date)}
                className={`relative h-16 border-r border-b border-zinc-200 cursor-pointer flex flex-col justify-center items-center transition-colors ${bgColor}`}
              >
                {/* Large Bengali Date */}
                <span className={`text-[22px] font-medium leading-none ${bnTextColor}`}>
                  {bnDay}
                </span>
                
                {/* Small Gregorian Date (Bottom Right) */}
                <span className={`absolute bottom-1 right-1 text-[11px] font-semibold ${enTextColor}`}>
                  {enDay}
                </span>

                {/* Subtle blue dot for events/tithi boundaries (mock indicator) */}
                {cell.isCurrentMonth && !isSelected && i % 3 === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM DETAIL PANEL */}
      <div className="flex-1 bg-slate-50 p-4 border-t border-zinc-200 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
        <div className="flex gap-4">
          
          {/* Left Column: Big Gregorian Date & Animated Moon */}
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-[40px] font-bold text-zinc-900 leading-none">
              {selectedDate.getDate()}
            </span>
            <span className="text-[14px] font-bold text-zinc-700 mt-1 whitespace-nowrap">
              {selectedPanchang.bengaliDay} {selectedPanchang.bengaliMonth} {selectedPanchang.bengaliYear.split(" ")[0]}
            </span>
            <span className="text-[14px] font-semibold text-zinc-500 mt-0.5">
              {selectedPanchang.weekdayBn}
            </span>
            <span className="text-[12px] font-medium text-zinc-500 mt-0.5 mb-2">
              {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            
            <div className="mt-2 flex flex-col items-center text-zinc-500">
              <AnimatedMoon tithiBn={selectedPanchang.tithiBn} pakshaBn={selectedPanchang.pakshaBn} />
              <span className="text-[10px] mt-1.5 font-medium">{selectedPanchang.pakshaBn}</span>
            </div>
          </div>

          {/* Right Column: Tithi & Notes (STATIC DARK TEXT) */}
          <div className="flex flex-col flex-1 pl-2 items-start">
            <div className="mb-2 flex items-center gap-2">
              <button 
                onClick={handleGoToToday} 
                className="rounded-md bg-zinc-200 px-3 py-1 text-[12px] font-bold text-zinc-800 hover:bg-zinc-300 transition-colors flex items-center gap-1"
              >
                আজ <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
              {selectedPanchang.bengaliMonth} {selectedPanchang.tithiBn}
            </h2>

            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              <span>তিথি থাকবে: {(selectedPanchang as any).tithiEndTime || "সারা দিন"}</span>
            </p>

            {specialEventName && (
              <div className="mt-4 flex w-full animate-in zoom-in duration-300 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 px-3 py-2 text-white shadow-sm shadow-orange-500/25">
                <Bell className="h-3.5 w-3.5 animate-pulse text-amber-200" />
                <span className="font-bold text-[13px] tracking-wide">{specialEventName}</span>
                <Bell className="h-3.5 w-3.5 animate-pulse text-amber-200" />
              </div>
            )}
          </div>
        </div>

        {/* Sunrise & Sunset Row */}
        <div className="flex gap-8 mt-6 pt-4 border-t border-zinc-200">
          <div className="flex flex-col items-center gap-1 text-orange-500">
            <Sunrise className="w-6 h-6" />
            <span className="text-[13px] font-semibold text-zinc-700">{selectedPanchang.sunrise}</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-orange-600">
            <Sunset className="w-6 h-6" />
            <span className="text-[13px] font-semibold text-zinc-700">{selectedPanchang.sunset}</span>
          </div>
        </div>

        {/* --- NEW: NOTIFICATION TOGGLE ROW --- */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${notificationsEnabled ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-zinc-800 leading-tight">দৈনিক নোটিফিকেশন</p>
              <p className="text-[10px] font-medium text-zinc-500">প্রতিদিনের পঞ্জিকা আপডেট পান</p>
            </div>
          </div>
          
          <button 
            onClick={handleNotificationToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${notificationsEnabled ? 'bg-green-500' : 'bg-zinc-300'}`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}