import { createHmac, timingSafeEqual } from "node:crypto";

export const ROLE_COOKIE = "tm_role";
export const REFERRAL_COOKIE = "tm_referral";
export const ACCOUNT_COOKIE = "tm_account";
export const OPEN_HOUSE_FORCE_COOKIE = "tm_oh_force";

function secret() {
  return process.env.SESSION_SECRET || "preview-only-not-for-production";
}

export function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function signedValue(value: string): string {
  return `${value}.${sign(value)}`;
}

export function readSigned(raw: string | undefined): string | null {
  if (!raw) return null;
  const idx = raw.lastIndexOf(".");
  if (idx <= 0) return null;
  const value = raw.slice(0, idx);
  const mac = raw.slice(idx + 1);
  const expected = sign(value);
  try {
    const a = Buffer.from(mac, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return value;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
