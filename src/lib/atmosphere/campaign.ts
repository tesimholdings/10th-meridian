/** Editorial campaign stills and muted films. Never claim these depict members or completed events. */

export const EDITORIAL_CAPTION =
  "Editorial placeholder — not a photograph of members or a completed event.";

export const EDITORIAL_CREDIT = "Editorial still";

export const campaign = {
  heroLandscape: "/media/campaign/00-yacht-wake.png",
  homeIndex: "/media/campaign/01-yacht-deck.png",
  eventsDinner: "/media/campaign/02-waterfront-dinner.png",
  homeNetwork: "/media/campaign/03-salon.png",
  celebrations: "/media/campaign/04-celebration.png",
  nightlife: "/media/campaign/06-nightlife-club.png",
  heroMobile: "/media/campaign/00-yacht-wake.png",
  crossings: "/media/campaign/05-coastal-plaza.png",
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

export const campaignFilms = {
  heroLandscape: "/media/campaign/video/hero-yacht-wake.mp4",
  eventsDinner: "/media/campaign/video/hero-waterfront-dinner.mp4",
  nycRooftop: "/media/campaign/video/hero-nyc-rooftop.mp4",
  paris: "/media/campaign/video/hero-paris.mp4",
  capeTown: "/media/campaign/video/hero-cape-town.mp4",
  lakeComo: "/media/campaign/video/hero-lake-como.mp4",
} as const;

export const globalCampaign = {
  nycRooftop: "/media/campaign/global/01-nyc-rooftop.jpg",
  paris: "/media/campaign/global/02-paris.jpg",
  capeTown: "/media/campaign/global/03-cape-town.jpg",
  london: "/media/campaign/global/04-london-mayfair.jpg",
  amalfi: "/media/campaign/global/05-amalfi-yacht.jpg",
  safari: "/media/campaign/global/06-sa-safari.jpg",
  lakeComo: "/media/campaign/global/07-lake-como.jpg",
  nycClub: "/media/campaign/global/08-nyc-club.jpg",
} as const;

export type CampaignSlot = keyof typeof campaign;
export type CampaignFilm = keyof typeof campaignFilms;
export type GlobalSlot = keyof typeof globalCampaign;

const NIGHTLIFE = /\b(night.?life|nightclub|concert|after.?hours|club)\b/;

export function stillForListedExperience(
  event: { kind?: string; title?: string },
  index = 0,
): CampaignSlot {
  const text = `${event.kind ?? ""} ${event.title ?? ""}`.toLowerCase();
  if (NIGHTLIFE.test(text)) return "nightlife";
  if (event.kind === "open_house" || /open house|celebrat/.test(text)) return "celebrations";
  if (event.kind === "trip" || /walk|travel|crossing|field/.test(text)) return "crossings";
  if (event.kind === "salon" || /salon/.test(text)) return "homeNetwork";
  if (index === 1 || /dinner|table/.test(text)) return "eventsDinner";
  return index % 2 ? "celebrations" : "eventsDinner";
}
