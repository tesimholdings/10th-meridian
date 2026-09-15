import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ACCOUNT_COOKIE,
  cookieOptions,
  OPEN_HOUSE_FORCE_COOKIE,
  REFERRAL_COOKIE,
  ROLE_COOKIE,
  signedValue,
} from "@/lib/access/cookies";
import { env } from "@/lib/env";
import { resolveLockUnlock, UNLOCK_MISS_MESSAGE } from "@/lib/lock/unlock";
import { getPreviewStore } from "@/lib/preview/store";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

const schema = z.object({ key: z.string().max(120) });

function wantsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  const type = request.headers.get("content-type") ?? "";
  return accept.includes("application/json") || type.includes("application/json");
}

async function readKey(request: Request): Promise<string> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = schema.safeParse(await request.json().catch(() => null));
    return body.success ? body.data.key : "";
  }
  const form = await request.formData().catch(() => null);
  return String(form?.get("key") ?? "");
}

function miss(request: Request) {
  if (wantsJson(request)) {
    return Response.json({ ok: false, message: UNLOCK_MISS_MESSAGE });
  }
  redirect("/?unlock=1");
}

export async function POST(request: Request) {
  if (!env.previewDemoAuth) {
    return miss(request);
  }

  const limited = rateLimit(clientKey(request, "lock-unlock"), env.rateLimitReferral);
  if (!limited.ok) {
    if (wantsJson(request)) {
      return Response.json({ ok: false, message: "Please wait a moment." }, { status: 429 });
    }
    redirect("/?unlock=1");
  }

  const key = await readKey(request);
  const hit = resolveLockUnlock(key, {
    referrals: getPreviewStore().referrals,
  });

  if (hit.kind === "miss") return miss(request);

  const jar = await cookies();

  if (hit.kind === "member") {
    jar.set(ROLE_COOKIE, signedValue("member"), {
      ...cookieOptions,
      maxAge: 60 * 60 * 12,
    });
    jar.set(
      ACCOUNT_COOKIE,
      signedValue(
        JSON.stringify({
          id: hit.profile.id,
          email: hit.email,
          name: hit.profile.displayName,
          isDemo: true,
        }),
      ),
      { ...cookieOptions, maxAge: 60 * 60 * 12 },
    );
    if (wantsJson(request)) {
      return Response.json({ ok: true, redirect: "/member/home" });
    }
    redirect("/member/home");
  }

  jar.set(REFERRAL_COOKIE, signedValue(hit.code), {
    ...cookieOptions,
    maxAge: 60 * 60 * 18,
  });
  if (env.previewTools) {
    jar.set(OPEN_HOUSE_FORCE_COOKIE, signedValue("open"), {
      ...cookieOptions,
      maxAge: 60 * 60 * 12,
    });
  }

  if (wantsJson(request)) {
    return Response.json({ ok: true, redirect: "/open-house" });
  }
  redirect("/open-house");
}
