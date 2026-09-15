import { cookies } from "next/headers";
import { env, hasSupabase } from "@/lib/env";
import {
  ACCOUNT_COOKIE,
  cookieOptions,
  ROLE_COOKIE,
  signedValue,
} from "@/lib/access/cookies";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseServerWithCookies } from "@/lib/supabase/cookies";

export type AuthMode = "supabase" | "demo";

export function authMode(): AuthMode {
  return hasSupabase() ? "supabase" : "demo";
}

export type PasswordSignInInput = {
  email: string;
  password: string;
};

export type AuthAttempt =
  | { ok: true; mode: AuthMode }
  | { ok: false; mode: AuthMode; reason: "invalid" | "demo-disabled" | "oauth-not-wired" };

/**
 * Email + password only. Social OAuth is deferred — do not add providers here.
 */
export async function signInWithPassword(
  input: PasswordSignInInput,
): Promise<AuthAttempt> {
  const supabase = getSupabaseServer();
  if (supabase && input.password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user) {
      return { ok: false, mode: "supabase", reason: "invalid" };
    }
    return { ok: true, mode: "supabase" };
  }

  if (!env.previewDemoAuth) {
    return { ok: false, mode: "demo", reason: "demo-disabled" };
  }

  const jar = await cookies();
  jar.set(ROLE_COOKIE, signedValue("member"), { ...cookieOptions, maxAge: 60 * 60 * 12 });
  jar.set(
    ACCOUNT_COOKIE,
    signedValue(
      JSON.stringify({
        id: "preview-member",
        email: input.email,
        name: "A. Voss",
        isDemo: true,
      }),
    ),
    { ...cookieOptions, maxAge: 60 * 60 * 12 },
  );
  return { ok: true, mode: "demo" };
}

export async function signOutCurrent(): Promise<{ mode: AuthMode }> {
  const mode = authMode();
  if (mode === "supabase") {
    const supabase = await getSupabaseServerWithCookies();
    await supabase?.auth.signOut();
  }
  const jar = await cookies();
  jar.delete(ROLE_COOKIE);
  jar.delete(ACCOUNT_COOKIE);
  return { mode };
}

/**
 * PKCE / magic-link callback. Not social OAuth.
 * Missing env or missing code is a no-op so the house still opens in demo.
 */
export async function exchangeAuthCode(code: string | null): Promise<{
  exchanged: boolean;
  mode: AuthMode;
}> {
  if (!code || !hasSupabase()) {
    return { exchanged: false, mode: authMode() };
  }
  const supabase = await getSupabaseServerWithCookies();
  if (!supabase) return { exchanged: false, mode: "demo" };
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { exchanged: !error, mode: "supabase" };
}

/** Explicitly unused. Social OAuth is later — do not build it on this branch. */
export function socialOAuthNotWired(): AuthAttempt {
  return { ok: false, mode: authMode(), reason: "oauth-not-wired" };
}
