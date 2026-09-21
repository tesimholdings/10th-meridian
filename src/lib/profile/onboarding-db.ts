import type { SessionUser } from "@/lib/access/session";
import { hasSupabase } from "@/lib/env";
import {
  emptyOnboardingDraft,
  isMemberIntent,
  portraitForColumn,
  type OnboardingDbState,
  type OnboardingDraft,
  type OnboardingStatus,
  type SocialLink,
} from "@/lib/profile/onboarding";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type ProfileOnboardingRow = {
  id?: string;
  display_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  x_url?: string | null;
  social_links?: unknown;
  intents?: string[] | null;
  intent_note?: string | null;
  about_now?: string | null;
  interests?: string[] | null;
  onboarding_completed_at?: string | null;
  onboarding_skipped_at?: string | null;
};

function columnMissing(message: string): boolean {
  return /column|schema cache/i.test(message);
}

function asLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const label = "label" in row && typeof row.label === "string" ? row.label : "";
    const url = "url" in row && typeof row.url === "string" ? row.url : "";
    if (!label || !url) return [];
    return [{ label, url }];
  });
}

export function draftFromProfileRow(row: ProfileOnboardingRow | null): OnboardingDraft {
  const draft = emptyOnboardingDraft();
  if (!row) return draft;
  draft.linkedin = row.linkedin ?? "";
  draft.instagram = row.instagram ?? "";
  draft.facebook = row.facebook ?? "";
  draft.x = row.x_url ?? "";
  draft.others = asLinks(row.social_links);
  draft.knownFor = row.headline ?? "";
  draft.aboutNow = row.about_now ?? "";
  draft.basedIn = row.city ?? "";
  draft.bio = row.bio ?? "";
  draft.interests = (row.interests ?? []).join(", ");
  draft.intents = (row.intents ?? []).filter(isMemberIntent);
  draft.intentNote = row.intent_note ?? "";
  return draft;
}

export function dbStateFromRow(row: ProfileOnboardingRow | null, accountExists: boolean): OnboardingDbState {
  if (!row) return accountExists ? "pending" : "unknown";
  if (row.onboarding_completed_at) return "completed";
  if (row.onboarding_skipped_at) return "skipped";
  return "pending";
}

export async function readOnboardingDb(accountId: string): Promise<{
  state: OnboardingDbState;
  draft: OnboardingDraft | null;
}> {
  const empty = { state: "unknown" as const, draft: null };
  if (!hasSupabase() || !accountId) return empty;
  const admin = getSupabaseAdmin();
  if (!admin) return empty;

  const selected = await admin
    .from("profiles")
    .select(
      "id, display_name, headline, bio, city, linkedin, instagram, facebook, x_url, social_links, intents, intent_note, about_now, interests, onboarding_completed_at, onboarding_skipped_at",
    )
    .eq("account_id", accountId)
    .maybeSingle();

  if (selected.error) {
    if (columnMissing(selected.error.message)) return empty;
    return empty;
  }

  const row = (selected.data ?? null) as ProfileOnboardingRow | null;
  if (!row) {
    const account = await admin.from("accounts").select("id").eq("id", accountId).maybeSingle();
    return { state: dbStateFromRow(null, Boolean(account.data?.id)), draft: null };
  }
  return { state: dbStateFromRow(row, true), draft: draftFromProfileRow(row) };
}

export async function writeOnboardingDb(input: {
  user: SessionUser;
  draft: OnboardingDraft;
  status: OnboardingStatus | "pending";
  profilePatch: {
    headline: string;
    bio: string;
    city: string;
    linkedin?: string;
    interests: string[];
    goals: string[];
    preferredConnectionTypes: string[];
  };
}): Promise<{ persisted: boolean }> {
  if (!hasSupabase() || input.user.isDemo) return { persisted: false };
  const admin = getSupabaseAdmin();
  if (!admin) return { persisted: false };

  const now = new Date().toISOString();
  const timestamps =
    input.status === "completed"
      ? { onboarding_completed_at: now, onboarding_skipped_at: null }
      : input.status === "skipped"
        ? { onboarding_completed_at: null, onboarding_skipped_at: now }
        : {};
  const full = {
    headline: input.profilePatch.headline || null,
    bio: input.profilePatch.bio || null,
    city: input.profilePatch.city || null,
    linkedin: input.draft.linkedin || null,
    instagram: input.draft.instagram || null,
    facebook: input.draft.facebook || null,
    x_url: input.draft.x || null,
    social_links: input.draft.others,
    intents: input.draft.intents,
    intent_note: input.draft.intentNote || null,
    about_now: input.draft.aboutNow || null,
    portrait_url: portraitForColumn(input.draft.portraitUrl),
    interests: input.profilePatch.interests,
    goals: input.profilePatch.goals,
    preferred_connection_types: input.profilePatch.preferredConnectionTypes,
    ...timestamps,
    updated_at: now,
  };

  const existing = await admin
    .from("profiles")
    .select("id")
    .eq("account_id", input.user.id)
    .maybeSingle();
  if (existing.error && columnMissing(existing.error.message)) {
    return { persisted: false };
  }

  if (existing.data?.id) {
    const updated = await admin.from("profiles").update(full).eq("id", existing.data.id);
    if (!updated.error) return { persisted: true };
    if (!columnMissing(updated.error.message)) return { persisted: false };
    const legacy = await admin
      .from("profiles")
      .update({
        headline: full.headline,
        bio: full.bio,
        city: full.city,
        linkedin: full.linkedin,
        interests: full.interests,
        goals: full.goals,
        updated_at: now,
      })
      .eq("id", existing.data.id);
    return { persisted: !legacy.error };
  }

  const account = await admin
    .from("accounts")
    .select("id, full_name")
    .eq("id", input.user.id)
    .maybeSingle();
  if (!account.data?.id) return { persisted: false };

  const inserted = await admin.from("profiles").insert({
    account_id: input.user.id,
    display_name:
      (typeof account.data.full_name === "string" && account.data.full_name) ||
      input.user.name ||
      "Member",
    visibility: "members",
    is_demo: false,
    ...full,
  });
  if (!inserted.error) return { persisted: true };
  if (!columnMissing(inserted.error.message)) return { persisted: false };
  const legacyInsert = await admin.from("profiles").insert({
    account_id: input.user.id,
    display_name:
      (typeof account.data.full_name === "string" && account.data.full_name) ||
      input.user.name ||
      "Member",
    visibility: "members",
    is_demo: false,
    headline: full.headline,
    bio: full.bio,
    city: full.city,
    linkedin: full.linkedin,
    interests: full.interests,
    goals: full.goals,
  });
  return { persisted: !legacyInsert.error };
}
