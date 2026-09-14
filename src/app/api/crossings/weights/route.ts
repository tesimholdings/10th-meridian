import { z } from "zod";
import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import { normalizeTravelWeights } from "@/lib/crossings/matching";

const schema = z.object({
  meridian: z.number().nonnegative(),
  overlap: z.number().nonnegative(),
  intent: z.number().nonnegative(),
  complementary: z.number().nonnegative(),
  availability: z.number().nonnegative(),
});

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  return Response.json({ ok: true, weights: ctx.state.travelWeights });
}

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (ctx.role !== "administrator" && ctx.role !== "moderator") {
    return jsonError("Stewards set travel weights.", 403);
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid weights.");
  ctx.state.travelWeights = normalizeTravelWeights(parsed.data);
  return Response.json({ ok: true, weights: ctx.state.travelWeights });
}
