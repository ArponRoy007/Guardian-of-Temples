import * as SunCalc from "suncalc";

export interface PanchangInfo {
  gregorianDate: Date;
  isoDate: string;
  bengaliDay: string;
  bengaliMonth: string;
  bengaliYear: string;
  bengaliDateFull: string;
  season: string;
  weekdayBn: string;
  weekdayEn: string;
  tithiBn: string;
  tithiEn: string;
  pakshaBn: string;
  pakshaEn: string;
  sunrise: string;
  sunset: string;
  monthThemeColor: string;
  tithiEndTime?: string;
}

export const BANGLA_MONTHS = [
  { name: "বৈশাখ", nameEn: "Boishakh", color: "#D65A4A", season: "গ্রীষ্ম (Summer)" },
  { name: "জ্যৈষ্ঠ", nameEn: "Jaishtha", color: "#E6A23C", season: "গ্রীষ্ম (Summer)" },
  { name: "আষাঢ়", nameEn: "Asharh", color: "#4F8A8B", season: "বর্ষা (Monsoon)" },
  { name: "শ্রাবণ", nameEn: "Shrabon", color: "#5B8E9B", season: "বর্ষা (Monsoon)" },
  { name: "ভাদ্র", nameEn: "Bhadro", color: "#8FAF9A", season: "শরৎ (Autumn)" },
  { name: "আশ্বিন", nameEn: "Ashwin", color: "#C08A34", season: "শরৎ (Autumn)" },
  { name: "কার্তিক", nameEn: "Kartik", color: "#B56A3A", season: "হেমন্ত (Late Autumn)" },
  { name: "অগ্রহায়ণ", nameEn: "Agrahayan", color: "#C49A54", season: "হেমন্ত (Late Autumn)" },
  { name: "পৌষ", nameEn: "Poush", color: "#A9A9A0", season: "শীত (Winter)" },
  { name: "মাঘ", nameEn: "Magh", color: "#8B8C9A", season: "শীত (Winter)" },
  { name: "ফাল্গুন", nameEn: "Falgun", color: "#C9829B", season: "বসন্ত (Spring)" },
  { name: "চৈত্র", nameEn: "Choitro", color: "#D98B5F", season: "বসন্ত (Spring)" }
];

export const TITHI_NAMES = [
  { bn: "প্রতিপদ", en: "Pratipada" },
  { bn: "দ্বিতীয়া", en: "Dwitiya" },
  { bn: "তৃতীয়া", en: "Tritiya" },
  { bn: "চতুর্থী", en: "Chaturthi" },
  { bn: "পঞ্চমী", en: "Panchami" },
  { bn: "ষষ্ঠী", en: "Shashthi" },
  { bn: "সপ্তমী", en: "Saptami" },
  { bn: "অষ্টমী", en: "Ashtami" },
  { bn: "নবমী", en: "Navami" },
  { bn: "দশমী", en: "Dashami" },
  { bn: "একাদশী", en: "Ekadashi" },
  { bn: "দ্বাদশী", en: "Dwadashi" },
  { bn: "ত্রয়োদশী", en: "Trayodashi" },
  { bn: "চতুর্দশী", en: "Chaturdashi" },
  { bn: "পূর্ণিমা", en: "Purnima" },
  { bn: "অমাবস্যা", en: "Amavasya" }
];

const BN_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};

export const toBnDigits = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => BN_DIGITS[d] || d);

// ------------------------------------------------------------------
// FESTIVAL OVERRIDE MATRIX (Ensures perfect temple alignment)
// ------------------------------------------------------------------
const FESTIVAL_OVERRIDES: Record<string, { tithiBn: string, tithiEn: string }> = {
  "2026-10-10": { tithiBn: "কৃষ্ণা অমাবস্যা (মহালয়া)", tithiEn: "Krishna Amavasya (Mahalaya)" },
  "2026-10-16": { tithiBn: "শুক্লা ষষ্ঠী (মহাষষ্ঠী)", tithiEn: "Shukla Shashthi (Maha Shashthi)" },
  "2026-10-17": { tithiBn: "শুক্লা ষষ্ঠী / সপ্তমী", tithiEn: "Shukla Shashthi / Saptami" },
  "2026-10-18": { tithiBn: "শুক্লা সপ্তমী (মহাসপ্তমী)", tithiEn: "Shukla Saptami (Maha Saptami)" },
  "2026-10-19": { tithiBn: "শুক্লা অষ্টমী (মহাষ্টমী)", tithiEn: "Shukla Ashtami (Maha Ashtami)" },
  "2026-10-20": { tithiBn: "শুক্লা নবমী (মহানবমী)", tithiEn: "Shukla Navami (Maha Navami)" },
  "2026-10-21": { tithiBn: "শুক্লা দশমী (বিজয়া দশমী)", tithiEn: "Shukla Dashami (Vijaya Dashami)" },
};

// Default coordinates for Dhaka, Bangladesh
const DEFAULT_LAT = 23.8103;
const DEFAULT_LNG = 90.4125;

export function getSunriseSunset(date: Date = new Date(), lat?: number, lng?: number) {
  const targetDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const targetLat = typeof lat === "number" && !isNaN(lat) ? lat : DEFAULT_LAT;
  const targetLng = typeof lng === "number" && !isNaN(lng) ? lng : DEFAULT_LNG;

  try {
    const times = SunCalc.getTimes(targetDate, targetLat, targetLng);
    return {
      sunrise: times?.sunrise instanceof Date && !isNaN(times.sunrise.getTime()) ? times.sunrise : null,
      sunset: times?.sunset instanceof Date && !isNaN(times.sunset.getTime()) ? times.sunset : null,
    };
  } catch (err) {
    console.error("SunCalc calculation failed:", err);
    return { sunrise: null, sunset: null };
  }
}

export function getPanchangForDate(date: Date = new Date(), lat = DEFAULT_LAT, lng = DEFAULT_LNG): PanchangInfo {
  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

  const year = safeDate.getFullYear();
  const monthStr = String(safeDate.getMonth() + 1).padStart(2, "0");
  const dayStr = String(safeDate.getDate()).padStart(2, "0");
  const isoDate = `${year}-${monthStr}-${dayStr}`;

  const d = safeDate.getDate();
  const m = safeDate.getMonth();
  const y = safeDate.getFullYear();

  // Solar Transitions (Approximate Gregorian Day of Month)
  const transitions = [14, 13, 14, 14, 15, 15, 16, 17, 17, 17, 16, 15];
  const monthMatrix = [
    [8, 9], [9, 10], [10, 11], [11, 0], [0, 1], [1, 2], 
    [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]
  ];

  const tDay = transitions[m];
  const isNextMonth = d > tDay;
  const monthIdx = monthMatrix[m][isNextMonth ? 1 : 0];

  let bnDayNum;
  if (isNextMonth) {
    bnDayNum = d - tDay;
  } else {
    const prevMonth = m === 0 ? 11 : m - 1;
    const prevYear = m === 0 ? y - 1 : y;
    const daysInPrevGregorianMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    bnDayNum = (daysInPrevGregorianMonth - transitions[prevMonth]) + d;
  }

  const monthData = BANGLA_MONTHS[monthIdx];
  const bnDayStr = toBnDigits(bnDayNum);
  const bnYear = (m > 3 || (m === 3 && d > transitions[3])) ? year - 593 : year - 594;

  const sunTimes = getSunriseSunset(safeDate, lat, lng);
  const sunrise = sunTimes.sunrise ? sunTimes.sunrise.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit", hour12: true }) : "--:--";
  const sunset = sunTimes.sunset ? sunTimes.sunset.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit", hour12: true }) : "--:--";
  
  // High-precision lunar phase calculation (evaluated at local sunrise)
  const evalDate = sunTimes.sunrise || new Date(y, m, d, 6, 0, 0);
  const anchor = Date.UTC(2000, 0, 6, 18, 14, 0); 
  const diffDays = (evalDate.getTime() - anchor) / 86400000;
  const adjustedDiff = diffDays - 0.45; // Panjika local time correction factor
  const cycles = adjustedDiff / 29.53058868;
  const phase = cycles - Math.floor(cycles);

  const isShukla = phase < 0.5;
  const tithiIndex = Math.min(Math.floor((isShukla ? phase * 2 : (phase - 0.5) * 2) * 15), 14);

  let tithiNameBn = TITHI_NAMES[tithiIndex]?.bn || "সপ্তমী";
  let tithiNameEn = TITHI_NAMES[tithiIndex]?.en || "Saptami";

  if (tithiIndex === 14) {
    tithiNameBn = isShukla ? "পূর্ণিমা" : "অমাবস্যা";
    tithiNameEn = isShukla ? "Purnima" : "Amavasya";
  }

  const pakshaBn = isShukla ? "শুক্লপক্ষ" : "কৃষ্ণপক্ষ";
  const pakshaEn = isShukla ? "Shukla Paksha" : "Krishna Paksha";

  let finalTithiBn = `${isShukla ? "শুক্লা" : "কৃষ্ণা"} ${tithiNameBn}`;
  let finalTithiEn = `${pakshaEn} ${tithiNameEn}`;

  // Apply manual overrides for specific Panjika decrees
  if (FESTIVAL_OVERRIDES[isoDate]) {
    finalTithiBn = FESTIVAL_OVERRIDES[isoDate].tithiBn;
    finalTithiEn = FESTIVAL_OVERRIDES[isoDate].tithiEn;
  }

  return {
    gregorianDate: safeDate,
    isoDate,
    bengaliDay: bnDayStr,
    bengaliMonth: monthData.name,
    bengaliYear: `${toBnDigits(bnYear)} বঙ্গাব্দ`,
    bengaliDateFull: `${bnDayStr} ${monthData.name} ${toBnDigits(bnYear)} বঙ্গাব্দ`,
    season: monthData.season,
    weekdayBn: safeDate.toLocaleDateString("bn-BD", { weekday: "long" }),
    weekdayEn: safeDate.toLocaleDateString("en-US", { weekday: "long" }),
    tithiBn: finalTithiBn,
    tithiEn: finalTithiEn,
    pakshaBn,
    pakshaEn,
    sunrise,
    sunset,
    monthThemeColor: monthData.color
  };
}