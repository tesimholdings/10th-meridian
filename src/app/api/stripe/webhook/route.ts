import { handleStripeWebhook } from "@/lib/stripe/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  const result = await handleStripeWebhook(raw, request.headers.get("stripe-signature"));
  if (!result.ok) {
    return new Response(result.message, { status: result.status });
  }
  if (result.stub) {
    return Response.json({ ok: true, stub: true, note: result.note });
  }
  return Response.json({
    received: true,
    type: result.type,
    unlocked: result.unlocked ?? false,
    skipped: result.skipped,
  });
}
