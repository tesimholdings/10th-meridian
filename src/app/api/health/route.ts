import { integrationStatus } from "@/lib/env";

export function GET() {
  return Response.json({ ok: true, integrations: integrationStatus() });
}
