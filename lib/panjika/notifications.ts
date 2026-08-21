import { getPanchangForDate } from "./engine";
import { getAllUpcomingEvents } from "./festivals";

export interface DailyNotification {
  title: string;
  message: string;
  type: "greeting" | "festival" | "ekadashi-alert";
}

export function generateDailyNotification(): DailyNotification {
  const today = new Date();
  const panchang = getPanchangForDate(today);
  const allUpcoming = getAllUpcomingEvents(panchang.isoDate);

  // 1. Check if TODAY is a major festival or Puja
  const todayEvents = allUpcoming.filter((evt) => evt.daysRemaining === 0);
  if (todayEvents.length > 0) {
    const mainEvent = todayEvents[0];
    
    if (mainEvent.type === "ekadashi") {
      return {
        title: "আজ একাদশী",
        message: `আজ ${mainEvent.titleBn}। আপনার ব্রত ও উপবাস সফল হোক।`,
        type: "ekadashi-alert",
      };
    }
    
    return {
      title: `শুভ ${mainEvent.titleBn}`,
      message: "আজকের এই পুণ্য তিথিতে আপনার দিনটি সুন্দর ও মঙ্গলময় হোক।",
      type: "festival",
    };
  }

  // 2. Check for upcoming Ekadashi (1, 2, or 3 days away)
  const upcomingEkadashi = allUpcoming.find((evt) => evt.type === "ekadashi");
  if (upcomingEkadashi) {
    const daysLeft = upcomingEkadashi.daysRemaining;
    
    if (daysLeft === 1) {
      return {
        title: "আগামীকাল একাদশী",
        message: `আগামীকাল ${upcomingEkadashi.titleBn}। ব্রতের মানসিক ও শারীরিক প্রস্তুতি নিন।`,
        type: "ekadashi-alert",
      };
    } else if (daysLeft === 2) {
      return {
        title: "একাদশী সতর্কতা",
        message: `আর মাত্র ২ দিন পর ${upcomingEkadashi.titleBn}।`,
        type: "ekadashi-alert",
      };
    } else if (daysLeft === 3) {
      return {
        title: "একাদশী সতর্কতা",
        message: `আর ৩ দিন পর ${upcomingEkadashi.titleBn}। প্রস্তুতি শুরু করুন।`,
        type: "ekadashi-alert",
      };
    }
  }

  // 3. Default Daily Greeting if nothing special is happening
  return {
    title: "সুপ্রভাত!",
    message: `আজকের তিথি: ${panchang.tithiBn}। আপনার দিনটি শুভ হোক।`,
    type: "greeting",
  };
}