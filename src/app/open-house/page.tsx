import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { OpenHouseLanding } from "@/components/open-house/landing";
import { PreviewTools } from "@/components/preview/preview-tools";

export const dynamic = "force-dynamic";

export default async function OpenHousePage() {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    redirect("/");
  }
  return (
    <>
      <PreviewTools access={access} />
      <OpenHouseLanding access={access} />
    </>
  );
}
