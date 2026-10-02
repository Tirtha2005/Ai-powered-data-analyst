import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "~/env";
import type { Database } from "~/types/supabase";

const DEFAULT_URL = "http://localhost:54321";
const DEFAULT_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYWR2c2tudmZqdHJvcGpreXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Mjk2MzMsImV4cCI6MjEwNjUwNTYzM30.KiSB8wK3qgqd4PXZb-uvmXJXSBVx2bOrxCjuwAFaRSs";

function getServerUrl(url: string) {
  return url
    .replace("localhost", "host.docker.internal")
    .replace("127.0.0.1", "host.docker.internal");
}

export async function createClient() {
  const cookieStore = await cookies();
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const url = getServerUrl(rawUrl);
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;

  return createServerClient<Database>(
    url,
    key,
    {
      cookieOptions: {
        name: "sb-auth-token",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignored when called from a Server Component
          }
        },
      },
    },
  );
}
