import { env } from "@/lib/env";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  max: number,
  windowMs = env.rateLimitWindowMs,
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (current.count >= max) {
    return { ok: false, remaining: 0 };
  }
  current.count += 1;
  return { ok: true, remaining: max - current.count };
}

export function clientKey(request: Request, extra = ""): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || request.headers.get("x-real-ip") || "local";
  return `${ip}:${extra}`;
}
