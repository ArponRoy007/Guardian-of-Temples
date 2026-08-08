import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Church } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: "Guardian of Temples | Celebrate, Connect, Stay Informed",
description:
  "Follow live updates and photos from Durga Puja celebrations at temples across Bangladesh, verified directly by temple committees. Check area safety information before you visit, and help build a trusted, community-powered platform for temples nationwide.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-primary-500 selection:text-white flex flex-col">
        
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

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-20 md:pb-8">{children}</main>
            <Footer />
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}