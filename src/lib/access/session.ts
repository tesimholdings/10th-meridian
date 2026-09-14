import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import type { AppRole } from "@/lib/data/types";
import { APP_ROLES } from "@/lib/data/types";
import {
  ACCOUNT_COOKIE,
  cookieOptions,
  OPEN_HOUSE_FORCE_COOKIE,
  readSigned,
  REFERRAL_COOKIE,
  ROLE_COOKIE,
  signedValue,
} from "@/lib/access/cookies";

export {
  ACCOUNT_COOKIE,
  cookieOptions,
  OPEN_HOUSE_FORCE_COOKIE,
  readSigned,
  REFERRAL_COOKIE,
  ROLE_COOKIE,
  signedValue,
};

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isDemo: boolean;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isRole(value: string | null): value is AppRole {
  return Boolean(value && (APP_ROLES as readonly string[]).includes(value));
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const roleRaw = readSigned(jar.get(ROLE_COOKIE)?.value);
  const accountRaw = readSigned(jar.get(ACCOUNT_COOKIE)?.value);
  if (!isRole(roleRaw)) return null;
  const parsed = accountRaw ? safeJson(accountRaw) : null;
  return {
    id: parsed?.id ?? `preview-${roleRaw}`,
    email: parsed?.email ?? `${roleRaw}@preview.10thmeridian.test`,
    name: parsed?.name ?? previewName(roleRaw),
    role: roleRaw,
    isDemo: parsed?.isDemo ?? true,
  };
}

export async function getReferralGrant(): Promise<string | null> {
  const jar = await cookies();
  return readSigned(jar.get(REFERRAL_COOKIE)?.value);
}

function safeJson(raw: string): { id?: string; email?: string; name?: string; isDemo?: boolean } | null {
  try {
    return JSON.parse(raw) as {
      id?: string;
      email?: string;
      name?: string;
      isDemo?: boolean;
    };
  } catch {
    return null;
  }
}

function previewName(role: AppRole): string {
  if (role === "administrator") return "Preview Steward";
  if (role === "moderator") return "Preview Moderator";
  if (role === "member") return "A. Voss";
  if (role === "approved_unpaid") return "Approved Guest";
  if (role === "applicant") return "Applicant";
  return "Guest";
}
