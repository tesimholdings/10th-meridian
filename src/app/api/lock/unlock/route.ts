import { redirect } from "next/navigation";
import { z } from "zod";
import { env, hasSupabase } from "@/lib/env";
import {
  applyUnlockHit,
} from "@/lib/lock/session";
import {
  classifyLockIdentity,
  resolveLockUnlock,
  UNLOCK_MISS_MESSAGE,
} from "@/lib/lock/unlock";
import { getPreviewStore } from "@/lib/preview/store";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { signInWithPassword } from "@/lib/supabase/auth";

const schema = z.object({
  key: z.string().max(120),
  password: z.string().max(200).optional(),
  referral: z.union([z.boolean(), z.literal("1"), z.literal("true")]).optional(),
});

function wantsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  const type = request.headers.get("content-type") ?? "";
  return accept.includes("application/json") || type.includes("application/json");
}

async function readBody(
  request: Request,
): Promise<{
  key: string;
  password?: string;
  hasPassword: boolean;
  referralIntent: boolean;
}> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = await request.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return { key: "", hasPassword: false, referralIntent: false };
    return {
      key: parsed.data.key,
      password: parsed.data.password,
      hasPassword: Boolean(json && typeof json === "object" && "password" in json),
      referralIntent: Boolean(parsed.data.referral),
    };
  }
  const form = await request.formData().catch(() => null);
  const passwordRaw = form?.get("password");
  const referralRaw = String(form?.get("referral") ?? "");
  return {
    key: String(form?.get("key") ?? ""),
    password: passwordRaw == null ? undefined : String(passwordRaw),
    hasPassword: passwordRaw != null,
    referralIntent: referralRaw === "1" || referralRaw === "true",
  };
}

function miss(request: Request) {
  if (wantsJson(request)) {
    return Response.json({ ok: false, message: UNLOCK_MISS_MESSAGE });
  }
  redirect("/?unlock=1");
}

function ok(request: Request, payload: { redirect?: string; next?: "password" }) {
  if (wantsJson(request)) {
    return Response.json({ ok: true, ...payload });
  }
  if (payload.redirect) redirect(payload.redirect);
  redirect("/?unlock=1");
}

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "lock-unlock"), env.rateLimitReferral);
  if (!limited.ok) {
    if (wantsJson(request)) {
      return Response.json({ ok: false, message: "Please wait a moment." }, { status: 429 });
    }
    redirect("/?unlock=1");
  }

  const { key, password, hasPassword, referralIntent } = await readBody(request);
  const referrals = env.previewDemoAuth
    ? getPreviewStore().referrals
    : getPreviewStore().referrals.filter((row) => !row.isDemo);

  if (referralIntent) {
    const hit = resolveLockUnlock(key, { referrals });
    if (hit.kind !== "referral") return miss(request);
    const dest = await applyUnlockHit(hit);
    return ok(request, { redirect: dest });
  }

  if (!hasPassword) {
    const classified = classifyLockIdentity(key, { referrals });
    if (classified.kind === "empty") return miss(request);
    if (classified.kind === "referral") {
      const dest = await applyUnlockHit({ kind: "referral", code: classified.code });
      return ok(request, { redirect: dest });
    }
    return ok(request, { next: "password" });
  }

  if (hasSupabase()) {
    const result = await signInWithPassword({
      email: key,
      password: password ?? "",
    });
    if (result.ok) return ok(request, { redirect: result.redirect });
    return miss(request);
  }

  if (!env.previewDemoAuth) {
    return miss(request);
  }

  const hit = resolveLockUnlock(key, { referrals });
  if (hit.kind === "miss") return miss(request);
  const dest = await applyUnlockHit(hit);
  return ok(request, { redirect: dest });
}
