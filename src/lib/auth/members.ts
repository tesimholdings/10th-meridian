import type { AppRole } from "@/lib/data/types";
import { APP_ROLES } from "@/lib/data/types";

/**
 * Real house accounts. Emails are public aliases for Auth.
 * Passwords are never stored here — they come from BOOTSTRAP_MEMBER_PASSWORD.
 */
export type FoundingMember = {
  username: string;
  email: string;
  name: string;
  /** Steward is the administrator role. Members stay on member. */
  role: AppRole;
  /** Existing Auth user. Bootstrap updates this id and does not reset its password. */
  authUserId?: string;
};

export const FOUNDING_MEMBERS: readonly FoundingMember[] = [
  {
    username: "stefanfulks",
    email: "stefanfulks@tenmeridian.com",
    name: "Stefan Fulks",
    role: "administrator",
  },
  {
    username: "rickydelvalle",
    email: "rickydelvalle@tenmeridian.com",
    name: "Ricky Del Valle",
    role: "member",
  },
  {
    username: "tenthmeridian",
    email: "tenthmeridian@tenmeridian.com",
    name: "Tenth Meridian",
    role: "administrator",
    authUserId: "1f8b496d-38f4-4346-9cc2-080d335a3fbf",
  },
  {
    username: "patrickromero",
    email: "patrickromero@tenmeridian.com",
    name: "Patrick Romero",
    role: "member",
    authUserId: "9b67ed84-74ff-433a-8cab-d992f3992986",
  },
];

const PREVIEW_EMAIL_DOMAIN = "preview.10thmeridian.test";

export type IdentityLookup = {
  accountEmail: string | null;
  metadataEmail: string | null;
};

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

export function foundingMemberForHandle(raw: string): FoundingMember | null {
  const handle = normalizeHandle(raw);
  if (!handle) return null;
  const local = handle.includes("@") ? (handle.split("@")[0] ?? handle) : handle;
  return (
    FOUNDING_MEMBERS.find(
      (member) =>
        member.username === handle ||
        member.username === local ||
        member.email === handle,
    ) ?? null
  );
}

export function foundingAuthMetadata(member: FoundingMember): {
  username: string;
  name: string;
  full_name: string;
  role: AppRole;
} {
  return {
    username: member.username,
    name: member.name,
    full_name: member.name,
    role: member.role,
  };
}

function isAppRole(value: string | null | undefined): value is AppRole {
  return Boolean(value && (APP_ROLES as readonly string[]).includes(value));
}

/** Map a stored role string. "steward" is the house name for administrator. */
export function mapStoredRole(raw: string | null | undefined): AppRole | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (value === "steward" || value === "admin") return "administrator";
  if (isAppRole(value)) return value;
  return null;
}

/**
 * Profile role wins, then the account row, then Auth metadata.
 * A guest placeholder does not override the founding directory.
 */
export function resolveSessionRole(input: {
  profileRole?: string | null;
  accountRole?: string | null;
  metadataRole?: string | null;
  email?: string | null;
  username?: string | null;
}): AppRole {
  const explicit = [input.profileRole, input.accountRole, input.metadataRole]
    .map((role) => mapStoredRole(role))
    .find((role) => role && role !== "guest");
  if (explicit) return explicit;

  const founding =
    foundingMemberForHandle(input.username ?? "") ??
    foundingMemberForHandle(input.email ?? "");
  if (founding) return founding.role;

  return (
    [input.profileRole, input.accountRole, input.metadataRole]
      .map((role) => mapStoredRole(role))
      .find((role): role is AppRole => Boolean(role)) ?? "member"
  );
}

/**
 * Auth email for a username or email.
 * When Supabase is configured, never invent a preview demo address.
 */
export function chooseSignInEmail(
  identity: string,
  lookup: IdentityLookup,
  options: { supabaseConfigured: boolean },
): string {
  const trimmed = identity.trim();
  if (!trimmed) return "";
  if (lookup.accountEmail?.includes("@")) return lookup.accountEmail.trim();
  if (lookup.metadataEmail?.includes("@")) return lookup.metadataEmail.trim();
  if (trimmed.includes("@")) return trimmed;

  if (options.supabaseConfigured) {
    const founding = foundingMemberForHandle(trimmed);
    if (founding) return founding.email;
    return "";
  }

  return "";
}

export function isPreviewDemoEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${PREVIEW_EMAIL_DOMAIN}`);
}

/**
 * Password sign-in lands in the member shell.
 * Administrator (steward) still carries that role, so /admin remains open.
 */
export function pathAfterPasswordLogin(role: AppRole): string {
  if (role === "approved_unpaid") return "/member/billing";
  return "/member/home";
}
