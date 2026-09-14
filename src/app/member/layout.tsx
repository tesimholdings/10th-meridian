import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { PreviewTools } from "@/components/preview/preview-tools";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && !access.decision.allowed) {
    redirect("/");
  }
  return (
    <>
      <PreviewTools access={access} placement="app" />
      {children}
    </>
  );
}
