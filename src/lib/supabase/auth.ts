import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ACCOUNT_COOKIE, ROLE_COOKIE } from "@/lib/access/cookies";
import {
  chooseSignInEmail,
  pathAfterPasswordLogin,
  resolveSessionRole,
  type IdentityLookup,
} from "@/lib/auth/members";
import { env, hasSupabase } from "@/lib/env";
import { applyMemberSession, applyUnlockHit } from "@/lib/lock/session";
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

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function metaString(meta: User["user_metadata"], key: string): string | null {
  const value = meta?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

type AccountRow = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  role: string | null;
  username: string | null;
};

function asAccountRow(value: unknown, username: string | null): AccountRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.email !== "string") return null;
  return {
    id: row.id,
    user_id: typeof row.user_id === "string" ? row.user_id : null,
    email: row.email,
    full_name: typeof row.full_name === "string" ? row.full_name : null,
    role: typeof row.role === "string" ? row.role : null,
    username:
      username ?? (typeof row.username === "string" ? row.username : null),
  };
}

async function readAccount(
  admin: SupabaseClient,
  match: { userId?: string; email?: string },
): Promise<AccountRow | null> {
  const withUsername = "id, user_id, email, full_name, role, username";
  const base = "id, user_id, email, full_name, role";
  const run = (columns: string) => {
    const query = admin.from("accounts").select(columns);
    if (match.userId) return query.eq("user_id", match.userId).maybeSingle();
    return query.ilike("email", escapeIlike(match.email ?? "")).maybeSingle();
  };

  const first = await run(withUsername);
  if (!first.error) return asAccountRow(first.data, null);
  if (/username/i.test(first.error.message)) {
    const second = await run(base);
    if (!second.error) return asAccountRow(second.data, null);
  }
  return null;
}

async function readProfile(
  admin: SupabaseClient,
  accountId: string,
): Promise<{ display_name: string | null; role: string | null; username: string | null } | null> {
  const full = await admin
    .from("profiles")
    .select("display_name, role, username")
    .eq("account_id", accountId)
    .maybeSingle();
  if (!full.error && full.data && typeof full.data === "object") {
    const row = full.data as Record<string, unknown>;
    return {
      display_name: typeof row.display_name === "string" ? row.display_name : null,
      role: typeof row.role === "string" ? row.role : null,
      username: typeof row.username === "string" ? row.username : null,
    };
  }
  if (full.error && /role|username/i.test(full.error.message)) {
    const base = await admin
      .from("profiles")
      .select("display_name")
      .eq("account_id", accountId)
      .maybeSingle();
    if (!base.error && base.data && typeof base.data === "object") {
      const row = base.data as Record<string, unknown>;
      return {
        display_name: typeof row.display_name === "string" ? row.display_name : null,
        role: null,
        username: null,
      };
    }
  }
  return null;
}

async function emailFromUsername(
  admin: SupabaseClient,
  username: string,
): Promise<string | null> {
  const safe = escapeIlike(username);
  const accounts = await admin.from("accounts").select("email").ilike("username", safe).limit(2);
  if (!accounts.error && accounts.data?.length === 1) {
    const email = accounts.data[0]?.email;
    if (typeof email === "string" && email.includes("@")) return email;
  }

  const profiles = await admin
    .from("profiles")
    .select("account_id")
    .ilike("username", safe)
    .limit(2);
  if (profiles.error || profiles.data?.length !== 1) return null;
  const accountId = profiles.data[0]?.account_id;
  if (typeof accountId !== "string") return null;
  const account = await admin.from("accounts").select("email").eq("id", accountId).maybeSingle();
  const email = account.data?.email;
  return typeof email === "string" && email.includes("@") ? email : null;
}

async function emailFromAuthMetadata(
  admin: SupabaseClient,
  username: string,
): Promise<string | null> {
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const hit = data.users.find((user) => {
      const handle = metaString(user.user_metadata, "username")?.toLowerCase();
      return handle === username && Boolean(user.email?.includes("@"));
    });
    if (hit?.email) return hit.email;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function lookupMemberEmail(identity: string): Promise<IdentityLookup> {
  const empty: IdentityLookup = { accountEmail: null, metadataEmail: null };
  const admin = getSupabaseAdmin();
  if (!admin) return empty;
  const trimmed = identity.trim();
  if (trimmed.length < 2) return empty;

  if (trimmed.includes("@")) {
    return { accountEmail: trimmed, metadataEmail: null };
  }

  try {
    const username = trimmed.toLowerCase();
    const accountEmail = await emailFromUsername(admin, username);
    if (accountEmail) return { accountEmail, metadataEmail: null };
    const metadataEmail = await emailFromAuthMetadata(admin, username);
    return { accountEmail: null, metadataEmail };
  } catch {
    return empty;
  }
}

async function stampSessionFromAuthUser(user: User): Promise<string> {
  const admin = getSupabaseAdmin();
  let accountRole: string | null = null;
  let profileRole: string | null = null;
  let username = metaString(user.user_metadata, "username");
  let name =
    metaString(user.user_metadata, "name") ||
    metaString(user.user_metadata, "full_name") ||
    user.email ||
    "Member";
  let id = user.id;
  let email = user.email ?? "";

  if (admin) {
    try {
      const row =
        (await readAccount(admin, { userId: user.id })) ??
        (email ? await readAccount(admin, { email }) : null);
      if (row) {
        id = row.id || id;
        email = row.email || email;
        name = row.full_name || name;
        accountRole = row.role;
        username = row.username || username;
        const profile = await readProfile(admin, row.id);
        if (profile) {
          profileRole = profile.role;
          username = profile.username || username;
          name = profile.display_name || name;
        }
        if (!row.user_id) {
          await admin.from("accounts").update({ user_id: user.id }).eq("id", row.id);
        }
      }
    } catch {
      // Cookie stamp still uses Auth user defaults.
    }
  }

  const role = resolveSessionRole({
    profileRole,
    accountRole,
    metadataRole:
      metaString(user.user_metadata, "role") || metaString(user.app_metadata, "role"),
    email,
    username,
  });

  await applyMemberSession({
    id,
    email,
    name: String(name),
    role,
    isDemo: false,
  });
  return pathAfterPasswordLogin(role);
}

export async function resolveSignInEmail(identity: string): Promise<string> {
  const lookup = await lookupMemberEmail(identity);
  const chosen = chooseSignInEmail(identity, lookup, {
    supabaseConfigured: hasSupabase(),
  });
  if (chosen) return chosen;
  if (hasSupabase()) return "";
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
    if (!input.password || !email.includes("@")) {
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
