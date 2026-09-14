/** Editorial campaign stills. Never claim these depict members or completed events. */

export const EDITORIAL_CAPTION =
  "Editorial placeholder — not a photograph of members or a completed event.";

export const EDITORIAL_CREDIT = "Editorial still";

export const campaign = {
  heroLandscape: "/media/campaign/00-yacht-wake.png",
  homeIndex: "/media/campaign/01-yacht-deck-conversation.png",
  eventsDinner: "/media/campaign/02-waterfront-dinner.png",
  homeNetwork: "/media/campaign/03-yacht-salon-business.png",
  celebrations: "/media/campaign/04-celebration-terrace.png",
  nightlife: "/media/campaign/05-nightlife-celebration.png",
  heroMobile: "/media/campaign/06-mobile-water-hero.png",
  crossings: "/media/campaign/07-coastal-plaza.png",
} as const;

export const campaignFallbacks = {
  heroLandscape: "/media/scene-water.svg",
  homeIndex: "/media/scene-yacht.svg",
  eventsDinner: "/media/scene-yacht.svg",
  homeNetwork: "/media/scene-yacht.svg",
  celebrations: "/media/scene-yacht.svg",
  nightlife: "/media/scene-concert.svg",
  heroMobile: "/media/scene-water.svg",
  crossings: "/media/scene-water.svg",
} as const;

export type CampaignSlot = keyof typeof campaign;

const NIGHTLIFE = /\b(night.?life|nightclub|concert|after.?hours|club)\b/;

export function stillForListedExperience(
  event: { kind?: string; title?: string },
  index = 0,
): CampaignSlot {
  const text = `${event.kind ?? ""} ${event.title ?? ""}`.toLowerCase();
  if (NIGHTLIFE.test(text)) return "nightlife";
  if (event.kind === "open_house" || /open house|celebrat/.test(text)) return "celebrations";
  if (event.kind === "trip" || /walk|travel|crossing|field/.test(text)) return "crossings";
  if (index === 1 || event.kind === "salon" || /dinner|salon|table/.test(text)) return "eventsDinner";
  return index % 2 ? "celebrations" : "eventsDinner";
}
