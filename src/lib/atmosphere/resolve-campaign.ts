import { existsSync } from "node:fs";
import { join } from "node:path";
import { campaign, campaignFallbacks, type CampaignSlot } from "@/lib/atmosphere/campaign";

function diskPath(src: string) {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

export function campaignSrc(slot: CampaignSlot): string {
  const src = campaign[slot];
  return existsSync(diskPath(src)) ? src : campaignFallbacks[slot];
}

export function campaignPackOnDisk(): boolean {
  return (Object.keys(campaign) as CampaignSlot[]).every((slot) => existsSync(diskPath(campaign[slot])));
}
