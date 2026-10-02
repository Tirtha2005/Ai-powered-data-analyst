import { createBrowserClient } from "@supabase/ssr";
import { env } from "~/env";
import type { Database } from "~/types/supabase";

const DEFAULT_URL = "http://localhost:54321";
const DEFAULT_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYWR2c2tudmZqdHJvcGpreXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Mjk2MzMsImV4cCI6MjEwNjUwNTYzM30.KiSB8wK3qgqd4PXZb-uvmXJXSBVx2bOrxCjuwAFaRSs";

export function createClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;

  return createBrowserClient<Database>(url, key, {
    cookieOptions: {
      name: "sb-auth-token",
    },
  });
}
