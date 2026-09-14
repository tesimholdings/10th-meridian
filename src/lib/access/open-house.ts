import { env } from "@/lib/env";
import type { AppRole } from "@/lib/data/types";
import { resolveVisitorTimeZone } from "@/lib/access/timezone";

export type WindowPhase =
  | "locked"
  | "referral_early"
  | "open_house"
  | "always_member";

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
  timeZone: string;
}

export interface OpenHouseConfig {
  timeZone: string;
  day: number;
  referralHour: number;
  generalHour: number;
  closeHour: number;
  force: "auto" | "open" | "closed";
}

export interface AccessDecision {
  phase: WindowPhase;
  allowed: boolean;
  reason: string;
  isDemo: boolean;
  isMemberAccess: boolean;
  hasReferralGrant: boolean;
  config: OpenHouseConfig;
  now: ZonedParts;
  nextOpenAt: string;
  windowClosesAt: string | null;
  serverNowIso: string;
}

export function getOpenHouseConfig(overrides?: Partial<OpenHouseConfig>): OpenHouseConfig {
  return {
    timeZone: overrides?.timeZone ?? env.openHouseTimezone,
    day: overrides?.day ?? env.openHouseDay,
    referralHour: overrides?.referralHour ?? env.openHouseReferralHour,
    generalHour: overrides?.generalHour ?? env.openHouseGeneralHour,
    closeHour: overrides?.closeHour ?? env.openHouseCloseHour,
    force: overrides?.force ?? env.openHouseForce,
  };
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const bag = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    second: Number(bag.second),
    weekday: bag.weekday,
    timeZone,
  };
}

export function isPrivilegedRole(role: AppRole | null | undefined): boolean {
  return (
    role === "member" ||
    role === "moderator" ||
    role === "administrator" ||
    role === "approved_unpaid"
  );
}

function zonedDate(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  timeZone: string;
}): Date {
  const asUtcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute ?? 0,
    0,
  );
  const probed = zonedParts(new Date(asUtcGuess), parts.timeZone);
  const probedUtc = Date.UTC(
    probed.year,
    probed.month - 1,
    probed.day,
    probed.hour,
    probed.minute,
    probed.second,
  );
  const delta = asUtcGuess - probedUtc;
  return new Date(asUtcGuess + delta);
}

export function nextOpenHouseStart(from: Date, config: OpenHouseConfig): Date {
  for (let offset = 0; offset <= 40; offset++) {
    const cursor = new Date(from.getTime() + offset * 24 * 60 * 60 * 1000);
    const p = zonedParts(cursor, config.timeZone);
    if (p.day === config.day) {
      const start = zonedDate({
        year: p.year,
        month: p.month,
        day: p.day,
        hour: config.referralHour,
        timeZone: config.timeZone,
      });
      if (start.getTime() > from.getTime()) return start;
    }
  }
  const fallback = new Date(from);
  fallback.setUTCDate(fallback.getUTCDate() + 30);
  return fallback;
}

export function windowClose(from: Date, config: OpenHouseConfig): Date | null {
  const p = zonedParts(from, config.timeZone);
  if (p.day !== config.day) return null;
  return zonedDate({
    year: p.year,
    month: p.month,
    day: p.day,
    hour: config.closeHour,
    timeZone: config.timeZone,
  });
}

export function evaluateOpenHouse(input: {
  now?: Date;
  role?: AppRole | null;
  hasValidReferral?: boolean;
  visitorTimeZone?: string | null;
  config?: Partial<OpenHouseConfig>;
}): AccessDecision {
  const visitorTz = resolveVisitorTimeZone(input.visitorTimeZone ?? input.config?.timeZone);
  const config = getOpenHouseConfig({
    ...input.config,
    timeZone: visitorTz,
  });
  const nowDate = input.now ?? new Date();
  const now = zonedParts(nowDate, config.timeZone);
  const role = input.role ?? "guest";
  const hasReferralGrant = Boolean(input.hasValidReferral);
  const nextOpen = nextOpenHouseStart(nowDate, config);
  const closes = windowClose(nowDate, config);

  if (isPrivilegedRole(role)) {
    return {
      phase: "always_member",
      allowed: true,
      reason: "Active members and stewards may enter at any hour.",
      isDemo: false,
      isMemberAccess: true,
      hasReferralGrant,
      config,
      now,
      nextOpenAt: nextOpen.toISOString(),
      windowClosesAt: closes?.toISOString() ?? null,
      serverNowIso: nowDate.toISOString(),
    };
  }

  if (config.force === "closed") {
    return {
      phase: "locked",
      allowed: false,
      reason: "The house is closed.",
      isDemo: false,
      isMemberAccess: false,
      hasReferralGrant,
      config,
      now,
      nextOpenAt: nextOpen.toISOString(),
      windowClosesAt: null,
      serverNowIso: nowDate.toISOString(),
    };
  }

  if (config.force === "open") {
    return {
      phase: "open_house",
      allowed: true,
      reason: "Open House is forced open for preview.",
      isDemo: true,
      isMemberAccess: false,
      hasReferralGrant,
      config,
      now,
      nextOpenAt: nextOpen.toISOString(),
      windowClosesAt: closes?.toISOString() ?? nextOpen.toISOString(),
      serverNowIso: nowDate.toISOString(),
    };
  }

  const onDay = now.day === config.day;
  const minutes = now.hour * 60 + now.minute;
  const referralMinutes = config.referralHour * 60;
  const generalMinutes = config.generalHour * 60;
  const closeMinutes = config.closeHour * 60;

  if (onDay && minutes >= referralMinutes && minutes < closeMinutes) {
    if (minutes < generalMinutes && !hasReferralGrant) {
      return {
        phase: "referral_early",
        allowed: false,
        reason: "Referral holders may enter from 9:00 a.m. local time. General doors open at 10:00 a.m. local time.",
        isDemo: true,
        isMemberAccess: false,
        hasReferralGrant,
        config,
        now,
        nextOpenAt: zonedDate({
          year: now.year,
          month: now.month,
          day: now.day,
          hour: config.generalHour,
          timeZone: config.timeZone,
        }).toISOString(),
        windowClosesAt: closes?.toISOString() ?? null,
        serverNowIso: nowDate.toISOString(),
      };
    }
    return {
      phase: minutes < generalMinutes ? "referral_early" : "open_house",
      allowed: true,
      reason:
        minutes < generalMinutes
          ? "Referral early hour. Guest access ends when the window closes."
          : "Open House is in session. Guest access ends at 10:00 p.m. local time.",
      isDemo: true,
      isMemberAccess: false,
      hasReferralGrant,
      config,
      now,
      nextOpenAt: nextOpen.toISOString(),
      windowClosesAt: closes?.toISOString() ?? null,
      serverNowIso: nowDate.toISOString(),
    };
  }

  return {
    phase: "locked",
    allowed: false,
    reason: "The doors open on the tenth.",
    isDemo: false,
    isMemberAccess: false,
    hasReferralGrant,
    config,
    now,
    nextOpenAt: nextOpen.toISOString(),
    windowClosesAt: null,
    serverNowIso: nowDate.toISOString(),
  };
}

export const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/remind",
  "/legal",
  "/referral",
  "/robots.txt",
  "/sitemap.xml",
];

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/remind") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/referral") ||
    pathname.startsWith("/api/open-house") ||
    pathname.startsWith("/api/referrals") ||
    pathname.startsWith("/api/reminders") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/stripe/webhook")
  );
}

export function isMemberPath(pathname: string): boolean {
  return (
    pathname.startsWith("/member") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin")
  );
}

export function isOpenHousePath(pathname: string): boolean {
  return (
    pathname.startsWith("/open-house") ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/demo")
  );
}
