import { redirect } from "next/navigation";
import { unregisterCurrentPushDevice } from "@/lib/stream/devices";
import { signOutCurrent } from "@/lib/supabase/auth";

export async function POST() {
  await unregisterCurrentPushDevice();
  await signOutCurrent();
  redirect("/");
}
