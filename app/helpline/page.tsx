import { createClient } from "@/lib/supabase/server";
import { HelplineCard, HelplineItem } from "@/components/helpline/HelplineCard";
import { HelplineClientFilter } from "@/components/helpline/HelplineClientFilter";
import { PhoneCall, AlertTriangle, ShieldCheck, HeartHandshake, Scale } from "lucide-react";

export const revalidate = 60; // Refresh data every 60s

export default async function PublicHelplinePage() {
  const supabase = createClient();

  // 1. Fetch all helpline contacts
  const { data: rawHelplines } = await supabase
    .from("helpline_contacts")
    .select(`
      id,
      name,
      phone_number,
      category,
      district_id,
      district:districts(id, name_en, name_bn)
    `)
    .order("name");

  // 2. Fetch all districts for dropdown selector
  const { data: districts } = await supabase
    .from("districts")
    .select("id, name_en, name_bn")
    .order("name_en");

  const helplines: HelplineItem[] = (rawHelplines || []).map((h: any) => ({
    ...h,
    isProminent: h.phone_number === "999" || h.category === "emergency_other",
  }));

  // Separate national vs district contacts
  const nationalContacts = helplines.filter((h) => !h.district_id);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Alert Banner */}
      <div className="rounded-3xl bg-red-600 p-6 sm:p-8 text-white shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <PhoneCall className="h-7 w-7 text-white animate-bounce" />
          </div>
          <div>
            <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              Immediate Safety Priority
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              Emergency Helplines Bangladesh
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-red-100 font-medium max-w-2xl">
          If you or someone you know is in immediate danger, call <strong className="text-white underline font-extrabold text-lg">999 (National Emergency)</strong> right away for Police, Ambulance, or Fire dispatch.
        </p>

        {/* Quick Tap 999 Button */}
        <div className="pt-2">
          <a
            href="tel:999"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-mono font-extrabold text-red-700 text-lg shadow-xl hover:bg-red-50 active:scale-95 transition-all"
          >
            <PhoneCall className="h-5 w-5 text-red-600" />
            <span>TAP TO CALL 999 IMMEDIATELY</span>
          </a>
        </div>
      </div>

      {/* Prominent National Emergency Hotlines Grid */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          National Emergency Hotlines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nationalContacts.map((item) => (
            <HelplineCard key={item.id} helpline={item} />
          ))}
        </div>
      </div>

      {/* Interactive Category & District Filter Component */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <HelplineClientFilter
          allHelplines={helplines}
          districts={districts || []}
        />
      </div>
    </div>
  );
}
