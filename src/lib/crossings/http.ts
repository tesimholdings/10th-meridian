import { resolveAccessContext } from "@/lib/access/context";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { crossingsState } from "@/lib/preview/store";
import type { AppRole } from "@/lib/data/types";
import { captureRouteError } from "@/lib/sentry/capture";

export async function crossingsAccess() {
  const access = await resolveAccessContext();
  const allowed = access.decision.allowed || access.decision.isMemberAccess;
  return {
    access,
    allowed,
    isMemberAccess: access.decision.isMemberAccess,
    canMutate: canMutateCrossings(access.user?.role as AppRole | undefined),
    role: access.user?.role ?? null,
    state: crossingsState(),
  };
}

export function jsonError(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

export function jsonCaught(
  error: unknown,
  fallback: string,
  status = 400,
) {
  captureRouteError(error, { route: "crossings" });
  return jsonError(error instanceof Error ? error.message : fallback, status);
}
