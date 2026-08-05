"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (authData?.user) {
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      // Query profile role for smart redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const role = profile?.role ?? "user";

      if (role === "admin") {
        router.push("/admin");
      } else if (role === "verifier") { // Updated from moderator to match database
        router.push("/moderator");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Sign In
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your account, submit reports, or manage verification
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-3.5 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="user@example.com"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

// Wrapping the main component in a Suspense boundary for Next.js build compliance
export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center p-4">
          <div className="text-sm text-slate-500">Loading secure login...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}