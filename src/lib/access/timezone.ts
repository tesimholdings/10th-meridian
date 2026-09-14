const FALLBACK_TZ = "America/Chicago";

export function isValidIanaTimeZone(tz: string): boolean {
  if (!tz || tz.length < 3) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** Server evaluates Open House in the visitor's IANA TZ. Invalid or missing → America/Chicago. */
export function resolveVisitorTimeZone(input?: string | null): string {
  const candidate = (input ?? "").trim();
  if (isValidIanaTimeZone(candidate)) return candidate;
  return FALLBACK_TZ;
}

export const OPEN_HOUSE_FALLBACK_TZ = FALLBACK_TZ;
export const VISITOR_TZ_COOKIE = "tm_tz";
