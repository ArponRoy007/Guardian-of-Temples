import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Church } from "lucide-react";
import PushManager from "@/app/components/PushManager";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://guardianoftemples.online"),
  title: {
    default: "Guardian of Temples | Celebrate, Connect, Stay Informed",
    template: "%s | Guardian of Temples",
  },
  description:
    "Follow live updates and photos from Durga Puja celebrations at temples across Bangladesh, verified directly by temple committees. Check area safety information before you visit, and help build a trusted, community-powered platform for temples nationwide.",
  keywords: [
    // High-Intent English Keywords
    "Hindu temples in Bangladesh",
    "Bangladesh temple directory",
    "Hindu temple map Bangladesh",
    "live temple updates Bangladesh",
    "Durga Puja 2026 Bangladesh",
    "Janmashtami 2026 Bangladesh",
    "historic Hindu temples in Bangladesh",

    // High-Volume Bangla (Bengali) Keywords
    "বাংলাদেশের হিন্দু মন্দির", // Hindu temples in Bangladesh
    "দুর্গাপূজা ২০২৬", // Durga Puja 2026
    "আজকের তিথি", // Today's tithi (High daily search volume)
    "পূজার সময়সূচী", // Puja schedule
    "কাছের হিন্দু মন্দির", // Hindu temples near me
    "শক্তিপীঠ বাংলাদেশ", // Shakti Peethas Bangladesh
    "ঢাকেশ্বরী মন্দির", // Dhakeshwari temple
    "বাংলাদেশের প্রাচীন মন্দির", // Ancient temples in Bangladesh
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Guardian of Temples | Celebrate, Connect, Stay Informed",
    description:
      "Follow live updates, verified photos, and area safety information from temples across Bangladesh. Join the community-powered platform.",
    url: "https://guardianoftemples.online",
    siteName: "Guardian of Temples",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Guardian of Temples - Community Platform Bangladesh",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guardian of Temples | Celebrate, Connect, Stay Informed",
    description:
      "Follow live updates, verified photos, and area safety information from temples across Bangladesh.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://guardianoftemples.online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Corrected variable name here
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Guardian of Temples",
    url: "https://guardianoftemples.online",
    logo: "https://guardianoftemples.online/favicon.svg",
    email: "official@guardianoftemples.online",
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-primary-500 selection:text-white flex flex-col">
        {/* 2. INJECT THE SCHEMA INTO THE DOM */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {/* MANUAL SPLASH SCREEN OVERLAY */}
        <div
          id="app-splash-screen"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500"
        >
          <div className="flex flex-col items-center space-y-4 animate-pulse">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-2xl">
              <Church className="h-10 w-10 animate-bounce" />
            </div>
            <div className="text-center space-y-1">
              <h1 className="font-display text-xl font-bold tracking-tight text-white">
                Guardian of Temples
              </h1>
              <p className="text-xs text-slate-400">Bangladesh</p>
            </div>
          </div>
        </div>

        {/* CLIENT SCRIPT TO HIDE SPLASH ON LOAD */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function () {
                const splash = document.getElementById('app-splash-screen');
                if (splash) {
                  splash.style.opacity = '0';
                  setTimeout(() => splash.remove(), 500);
                }
              });
            `,
          }}
        />

        <PushManager />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-20 md:pb-8">{children}</main>
            <Footer />
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
