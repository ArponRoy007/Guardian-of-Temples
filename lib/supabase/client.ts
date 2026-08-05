import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a client-side Supabase client instance for use in Client Components.
 * Note: `@supabase/ssr` is the official modern replacement for `@supabase/auth-helpers-nextjs`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
