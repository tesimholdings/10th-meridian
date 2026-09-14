import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  evaluateOpenHouse,
  isMemberPath,
  isOpenHousePath,
  resolveVisitorTimeZone,
} from "@/lib/access/open-house";
import {
  OPEN_HOUSE_FORCE_COOKIE,
  readSigned,
  REFERRAL_COOKIE,
  ROLE_COOKIE,
  VISITOR_TZ_COOKIE,
} from "@/lib/access/cookies";
import { validateReferralCode } from "@/lib/referrals/validate";
import type { AppRole } from "@/lib/data/types";

function roleFrom(request: NextRequest): AppRole | null {
  const raw = readSigned(request.cookies.get(ROLE_COOKIE)?.value);
  if (
    raw === "guest" ||
    raw === "applicant" ||
    raw === "approved_unpaid" ||
    raw === "member" ||
    raw === "moderator" ||
    raw === "administrator"
  ) {
    return raw;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = roleFrom(request);
  const referral = readSigned(request.cookies.get(REFERRAL_COOKIE)?.value);
  const forced = readSigned(request.cookies.get(OPEN_HOUSE_FORCE_COOKIE)?.value);
  const visitorTz = resolveVisitorTimeZone(request.cookies.get(VISITOR_TZ_COOKIE)?.value);
  const decision = evaluateOpenHouse({
    role: role ?? "guest",
    hasValidReferral: referral ? validateReferralCode(referral).ok : false,
    config: {
      timeZone: visitorTz,
      ...(forced === "open" || forced === "closed" ? { force: forced } : {}),
    },
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tm-phase", decision.phase);

  if (isMemberPath(pathname)) {
    if (!decision.isMemberAccess && !decision.allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (
      pathname.startsWith("/admin") &&
      role !== "administrator" &&
      role !== "moderator"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = decision.isMemberAccess
        ? "/member/home"
        : decision.allowed
          ? "/demo/home"
          : "/sign-in";
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  if (isOpenHousePath(pathname) && !decision.allowed && !decision.isMemberAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
