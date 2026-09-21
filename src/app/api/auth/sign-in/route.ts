import { redirect } from "next/navigation";
import { resolveSignInEmail, signInWithPassword } from "@/lib/supabase/auth";

/**
 * Identifier is a username or an email.
 * An @ is used as the Auth email. Anything else is resolved, case-insensitively,
 * through accounts.username (then profile / Auth metadata / the founding directory)
 * before signInWithPassword.
 */
async function readCredentials(request: Request): Promise<{ identity: string; password: string }> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    return {
      identity: String(json?.identity ?? json?.email ?? json?.username ?? ""),
      password: String(json?.password ?? ""),
    };
  }
  const form = await request.formData();
  return {
    identity: String(form.get("identity") ?? form.get("email") ?? form.get("username") ?? ""),
    password: String(form.get("password") ?? ""),
  };
}

export async function POST(request: Request) {
  const { identity, password } = await readCredentials(request);
  const email = await resolveSignInEmail(identity);
  const result = await signInWithPassword({ email, password });
  if (!result.ok) {
    redirect("/sign-in?error=1");
  }
  redirect(result.redirect);
}
