import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { OpenHouseLanding } from "@/components/open-house/landing";
import { PreviewTools } from "@/components/preview/preview-tools";
import { OPEN_HOUSE_HEADLINE, OPEN_HOUSE_LEDE } from "@/lib/copy/open-house";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Open House",
  description: `${OPEN_HOUSE_HEADLINE} ${OPEN_HOUSE_LEDE}`,
};

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
