"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Mail, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";

// Initialize standard Supabase client using your public environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SupportPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const issue_type = formData.get("issue_type") as string;
    const message = formData.get("message") as string;

    const { error } = await supabase
      .from("support_tickets")
      .insert([{ name, email, issue_type, message }]);

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">
          Contact Support
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Have an issue or need to correct temple information? Let us know below.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold">Ticket Submitted!</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our moderation team will review your request and get back to you shortly.
            </p>
            <button 
              onClick={() => setStatus("idle")}
              className="mt-4 px-4 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              Submit another ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Issue Type</label>
              <select
                required
                name="issue_type"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:bg-slate-900"
              >
                <option value="account">Account / Login Issue</option>
                <option value="data_correction">Temple Data Correction</option>
                <option value="bug">Report a Bug</option>
                <option value="safety">Safety Concern</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                required
                name="message"
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                placeholder="Please describe your issue in detail..."
              ></textarea>
            </div>

            {status === "error" && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Something went wrong. Please try again.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  Submit Ticket
                </>
              )}
            </button>
          </form>
        )}
      </div>
      
      <div className="mt-8 text-center flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
        <Mail className="h-5 w-5" />
        <p className="text-sm">Or email us directly at: <a href="supportteamofgot21@gmail.com" className="text-primary-600 hover:underline">supportteamofgot21@gmail.com</a></p>
      </div>
    </div>
  );
}