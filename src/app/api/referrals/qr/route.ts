import QRCode from "qrcode";
import { env } from "@/lib/env";
import { validateReferralCode } from "@/lib/referrals/validate";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const result = validateReferralCode(code);
  if (!result.ok) {
    return new Response("Not found", { status: 404 });
  }
  const payload = `${env.siteUrl}/referral/${encodeURIComponent(code)}`;
  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    color: { dark: "#08090b", light: "#f6f4ef" },
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
