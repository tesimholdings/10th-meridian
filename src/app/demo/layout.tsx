import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";

export const dynamic = "force-dynamic";

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    redirect("/");
  }
  return children;
}
