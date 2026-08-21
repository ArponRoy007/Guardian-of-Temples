export interface FestivalEvent {
    titleBn: string;
    titleEn: string;
    type: "festival" | "ekadashi" | "purnima" | "amavasya" | "puja";
    date: string; // YYYY-MM-DD
    isMajor?: boolean;
  }
  
  export const KNOWN_FESTIVALS_2026: Record<string, FestivalEvent[]> = {
    // --- AUGUST 2026 ---
    "2026-08-28": [
      { titleBn: "শ্রাবণ পূর্ণিমা ও রাখি পূর্ণিমা", titleEn: "Shravana Purnima & Rakhi", type: "purnima", date: "2026-08-28", isMajor: true }
    ],
    
    // --- SEPTEMBER 2026 ---
    "2026-09-04": [
      { titleBn: "শুভ জন্মাষ্টমী", titleEn: "Janmashtami", type: "festival", date: "2026-09-04", isMajor: true }
    ],
    "2026-09-07": [
      { titleBn: "অজা একাদশী", titleEn: "Aja Ekadashi", type: "ekadashi", date: "2026-09-07" }
    ],
    "2026-09-17": [
      { titleBn: "বিশ্বকর্মা পূজা", titleEn: "Vishwakarma Puja", type: "puja", date: "2026-09-17" }
    ],
    "2026-09-22": [
      { titleBn: "পার্শ্ব একাদশী", titleEn: "Parsva Ekadashi", type: "ekadashi", date: "2026-09-22" }
    ],
    "2026-09-26": [
      { titleBn: "ভাদ্র পূর্ণিমা", titleEn: "Bhadrapada Purnima", type: "purnima", date: "2026-09-26" }
    ],
  
    // --- OCTOBER 2026 (Devi Paksha / Durga Puja) ---
    "2026-10-06": [
      { titleBn: "ইন্দিরা একাদশী", titleEn: "Indira Ekadashi", type: "ekadashi", date: "2026-10-06" }
    ],
    "2026-10-10": [
      { titleBn: "শুভ মহালয়া (অমাবস্যা)", titleEn: "Mahalaya", type: "amavasya", date: "2026-10-10", isMajor: true }
    ],
    "2026-10-16": [
      { titleBn: "মহাপঞ্চমী", titleEn: "Maha Panchami", type: "festival", date: "2026-10-16" }
    ],
    "2026-10-17": [
      { titleBn: "মহাষষ্ঠী", titleEn: "Maha Shashthi", type: "festival", date: "2026-10-17", isMajor: true }
    ],
    "2026-10-18": [
      { titleBn: "মহাসপ্তমী", titleEn: "Maha Saptami", type: "festival", date: "2026-10-18", isMajor: true }
    ],
    "2026-10-19": [
      { titleBn: "মহাষ্টমী ও সন্ধিপূজা", titleEn: "Maha Ashtami & Sandhi Puja", type: "festival", date: "2026-10-19", isMajor: true }
    ],
    "2026-10-20": [
      { titleBn: "মহানবমী", titleEn: "Maha Navami", type: "festival", date: "2026-10-20", isMajor: true }
    ],
    "2026-10-21": [
      { titleBn: "শুভ বিজয়া দশমী", titleEn: "Vijaya Dashami", type: "festival", date: "2026-10-21", isMajor: true }
    ],
    "2026-10-25": [
      { titleBn: "শ্রী শ্রী কোজাগরী লক্ষ্মীপূজা (পূর্ণিমা)", titleEn: "Kojagari Lakshmi Puja", type: "puja", date: "2026-10-25", isMajor: true }
    ],
  
    // --- NOVEMBER 2026 ---
    "2026-11-04": [
      { titleBn: "রমা একাদশী", titleEn: "Rama Ekadashi", type: "ekadashi", date: "2026-11-04" }
    ],
    "2026-11-08": [
      { titleBn: "শ্যামাপূজা / শ্রী শ্রী কালীপূজা", titleEn: "Kali Puja & Diwali", type: "festival", date: "2026-11-08", isMajor: true }
    ],
    "2026-11-10": [
      { titleBn: "ভ্রাতৃদ্বিতীয়া (ভাইফোঁটা)", titleEn: "Bhai Phota", type: "festival", date: "2026-11-10" }
    ],
    "2026-11-14": [
      { titleBn: "জগদ্ধাত্রী পূজা", titleEn: "Jagaddhatri Puja", type: "puja", date: "2026-11-14" }
    ],
    "2026-11-20": [
      { titleBn: "উত্থান একাদশী", titleEn: "Utthana Ekadashi", type: "ekadashi", date: "2026-11-20" }
    ],
    "2026-11-24": [
      { titleBn: "রাস পূর্ণিমা", titleEn: "Rash Purnima", type: "purnima", date: "2026-11-24", isMajor: true }
    ],
  
    // --- DECEMBER 2026 ---
    "2026-12-04": [
      { titleBn: "উত্পন্না একাদশী", titleEn: "Utpanna Ekadashi", type: "ekadashi", date: "2026-12-04" }
    ],
    "2026-12-19": [
      { titleBn: "মোক্ষদা একাদশী ও গীতা জয়ন্তী", titleEn: "Mokshada Ekadashi / Gita Jayanti", type: "ekadashi", date: "2026-12-19" }
    ],
  
    // --- JANUARY 2027 ---
    "2027-01-03": [
      { titleBn: "সফলা একাদশী", titleEn: "Saphala Ekadashi", type: "ekadashi", date: "2027-01-03" }
    ],
    "2027-01-14": [
      { titleBn: "পৌষ সংক্রান্তি (মকর সংক্রান্তি)", titleEn: "Poush Sankranti", type: "festival", date: "2027-01-14", isMajor: true }
    ],
    "2027-01-18": [
      { titleBn: "পুত্রদা একাদশী", titleEn: "Putrada Ekadashi", type: "ekadashi", date: "2027-01-18" }
    ],
  
    // --- FEBRUARY 2027 ---
    "2027-02-01": [
      { titleBn: "ষটতিলা একাদশী", titleEn: "Shattila Ekadashi", type: "ekadashi", date: "2027-02-01" }
    ],
    "2027-02-11": [
      { titleBn: "শ্রী শ্রী সরস্বতী পূজা", titleEn: "Saraswati Puja", type: "puja", date: "2027-02-11", isMajor: true }
    ],
    "2027-02-17": [
      { titleBn: "জয়া একাদশী", titleEn: "Jaya Ekadashi", type: "ekadashi", date: "2027-02-17" }
    ],
  
    // --- MARCH 2027 ---
    "2027-03-03": [
      { titleBn: "বিজয়া একাদশী", titleEn: "Vijaya Ekadashi", type: "ekadashi", date: "2027-03-03" }
    ],
    "2027-03-06": [
      { titleBn: "মহা শিবরাত্রি", titleEn: "Maha Shivaratri", type: "festival", date: "2027-03-06", isMajor: true }
    ],
    "2027-03-18": [
      { titleBn: "আমলকী একাদশী", titleEn: "Amalaki Ekadashi", type: "ekadashi", date: "2027-03-18" }
    ],
    "2027-03-22": [
      { titleBn: "দোল যাত্রা (দোল পূর্ণিমা)", titleEn: "Dol Yatra", type: "festival", date: "2027-03-22", isMajor: true }
    ],
  
    // --- APRIL 2027 ---
    "2027-04-02": [
      { titleBn: "পাপমোচনী একাদশী", titleEn: "Papmochani Ekadashi", type: "ekadashi", date: "2027-04-02" }
    ],
    "2027-04-14": [
      { titleBn: "চৈত্র সংক্রান্তি ও চড়ক পূজা", titleEn: "Chaitra Sankranti / Charak Puja", type: "festival", date: "2027-04-14", isMajor: true }
    ]
  };
  
  // Returns events for a specific date
  export function getEventsForDate(isoDate: string): FestivalEvent[] {
    return KNOWN_FESTIVALS_2026[isoDate] || [];
  }
  
  // Automatically calculates countdowns and fetches the next upcoming events
  export function getUpcomingEvents(fromDateIso: string, limit = 5): (FestivalEvent & { daysRemaining: number })[] {
    const dates = Object.keys(KNOWN_FESTIVALS_2026)
      .filter((d) => d >= fromDateIso)
      .sort();
  
    const fromTime = new Date(fromDateIso).getTime();
    const results: (FestivalEvent & { daysRemaining: number })[] = [];
  
    for (const d of dates) {
      // Calculates days remaining automatically!
      const diffDays = Math.ceil((new Date(d).getTime() - fromTime) / (1000 * 60 * 60 * 24));
      for (const evt of KNOWN_FESTIVALS_2026[d]) {
        results.push({ ...evt, daysRemaining: diffDays });
        if (results.length >= limit) return results;
      }
    }
  
    return results;
  }

  // Add this at the bottom of lib/panjika/festivals.ts

export function getAllUpcomingEvents(fromDateIso: string): (FestivalEvent & { daysRemaining: number })[] {
    const dates = Object.keys(KNOWN_FESTIVALS_2026)
      .filter((d) => d >= fromDateIso)
      .sort();
  
    const fromTime = new Date(fromDateIso).getTime();
    const results: (FestivalEvent & { daysRemaining: number })[] = [];
  
    for (const d of dates) {
      const diffDays = Math.ceil((new Date(d).getTime() - fromTime) / (1000 * 60 * 60 * 24));
      for (const evt of KNOWN_FESTIVALS_2026[d]) {
        results.push({ ...evt, daysRemaining: diffDays });
      }
    }
  
    return results;
  }