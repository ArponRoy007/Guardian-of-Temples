import { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "আজকের পঞ্জিকা | Guardian of Temples",
  description: "Guardian of Temples - বাংলা পঞ্জিকা, আজকের তিথি এবং পূজা ও উৎসবের সময়সূচী।",
};

export default function PanjikaPage() {
  return (
    // Changed from dark mode to clean light mode
    <main className="min-h-screen bg-slate-50 text-zinc-900 selection:bg-orange-500/30">
      <DashboardClient />
    </main>
  );
}