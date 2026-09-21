import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { readOnboardingCookie, writeOnboardingCookie } from "@/lib/profile/onboarding-cookie";
import { readOnboardingDb, writeOnboardingDb } from "@/lib/profile/onboarding-db";
import {
  emptyOnboardingDraft,
  FRESH_PREVIEW_ACCOUNT_ID,
  nextOnboardingStatus,
  normalizeOnboardingDraft,
  projectOnboarding,
  type OnboardingDraft,
} from "@/lib/profile/onboarding";
import { readOnboardingPreview, writeOnboardingPreview } from "@/lib/preview/store";

const schema = z.object({
  action: z.enum(["save", "skip", "complete"]),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  x: z.string().optional(),
  others: z.array(z.object({ label: z.string(), url: z.string() })).max(4).optional(),
  knownFor: z.string().optional(),
  aboutNow: z.string().optional(),
  basedIn: z.string().optional(),
  bio: z.string().optional(),
  interests: z.string().optional(),
  intents: z.array(z.string()).max(12).optional(),
  intentNote: z.string().optional(),
  portraitUrl: z.string().max(180_000).optional(),
  portraitLabel: z.string().max(160).optional(),
});

function draftFromBody(data: z.infer<typeof schema>): OnboardingDraft {
  return {
    ...emptyOnboardingDraft(),
    linkedin: data.linkedin ?? "",
    instagram: data.instagram ?? "",
    facebook: data.facebook ?? "",
    x: data.x ?? "",
    others: data.others ?? [],
    knownFor: data.knownFor ?? "",
    aboutNow: data.aboutNow ?? "",
    basedIn: data.basedIn ?? "",
    bio: data.bio ?? "",
    interests: data.interests ?? "",
    intents: data.intents ?? [],
    intentNote: data.intentNote ?? "",
    portraitUrl: data.portraitUrl ?? "",
    portraitLabel: data.portraitLabel ?? "",
  };
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  const user = access.user;
  if (!user || (!access.decision.isMemberAccess && !access.decision.allowed)) {
    return Response.json({ ok: false, message: "Sign in to save a profile." }, { status: 403 });
  }
  if (
    user.role !== "member" &&
    user.role !== "approved_unpaid" &&
    user.role !== "moderator" &&
    user.role !== "administrator"
  ) {
    return Response.json({ ok: false, message: "Sign in to save a profile." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "Invalid profile." }, { status: 400 });
  }

  const normalized = normalizeOnboardingDraft(draftFromBody(parsed.data));
  if (parsed.data.action !== "skip" && normalized.errors.length) {
    return Response.json(
      { ok: false, message: normalized.errors[0], errors: normalized.errors },
      { status: 400 },
    );
  }

  const preview = readOnboardingPreview(user.id);
  const cookie = await readOnboardingCookie();
  const cookieStatus = cookie?.accountId === user.id ? cookie.status : null;
  const db = user.isDemo ? { state: "unknown" as const } : await readOnboardingDb(user.id);
  const previous = cookieStatus ?? preview?.status ?? (db.state === "unknown" ? null : db.state);
  const settledPrevious =
    parsed.data.action === "save" &&
    previous == null &&
    user.id !== FRESH_PREVIEW_ACCOUNT_ID
      ? "completed"
      : previous;
  const status = nextOnboardingStatus(settledPrevious, parsed.data.action);
  const draft = normalized.draft;
  const projected = projectOnboarding(null, draft);

  writeOnboardingPreview(user.id, draft, status);
  await writeOnboardingDb({
    user,
    draft,
    status,
    profilePatch: {
      headline: projected.headline ?? "",
      bio: projected.bio ?? "",
      city: projected.city ?? "",
      linkedin: projected.linkedin,
      interests: projected.interests ?? [],
      goals: projected.goals ?? [],
      preferredConnectionTypes: projected.preferredConnectionTypes ?? [],
    },
  });
  await writeOnboardingCookie(user.id, status);

  return Response.json({
    ok: true,
    status,
    redirect: status === "pending" ? null : "/member/home",
  });
}
