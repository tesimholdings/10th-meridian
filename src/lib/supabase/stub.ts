/**
 * In-process stub used when Supabase env vars are absent.
 * Preview/review can exercise flows without live credentials.
 */

export type StubTable =
  | "applications"
  | "reminders"
  | "referrals_audit"
  | "profiles"
  | "membership_events"
  | "memberships";

const store: Record<StubTable, Record<string, unknown>[]> = {
  applications: [],
  reminders: [],
  referrals_audit: [],
  profiles: [],
  membership_events: [],
  memberships: [],
};

export function stubInsert(table: StubTable, row: Record<string, unknown>) {
  const record = { id: `${table}-${store[table].length + 1}`, ...row, created_at: new Date().toISOString() };
  store[table].push(record);
  return record;
}

export function stubList(table: StubTable) {
  return [...store[table]];
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}
