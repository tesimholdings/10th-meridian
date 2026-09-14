import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT_COOKIE, ROLE_COOKIE } from "@/lib/access/cookies";

export async function POST() {
  const jar = await cookies();
  jar.delete(ROLE_COOKIE);
  jar.delete(ACCOUNT_COOKIE);
  redirect("/");
}
