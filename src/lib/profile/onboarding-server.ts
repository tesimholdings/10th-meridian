import { readOnboardingCookie } from "@/lib/profile/onboarding-cookie";
import { readOnboardingDb } from "@/lib/profile/onboarding-db";
import {
  emptyOnboardingDraft,
  FRESH_PREVIEW_ACCOUNT_ID,
  profileFromOnboarding,
  type OnboardingDraft,
  type OnboardingStatus,
} from "@/lib/profile/onboarding";
import { readOnboardingPreview } from "@/lib/preview/store";
import { viewerProfile } from "@/lib/preview/store";
import type { SessionUser } from "@/lib/access/session";
import type { ProfileRecord } from "@/lib/data/types";

export type MemberIntro = {
  status: OnboardingStatus | "unknown";
  draft: OnboardingDraft;
  profile: ProfileRecord;
  fresh: boolean;
};

export async function loadMemberIntro(user: SessionUser | null): Promise<MemberIntro> {
  const viewer = viewerProfile();
  if (!user) {
    return {
      status: "unknown",
      draft: emptyOnboardingDraft(),
      profile: viewer,
      fresh: false,
    };
  }

  const cookie = await readOnboardingCookie();
  const cookieStatus = cookie?.accountId === user.id ? cookie.status : null;
  const preview = readOnboardingPreview(user.id);
  let draft = preview?.draft ?? null;
  let status: MemberIntro["status"] = cookieStatus ?? preview?.status ?? "unknown";

  if (!user.isDemo) {
    const db = await readOnboardingDb(user.id);
    if (!draft && db.draft) draft = db.draft;
    if (status === "unknown" && db.state !== "unknown") status = db.state;
  }

  const fresh = user.id === FRESH_PREVIEW_ACCOUNT_ID;
  return {
    status,
    draft: draft ?? emptyOnboardingDraft(),
    profile: profileFromOnboarding({
      viewer,
      accountId: user.id,
      name: user.name,
      draft: fresh ? (draft ?? emptyOnboardingDraft()) : draftHasVisible(draft) ? draft : null,
    }),
    fresh,
  };
}

function draftHasVisible(draft: OnboardingDraft | null): boolean {
  if (!draft) return false;
  return Boolean(
    draft.knownFor ||
      draft.bio ||
      draft.basedIn ||
      draft.aboutNow ||
      draft.intents.length ||
      draft.intentNote ||
      draft.linkedin ||
      draft.instagram ||
      draft.facebook ||
      draft.x ||
      draft.others.length,
  );
}
