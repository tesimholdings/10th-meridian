import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { ACCOUNT_COOKIE, ROLE_COOKIE } from "@/lib/access/cookies";
import { env, hasSupabase } from "@/lib/env";
import { APP_ROLES, type AppRole } from "@/lib/data/types";
import { applyMemberSession, applyUnlockHit, pathForRole } from "@/lib/lock/session";
import { emailCandidateFromIdentity, resolveLockUnlock } from "@/lib/lock/unlock";
import { getSupabaseAdmin } from "@/lib/supabase/server";
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
  | { ok: true; mode: AuthMode; redirect: string }
  | { ok: false; mode: AuthMode; reason: "invalid" | "demo-disabled" | "oauth-not-wired" };

function isAppRole(value: string | null | undefined): value is AppRole {
  return Boolean(value && (APP_ROLES as readonly string[]).includes(value));
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

async function lookupAccountEmail(identity: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const trimmed = identity.trim();
  if (trimmed.length < 2) return null;
  const safe = escapeIlike(trimmed);

  try {
    if (trimmed.includes("@")) {
      const { data } = await admin
        .from("accounts")
        .select("email")
        .ilike("email", safe)
        .limit(2);
      if (data?.length === 1 && typeof data[0]?.email === "string") return data[0].email;
      return null;
    }

    const { data: byEmail } = await admin
      .from("accounts")
      .select("email")
      .ilike("email", `${safe}@%`)
      .limit(2);
    if (byEmail?.length === 1 && typeof byEmail[0]?.email === "string") {
      return byEmail[0].email;
    }

    const { data: byName } = await admin
      .from("accounts")
      .select("email")
      .ilike("full_name", `%${safe}%`)
      .limit(2);
    if (byName?.length === 1 && typeof byName[0]?.email === "string") {
      return byName[0].email;
    }
  } catch {
    return null;
  }
  return null;
}

async function stampSessionFromAuthUser(user: User): Promise<string> {
  const admin = getSupabaseAdmin();
  let role: AppRole = "member";
  let name = user.user_metadata?.full_name || user.email || "Member";
  let id = user.id;
  let email = user.email ?? "";

  if (admin) {
    try {
      const { data } =
        (await admin
          .from("accounts")
          .select("id, email, full_name, role")
          .eq("user_id", user.id)
          .maybeSingle()) ?? {};
      const row =
        data ??
        (email
          ? (
              await admin
                .from("accounts")
                .select("id, email, full_name, role")
                .ilike("email", email)
                .maybeSingle()
            ).data
          : null);
      if (row) {
        id = typeof row.id === "string" ? row.id : id;
        email = typeof row.email === "string" ? row.email : email;
        name = typeof row.full_name === "string" ? row.full_name : name;
        if (isAppRole(row.role)) role = row.role;
      }
    } catch {
      // Cookie stamp still uses Auth user defaults.
    }
  }

  await applyMemberSession({
    id,
    email,
    name: String(name),
    role,
    isDemo: false,
  });
  return pathForRole(role);
}

export async function resolveSignInEmail(identity: string): Promise<string> {
  const lookedUp = await lookupAccountEmail(identity);
  if (lookedUp) return lookedUp;
  return emailCandidateFromIdentity(identity);
}

/**
 * Email + password only. Social OAuth is deferred — do not add providers here.
 * Uses the cookie-aware client so the Auth session actually persists.
 */
export async function signInWithPassword(
  input: PasswordSignInInput,
): Promise<AuthAttempt> {
  const email = await resolveSignInEmail(input.email);

  if (hasSupabase()) {
    if (!input.password) {
      return { ok: false, mode: "supabase", reason: "invalid" };
    }
    const supabase = await getSupabaseServerWithCookies();
    if (!supabase) {
      return { ok: false, mode: "supabase", reason: "invalid" };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error || !data.user) {
      return { ok: false, mode: "supabase", reason: "invalid" };
    }
    const redirect = await stampSessionFromAuthUser(data.user);
    return { ok: true, mode: "supabase", redirect };
  }

  if (!env.previewDemoAuth) {
    return { ok: false, mode: "demo", reason: "demo-disabled" };
  }

  const hit = resolveLockUnlock(input.email);
  if (hit.kind === "member" || hit.kind === "steward" || hit.kind === "referral") {
    const redirect = await applyUnlockHit(hit);
    return { ok: true, mode: "demo", redirect };
  }

  await applyMemberSession({
    id: "preview-member",
    email: email || input.email,
    name: "A. Voss",
    role: "member",
    isDemo: true,
  });
  return { ok: true, mode: "demo", redirect: "/member/home" };
}

export async function requestPasswordReset(
  identity: string,
): Promise<{ ok: true; mode: AuthMode }> {
  const email = await resolveSignInEmail(identity);
  if (hasSupabase() && email.includes("@")) {
    try {
      const supabase = await getSupabaseServerWithCookies();
      await supabase?.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.siteUrl}/api/auth/callback`,
      });
    } catch {
      // Same public result whether mail was queued or not.
    }
  }
  return { ok: true, mode: authMode() };
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
