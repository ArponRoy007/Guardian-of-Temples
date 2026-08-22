import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Calendar,
  MapPin,
  Church,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface FestivalPageProps {
  params: {
    festivalSlug: string;
  };
}

export const revalidate = 3600;

interface FestivalContent {
  slug: string;
  nameEn: string;
  nameBn: string;
  titleTag: string;
  metaDescription: string;
  date2026: string;
  dateStartIso: string;
  dateEndIso: string;
  introText: string;
  culturalHighlights: string[];
}

const FESTIVALS_DATA: Record<string, FestivalContent> = {
  "durga-puja": {
    slug: "durga-puja",
    nameEn: "Durga Puja 2026",
    nameBn: "দুর্গাপূজা ২০২৬",
    titleTag:
      "Durga Puja 2026 Date in Bangladesh & Temple Updates — Guardian of Temples",
    metaDescription:
      "Complete guide for Durga Puja 2026 in Bangladesh (Oct 16-20). View live verified mandap updates, daily tithi schedules, and area safety information.",
    date2026: "October 16 – October 20, 2026 (মহা ষষ্ঠী থেকে বিজয়া দশমী)",
    dateStartIso: "2026-10-16",
    dateEndIso: "2026-10-20",
    introText:
      "Durga Puja in Bangladesh is far more than a religious ritual; it is the grandest socio-cultural festival of the Bengali Hindu community. Across thousands of puja mandaps nationwide—from historic urban sites like Dhakeshwari National Temple and Ramna Kali Mandir in Dhaka to traditional neighborhood pratima mandaps in Old Dhaka, Chattogram, Sylhet, and Dinajpur—the atmosphere comes alive with the rhythm of dhak drums, pristine alpona artwork, and evening arati. Families reunite, elders bless children with prasad, and visitors of all backgrounds join in pandal hopping. The festival culminates in the vibrant Dashami shobhajatra, where pratimas (idols) are respectfully immersed in rivers like the Buriganga, Karnaphuli, and Shitalakshya amidst prayers for peace, harmony, and community well-being.",
    culturalHighlights: [
      "Mahalaya & Chandi Path Broadcasts",
      "Traditional Dhunuchi Naach & Dhak Beats",
      "Sandhi Puja & Kumari Puja (At select historical mandirs)",
      "Bijoya Dashami Greetings & Pratima Bisan (Immersion)",
    ],
  },
  "kali-puja": {
    slug: "kali-puja",
    nameEn: "Kali Puja 2026 (Shyama Puja)",
    nameBn: "শ্যামাপূজা / কালীপূজা ২০২৬",
    titleTag:
      "Kali Puja 2026 Date in Bangladesh & Mandir List — Guardian of Temples",
    metaDescription:
      "Explore Kali Puja 2026 (Shyama Puja) celebrations in Bangladesh (November 8, 2026). View midnight puja schedules, traditional lamp illumination, and temple safety updates.",
    date2026: "November 8, 2026 (কার্তিক অমাবস্যা)",
    dateStartIso: "2026-11-08",
    dateEndIso: "2026-11-08",
    introText:
      "Kali Puja, affectionately known across Bengal as Shyama Puja or Dipabali, is celebrated with deep devotion during the dark lunar night of Kartik Amavasya. In Bangladesh, major Shaktipeeths and ancient Kali mandirs—such as Jeshoreshwari Kali Temple in Satkhira, Chatteshwari Temple in Chattogram, and Ramna Kali Mandir—adorn their premises with thousands of glowing clay lamps (pradeep) and vibrant marigold garlands. Worshippers observe strict fasts until midnight, when solemn tantrik and vedic rituals invoke Mother Kali as the dispeller of darkness, ignorance, and fear. Special khichuri prasad and sweetmeats are distributed to devotees through the night, reflecting an enduring tradition of spiritual devotion and community unity.",
    culturalHighlights: [
      "Midnight Kali Puja Worship & Tantrik Protocols",
      "Traditional Dipabali Clay Lamp Illumination (প্রদীপ প্রজ্জ্বলন)",
      "Special Anna-Koot & Khichuri Prasad Distribution",
      "Shaktipeeth Pilgrimage & Midnight Arati",
    ],
  },
  "saraswati-puja": {
    slug: "saraswati-puja",
    nameEn: "Saraswati Puja 2026",
    nameBn: "সরস্বতী পূজা ২০২৬",
    titleTag:
      "Saraswati Puja 2026 Date in Bangladesh & Student Celebrations — Guardian of Temples",
    metaDescription:
      "Saraswati Puja 2026 date in Bangladesh (January 23, 2026). Discover Vasant Panchami school mandap preparations, hate khori rituals, and temple updates.",
    date2026: "January 23, 2026 (মাঘী বসন্ত পঞ্চমী)",
    dateStartIso: "2026-01-23",
    dateEndIso: "2026-01-23",
    introText:
      "Saraswati Puja marks the joyful arrival of spring (Vasant Panchami) and celebrates Goddess Saraswati as the embodiment of wisdom, learning, music, and the arts. In Bangladesh, this festival holds a cherished place among students, schools, colleges, and university campuses—most notably Jagannath Hall at Dhaka University, where dozens of artistic mandaps are crafted by students of different departments. Young children dress in traditional basanti (yellow) attire to perform their first formal writing ceremony ('Hate Khori') under the guidance of elders. Books, notebooks, and musical instruments are placed at the feet of the deity for blessings, making it one of the most vibrant and youthful cultural observances in the country.",
    culturalHighlights: [
      "Student Hate Khori (হাতে খড়ি) Childhood Literacy Ritual",
      "Basanti (Yellow) Attire & Spring Celebrations",
      "University Campus & School Mandap Displays",
      "Offerings of Books, Pens, and Musical Instruments",
    ],
  },
  "lakshmi-puja": {
    slug: "lakshmi-puja",
    nameEn: "Lakshmi Puja 2026 (Kojagari Lakshmi Puja)",
    nameBn: "কোজাগরী লক্ষ্মী পূজা ২০২৬",
    titleTag:
      "Kojagari Lakshmi Puja 2026 Date in Bangladesh — Guardian of Temples",
    metaDescription:
      "Kojagari Lakshmi Puja 2026 in Bangladesh (October 25, 2026). Learn about household rice-paste alpona artwork, full moon rituals, and temple events.",
    date2026: "October 25, 2026 (আশ্বিন পূর্ণিমা)",
    dateStartIso: "2026-10-25",
    dateEndIso: "2026-10-25",
    introText:
      "Kojagari Lakshmi Puja takes place on the radiant full moon night (Kojagari Purnima) immediately following Durga Puja. The word 'Kojagari' originates from 'Ko Jagarti' ('Who is awake?'), as tradition holds that Goddess Lakshmi visits households that remain awake in prayer and purity through the moonlit night. In Bangladeshi households and community temples alike, women create intricate rice-paste footprint alpona leading from the doorstep into the prayer altar to symbolize welcoming peace and prosperity. Offerings of freshly harvested paddy sheaves (dhaner shish), coconut laddoos (naru), and flattened rice (chira) celebrate agrarian roots and family blessings.",
    culturalHighlights: [
      "Intricate Rice-Paste Footprint Alpona (লক্ষ্মীর আলপনা)",
      "Full Moon Midnight Prayer & Vigil",
      "Offerings of Fresh Harvest Paddy (ধানের ছড়া) & Naru",
      "Family Household Worship & Prosperity Blessings",
    ],
  },
  janmashtami: {
    slug: "janmashtami",
    nameEn: "Janmashtami 2026",
    nameBn: "শ্রীশ্রী জন্মাষ্টমী ২০২৬",
    titleTag:
      "Janmashtami 2026 Date in Bangladesh & Shobhajatra Routes — Guardian of Temples",
    metaDescription:
      "Janmashtami 2026 date in Bangladesh (September 3, 2026). View national public holiday processions, Dhakeshwari temple events, and safety notices.",
    date2026: "September 3, 2026 (ভাদ্র কৃষ্ণা অষ্টমী)",
    dateStartIso: "2026-09-03",
    dateEndIso: "2026-09-03",
    introText:
      "Janmashtami marks the auspicious birth of Lord Sri Krishna and is recognized as an official national public holiday in Bangladesh. The centerpiece of nationwide celebrations is the historic Janmashtami Shobhajatra (grand colorful procession), organized jointly by the Bangladesh Puja Udjapan Parishad and Mahanagar Sarbajanin Puja Committee. Starting from Dhakeshwari National Temple and winding through Old Dhaka, thousands of devotees, children dressed as Bal Gopal and Radha, floats depicting Krishna-leela, and kirtan troupes parade peacefully. Temples across all 64 districts hold day-long fasts, midnight abhishekam, and butter/makhan offerings amidst joyous chanting of the Hare Krishna mahamantra.",
    culturalHighlights: [
      "National Public Holiday Procession (ঐতিহাসিক জন্মাষ্টমী শোভাযাত্রা)",
      "Children's Krishna-Radha Dress Competitions & Floats",
      "Midnight Birth Abhishekam & Makhan Mishri Offerings",
      "Akhanda Harinam Sankirtan at Community Temples",
    ],
  },
  "rath-yatra": {
    slug: "rath-yatra",
    nameEn: "Rath Yatra 2026",
    nameBn: "শ্রীশ্রী রথযাত্রা ২০২৬",
    titleTag:
      "Rath Yatra 2026 Date in Bangladesh & Chariot Processions — Guardian of Temples",
    metaDescription:
      "Rath Yatra 2026 date in Bangladesh (July 16, 2026). Explore Dhamrai Jagannath Rath Yatra, ISKCON chariot routes, and temple festival schedules.",
    date2026: "July 16, 2026 (আষাঢ় শুক্লা দ্বিতীয়)",
    dateStartIso: "2026-07-16",
    dateEndIso: "2026-07-24",
    introText:
      "Rath Yatra, the sacred chariot festival of Lord Jagannath, Sri Balabhadra, and Devi Subhadra, is celebrated with immense fervor across Bangladesh. The most renowned historic chariot procession takes place at Dhamrai in Dhaka district, home to the centuries-old wooden Dhamrai Jagannath Rath, drawing tens of thousands of pilgrims. Major ISKCON centers and regional Jagannath temples in Dhaka, Chattogram, Sylhet, and Comilla also pull grand decorated chariots through city streets. Devotees consider pulling the chariot ropes (rashi) an act of deep spiritual merit. The 9-day celebration concludes with Ulto Rath Yatra (the return chariot journey), accompanied by traditional village fairs (Rather Mela) selling wooden toys and sweet delicacies.",
    culturalHighlights: [
      "Historic Dhamrai Jagannath Chariot Pulling (ধামরাই রথযাত্রা)",
      "Chariot Rope Pulling (রথের রশি টানা) & Prasadam Distribution",
      "9-Day Ulto Rath Yatra Return Festival",
      "Traditional Village Rather Mela (রথের মেলা) Crafts & Sweets",
    ],
  },
};

export async function generateMetadata({
  params,
}: FestivalPageProps): Promise<Metadata> {
  const fest = FESTIVALS_DATA[params.festivalSlug];

  if (!fest) {
    return {
      title: "Festival Not Found | Guardian of Temples",
    };
  }

  return {
    title: {
      absolute: fest.titleTag,
    },
    description: fest.metaDescription,
    alternates: {
      canonical: `/festivals/${fest.slug}`,
    },
    openGraph: {
      title: fest.titleTag,
      description: fest.metaDescription,
      url: `/festivals/${fest.slug}`,
    },
  };
}

export default async function FestivalHubPage({ params }: FestivalPageProps) {
  const fest = FESTIVALS_DATA[params.festivalSlug];

  if (!fest) {
    notFound();
  }

  // Replace `const supabase = createClient();` with this:
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Query database for temples that prominently celebrate this festival
  const { data: notableTemples } = await supabase
    .from("temples")
    .select(
      "id, slug, name, address_text, is_verified, cover_image_url, districts(name_en, name_bn)"
    )
    .contains("notable_festivals", [fest.slug])
    .limit(10);

  // Fallback query if notable_festivals is not populated yet: fetch top verified temples
  const { data: fallbackTemples } =
    !notableTemples || notableTemples.length === 0
      ? await supabase
          .from("temples")
          .select(
            "id, slug, name, address_text, is_verified, cover_image_url, districts(name_en, name_bn)"
          )
          .order("is_verified", { ascending: false })
          .limit(6)
      : { data: null };

  const displayTemples =
    notableTemples && notableTemples.length > 0
      ? notableTemples
      : fallbackTemples || [];

  // Schema.org Event JSON-LD
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${fest.nameEn} (${fest.nameBn})`,
    startDate: fest.dateStartIso,
    endDate: fest.dateEndIso,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Temples & Mandaps Across Bangladesh",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BD",
      },
    },
    description: fest.metaDescription,
    organizer: {
      "@type": "Organization",
      name: "Guardian of Temples Community Network",
      url: "https://guardianoftemples.online",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <main className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Festival Header Card */}
        <section className="glass-card rounded-3xl p-6 sm:p-10 border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-slate-900/5 dark:to-slate-950/40 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>বাংলাদেশ উৎসব ও পঞ্জিকা গাইড</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {fest.nameEn}{" "}
            <span className="text-orange-600 dark:text-orange-400">
              ({fest.nameBn})
            </span>
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Expected 2026 Dates: {fest.date2026}</span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            {fest.introText}
          </p>
        </section>

        {/* Cultural Highlights Grid */}
        <section className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Key Observances & Cultural Highlights in Bangladesh</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fest.culturalHighlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80"
              >
                <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Associated Temples Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Church className="h-5 w-5 text-primary-500" />
                <span>Prominent Temples Known for {fest.nameEn}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore registered community mandirs celebrating this festival.
              </p>
            </div>

            <Link
              href="/panjika"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Check Today's Panjika</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayTemples.map((temple) => {
              const districtName =
                (temple.districts as any)?.name_en || "Bangladesh";
              return (
                <Link
                  key={temple.id}
                  href={`/temple/${temple.slug || temple.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/50 transition-all shadow-sm group"
                >
                  <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {temple.cover_image_url ? (
                      <img
                        src={temple.cover_image_url}
                        alt={temple.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Church className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {temple.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                      <span className="truncate">{districtName} District</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Panjika Callout Banner */}
        <section className="rounded-3xl glass-card p-6 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              আজকের তিথি ও পূজার সময়সূচী খুঁজছেন?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              বাংলা পঞ্জিকার সঠিক ব্রত, তিথি এবং উৎসবের নির্ঘণ্ট দেখুন আমাদের
              ডিজিটাল পঞ্জিকায়।
            </p>
          </div>
          <Link
            href="/panjika"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C08A34] hover:bg-[#A8792D] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all shrink-0 active:scale-95"
          >
            <span>পঞ্জিকা দেখুন</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </>
  );
}
