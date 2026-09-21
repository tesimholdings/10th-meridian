import { env, hasStream } from "@/lib/env";
import { verifyStreamWebhookSignature } from "@/lib/stream/push-plan";
import { deliverIncomingStreamMessage } from "@/lib/stream/relay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasStream()) {
    return Response.json({ ok: false, message: "Stream is not configured." }, { status: 503 });
  }
  const raw = await request.text();
  const signature = request.headers.get("x-signature");
  if (!verifyStreamWebhookSignature(raw, signature, env.streamApiSecret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  try {
    const result = await deliverIncomingStreamMessage(body);
    return Response.json(result);
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
