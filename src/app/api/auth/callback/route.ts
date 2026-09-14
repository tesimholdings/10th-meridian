import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Supabase Auth PKCE callback lands here once live keys exist.
  return NextResponse.redirect(new URL("/member/home", url.origin));
}
