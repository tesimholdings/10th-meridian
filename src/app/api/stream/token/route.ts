import { resolveAccessContext } from "@/lib/access/context";
import { issueStreamToken } from "@/lib/stream/token";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && !access.decision.allowed) {
    return Response.json({ ok: false, message: "Members only." }, { status: 403 });
  }
  return Response.json(issueStreamToken(access.user?.id ?? ""));
}

export async function GET() {
  return POST();
}
