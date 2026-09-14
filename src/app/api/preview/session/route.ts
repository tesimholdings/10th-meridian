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
        name: role === "administrator" ? "Preview Steward" : "A. Voss",
        isDemo: true,
      }),
    ),
    { ...cookieOptions, maxAge: 60 * 60 * 12 },
  );

  if (role === "administrator" || role === "moderator") redirect("/admin");
  if (role === "member") redirect("/member/home");
  redirect("/");
}
