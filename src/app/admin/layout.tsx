import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    redirect("/sign-in");
  }
  return children;
}
