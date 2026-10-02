import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";

const DEFAULT_URL = "http://localhost:54321";
const DEFAULT_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYWR2c2tudmZqdHJvcGpreXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Mjk2MzMsImV4cCI6MjEwNjUwNTYzM30.KiSB8wK3qgqd4PXZb-uvmXJXSBVx2bOrxCjuwAFaRSs";

function getServerUrl(url: string) {
  // Only remap to host.docker.internal when actually running inside Docker
  if (process.env.IS_DOCKER === "true") {
    return url
      .replace("localhost", "host.docker.internal")
      .replace("127.0.0.1", "host.docker.internal");
  }
  return url;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const url = getServerUrl(rawUrl);
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;

  const supabase = createServerClient(
    url,
    key,
    {
      cookieOptions: {
        name: "sb-auth-token",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options }),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({ name, value, ...options }),
          );
        },
      },
    },
  );

  // Refresh auth token with a timeout to prevent the proxy from hanging if
  // Supabase is unreachable (e.g. inside Docker with a local Supabase instance).
  // On timeout, we pass the request through — client-side auth handles the rest.
  let user = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase proxy timeout")), 4000),
      ),
    ]);
    user = result.data.user;
  } catch {
    // Supabase unreachable or timed out — let the request pass through.
    // The browser-side Supabase client will handle auth state.
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/login/" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname === "/register/" ||
    pathname.startsWith("/register/");
  const isPublicPage =
    isAuthPage ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/api/supabase-test");

  // If user is not logged in and trying to access protected route (like /)
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access login or register page
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public static files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
