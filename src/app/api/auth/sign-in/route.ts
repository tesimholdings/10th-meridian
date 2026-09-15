import { redirect } from "next/navigation";
import { signInWithPassword } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const result = await signInWithPassword({ email, password });
  if (!result.ok) {
    redirect("/sign-in?error=1");
  }
  redirect("/member/home");
}
