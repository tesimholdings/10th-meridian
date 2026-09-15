import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "@/lib/env";

/** Cookie-less server client for one-off reads. Null when env is missing. */
export function getSupabaseServer(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Service-role client. Never import from client components. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!hasSupabase() || !env.supabaseServiceRoleKey) return null;
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
