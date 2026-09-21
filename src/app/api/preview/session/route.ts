import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCOUNT_COOKIE,
  cookieOptions,
  OPEN_HOUSE_FORCE_COOKIE,
  ROLE_COOKIE,
  signedValue,
} from "@/lib/access/cookies";
import { env } from "@/lib/env";
import type { AppRole } from "@/lib/data/types";
import { writeOnboardingCookie } from "@/lib/profile/onboarding-cookie";
import { FRESH_PREVIEW_ACCOUNT_ID, emptyOnboardingDraft } from "@/lib/profile/onboarding";
import { writeOnboardingPreview } from "@/lib/preview/store";

export async function POST(request: Request) {
  if (!env.previewDemoAuth || !env.previewTools) {
    return new Response("Not available", { status: 403 });
  }
  const form = await request.formData();
  const role = String(form.get("role") ?? "");
  const openHouse = String(form.get("openHouse") ?? "");
  const jar = await cookies();

  if (openHouse === "open" || openHouse === "closed") {
    jar.set(OPEN_HOUSE_FORCE_COOKIE, signedValue(openHouse), {
      ...cookieOptions,
      maxAge: 60 * 60 * 12,
    });
    redirect(openHouse === "open" ? "/open-house" : "/");
  }
  if (openHouse === "clear") {
    jar.delete(OPEN_HOUSE_FORCE_COOKIE);
    redirect("/");
  }

  if (form.get("fresh") === "1") {
    jar.set(ROLE_COOKIE, signedValue("member"), { ...cookieOptions, maxAge: 60 * 60 * 12 });
    jar.set(
      ACCOUNT_COOKIE,
      signedValue(
        JSON.stringify({
          id: FRESH_PREVIEW_ACCOUNT_ID,
          email: "new.member@preview.10thmeridian.test",
          name: "Alex Hale",
          isDemo: true,
        }),
      ),
      { ...cookieOptions, maxAge: 60 * 60 * 12 },
    );
    writeOnboardingPreview(FRESH_PREVIEW_ACCOUNT_ID, emptyOnboardingDraft(), "pending");
    await writeOnboardingCookie(FRESH_PREVIEW_ACCOUNT_ID, "pending");
    redirect("/onboarding");
  }

  const allowed: AppRole[] = [
    "guest",
    "applicant",
    "approved_unpaid",
    "member",
    "moderator",
    "administrator",
  ];
  if (!allowed.includes(role as AppRole)) {
    redirect("/");
  }

  if (role === "guest") {
    jar.delete(ROLE_COOKIE);
    jar.delete(ACCOUNT_COOKIE);
    redirect("/");
  }

  jar.set(ROLE_COOKIE, signedValue(role), { ...cookieOptions, maxAge: 60 * 60 * 12 });
  jar.set(
    ACCOUNT_COOKIE,
    signedValue(
      JSON.stringify({
        id: `preview-${role}`,
        email: `${role}@preview.10thmeridian.test`,
        name:
          role === "administrator"
            ? "Preview Steward"
            : role === "approved_unpaid"
              ? "Approved Guest"
              : "A. Voss",
        isDemo: true,
      }),
    ),
    { ...cookieOptions, maxAge: 60 * 60 * 12 },
  );

  if (role === "administrator" || role === "moderator") redirect("/admin");
  if (role === "member") redirect("/member/home");
  if (role === "approved_unpaid") redirect("/member/billing");
  redirect("/");
}
