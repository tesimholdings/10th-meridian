/**
 * Portfolio gallery. Live path writes to the `portfolio` Storage bucket.
 * Preview uses labeled DEMO objects — never real member photographs.
 */

export const PORTFOLIO_BUCKET = "portfolio";

export interface GalleryUpload {
  id: string;
  url: string;
  caption: string;
  kind: "work" | "portfolio";
  isDemo: boolean;
}

export function demoGalleryFor(profileId: string, accent: string): GalleryUpload[] {
  return [
    {
      id: `${profileId}-g1`,
      url: `/media/demo/gallery-${hash(profileId, 1)}.svg`,
      caption: "Work in progress — DEMO still",
      kind: "work",
      isDemo: true,
    },
    {
      id: `${profileId}-g2`,
      url: `/media/demo/gallery-${hash(profileId, 2)}.svg`,
      caption: "A room, not a stage — DEMO still",
      kind: "portfolio",
      isDemo: true,
    },
  ].map((photo) => ({ ...photo, accent } as GalleryUpload));
}

function hash(id: string, salt: number): number {
  let n = salt;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return (n % 4) + 1;
}

export function stubGalleryUpload(input: {
  caption: string;
  kind?: "work" | "portfolio";
}): GalleryUpload {
  return {
    id: `gal-${Date.now()}`,
    url: "/media/demo/gallery-1.svg",
    caption: input.caption || "Untitled work — DEMO",
    kind: input.kind ?? "work",
    isDemo: true,
  };
}
