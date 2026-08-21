import { Metadata } from "next";
import CalendarClient from "./calendar-client";

export const metadata: Metadata = {
  title: "সম্পূর্ণ পঞ্জিকা | Guardian of Temples",
  description: "বাংলা হিন্দু পঞ্জিকার সম্পূর্ণ মাসিক ক্যালেন্ডার ও বিস্তারিত তিথি।",
};

export default function FullCalendarPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900">
      <CalendarClient />
    </main>
  );
}