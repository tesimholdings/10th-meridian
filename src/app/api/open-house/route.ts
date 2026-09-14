import { resolveAccessContext } from "@/lib/access/context";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await resolveAccessContext();
  return Response.json({
    phase: access.decision.phase,
    allowed: access.decision.allowed,
    isDemo: access.decision.isDemo,
    isMemberAccess: access.decision.isMemberAccess,
    nextOpenAt: access.decision.nextOpenAt,
    windowClosesAt: access.decision.windowClosesAt,
    serverNowIso: access.decision.serverNowIso,
    timezone: access.decision.config.timeZone,
    referralValid: access.referralValid,
  });
}
