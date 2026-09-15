import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "@/lib/env";

/**
 * Cookie-aware server client for Auth session refresh.
 * Returns null in demo mode so callers fall back to preview cookies.
 */
export async function getSupabaseServerWithCookies(): Promise<SupabaseClient | null> {
  if (!hasSupabase()) return null;
  const jar = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            jar.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies; middleware/proxy will refresh.
        }
      },
    },
  });
}
