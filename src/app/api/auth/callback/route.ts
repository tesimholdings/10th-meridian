import { NextResponse } from "next/server";
import { exchangeAuthCode } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Email magic-link / PKCE only. Social OAuth is not wired.
  await exchangeAuthCode(url.searchParams.get("code"));
  return NextResponse.redirect(new URL("/member/home", url.origin));
}
