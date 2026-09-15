import { redirect } from "next/navigation";
import { signOutCurrent } from "@/lib/supabase/auth";

export async function POST() {
  await signOutCurrent();
  redirect("/");
}
