import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  ACCOUNT_COOKIE,
  cookieOptions,
  ROLE_COOKIE,
  signedValue,
} from "@/lib/access/cookies";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const supabase = getSupabaseServer();

  if (supabase && password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      redirect("/sign-in?error=1");
    }
    // Role resolution happens from public.accounts in live mode.
    redirect("/member/home");
  }

  if (!env.previewDemoAuth) {
    redirect("/sign-in?error=1");
  }

  const jar = await cookies();
  jar.set(ROLE_COOKIE, signedValue("member"), { ...cookieOptions, maxAge: 60 * 60 * 12 });
  jar.set(
    ACCOUNT_COOKIE,
    signedValue(
      JSON.stringify({
        id: "preview-member",
        email,
        name: "A. Voss",
        isDemo: true,
      }),
    ),
    { ...cookieOptions, maxAge: 60 * 60 * 12 },
  );
  redirect("/member/home");
}
