import { resolveAccessContext } from "@/lib/access/context";
import { hasStream, hasWebPush } from "@/lib/env";
import { houseChannelCatalog } from "@/lib/stream/house";
import { reseedHouseChannels } from "@/lib/stream/seed";

export const dynamic = "force-dynamic";

function steward(role: string | undefined) {
  return role === "administrator" || role === "moderator";
}

export async function GET() {
  const access = await resolveAccessContext();
  if (!steward(access.user?.role)) {
    return Response.json({ ok: false, message: "Stewards only." }, { status: 403 });
  }
  return Response.json({
    ok: true,
    stub: !hasStream(),
    webPush: hasWebPush(),
    channels: houseChannelCatalog(),
  });
}

export async function POST() {
  const access = await resolveAccessContext();
  if (!steward(access.user?.role)) {
    return Response.json({ ok: false, message: "Stewards only." }, { status: 403 });
  }
  const result = await reseedHouseChannels();
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
