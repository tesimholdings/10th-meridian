import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  campaign,
  campaignFallbacks,
  campaignFilms,
  globalCampaign,
  type CampaignFilm,
  type CampaignSlot,
  type GlobalSlot,
} from "@/lib/atmosphere/campaign";

function diskPath(src: string) {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

export function mediaOnDisk(src: string): boolean {
  return existsSync(diskPath(src));
}

export function campaignSrc(slot: CampaignSlot): string {
  const src = campaign[slot];
  return mediaOnDisk(src) ? src : campaignFallbacks[slot];
}

export function globalSrc(slot: GlobalSlot, fallback: CampaignSlot = "homeIndex"): string {
  const src = globalCampaign[slot];
  return mediaOnDisk(src) ? src : campaignSrc(fallback);
}

/** Always the public CDN path. Do not existsSync-gate — Vercel functions often lack /public MP4s. */
export function filmSrc(slot: CampaignFilm): string {
  return campaignFilms[slot];
}

export function campaignPackOnDisk(): boolean {
  return (Object.keys(campaign) as CampaignSlot[]).every((slot) => mediaOnDisk(campaign[slot]));
}

export function campaignFilmsOnDisk(): boolean {
  return (Object.keys(campaignFilms) as CampaignFilm[]).every((slot) => mediaOnDisk(campaignFilms[slot]));
}

export function globalPackOnDisk(): boolean {
  return (Object.keys(globalCampaign) as GlobalSlot[]).every((slot) => mediaOnDisk(globalCampaign[slot]));
}
