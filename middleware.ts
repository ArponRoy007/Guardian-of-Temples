import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // ADDED: Explicit type for cookiesToSet to fix Vercel build
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define protected path patterns
  const isAuthRequired =
    pathname.startsWith("/submit-incident") ||
    pathname.startsWith("/my-submissions") ||
    pathname.startsWith("/profile");

  const isModeratorPath = pathname.startsWith("/moderator");
  const isAdminPath = pathname.startsWith("/admin");

  if (isAuthRequired || isModeratorPath || isAdminPath) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Fetch user profile role from Supabase DB
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "user";

    // ADDED: Changed "moderator" to "verifier" to match your DB schema
    if (isModeratorPath && role !== "verifier" && role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", request.url));
    }

    // Admin path protection (/admin/*)
    if (isAdminPath && role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/submit-incident/:path*",
    "/my-submissions/:path*",
    "/profile/:path*",
    "/moderator/:path*",
    "/admin/:path*",
  ],
};