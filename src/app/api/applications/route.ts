import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { env } from "@/lib/env";
import { stubInsert } from "@/lib/supabase/stub";
import { resolveAccessContext } from "@/lib/access/context";
import { emailTemplates } from "@/lib/resend/templates";
import { sendTransactional } from "@/lib/resend/client";
import { validateReferralCode } from "@/lib/referrals/validate";
import { addApplication, getPreviewStore } from "@/lib/preview/store";
import { normalizeIntents } from "@/lib/onboarding/intents";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  roleTitle: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  intents: z.array(z.string()).optional(),
  intentOther: z.string().optional(),
  socials: z
    .array(
      z.object({
        provider: z.enum([
          "linkedin",
          "instagram",
          "facebook",
          "x",
          "website",
          "whatsapp",
          "telegram",
          "youtube",
        ]),
        handle: z.string().optional(),
        url: z.string().optional(),
        connected: z.boolean(),
        mode: z.enum(["demo", "oauth"]),
        connectedAt: z.string().optional(),
      }),
    )
    .optional(),
  industries: z.string().optional(),
  interests: z.string().optional(),
  goals: z.string().optional(),
  strengths: z.string().optional(),
  offers: z.string().optional(),
  needs: z.string().optional(),
  valued: z.string().optional(),
  preferredConnectionTypes: z.string().optional(),
  referralCode: z.string().optional(),
  discoverySource: z.string().optional(),
  terms: z.string().optional(),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json(
      { ok: false, message: "Applications open during Open House." },
      { status: 403 },
    );
  }
  const limited = rateLimit(clientKey(request, "apply"), env.rateLimitApplications);
  if (!limited.ok) {
    return Response.json({ ok: false, message: "Please wait a moment." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "Please complete the required fields." }, { status: 400 });
  }
  if (parsed.data.terms !== "yes") {
    return Response.json({ ok: false, message: "Agreement is required." }, { status: 400 });
  }

  const referred = parsed.data.referralCode
    ? validateReferralCode(parsed.data.referralCode).ok
    : false;

  const split = (value?: string) =>
    (value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  addApplication({
    id: `app-${Date.now()}`,
    status: referred ? "referred" : "submitted",
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    city: parsed.data.city ?? "",
    country: parsed.data.country ?? "",
    timezone: parsed.data.timezone ?? "",
    roleTitle: parsed.data.roleTitle ?? "",
    company: parsed.data.company ?? "",
    bio: parsed.data.bio ?? "",
    website: parsed.data.website,
    linkedin: parsed.data.linkedin,
    ...normalizeIntents(parsed.data.intents ?? [], parsed.data.intentOther),
    socials: parsed.data.socials,
    industries: split(parsed.data.industries),
    interests: split(parsed.data.interests),
    goals: split(parsed.data.goals),
    strengths: split(parsed.data.strengths),
    offers: split(parsed.data.offers),
    needs: split(parsed.data.needs),
    valuedPeople: split(parsed.data.valued),
    valuedOpportunities: split(parsed.data.valued),
    preferredConnectionTypes: [],
    referralCode: parsed.data.referralCode,
    discoverySource: parsed.data.discoverySource,
    termsAgreed: true,
    cohortMonth: getPreviewStore().cohortMonth,
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  stubInsert("applications", {
    ...parsed.data,
    status: referred ? "referred" : "submitted",
    is_demo: true,
  });

  const tpl = emailTemplates.applicationReceived();
  await sendTransactional({
    to: parsed.data.email,
    subject: tpl.subject,
    html: tpl.html,
  });

  return Response.json({
    ok: true,
    message:
      "Received, and in human hands. Selection is discretionary. A referral is not a promise.",
  });
}
