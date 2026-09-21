import { houseChannelId, streamChannelCid } from "@/lib/stream/channels";

/** SETUP checklist. Ids stay stable so re-seeding updates the same rooms. */
export const HOUSE_CHANNEL_SLUGS = [
  "announcements",
  "introductions",
  "ask-and-offer",
  "opportunities",
  "events",
  "travel",
  "ideas",
] as const;

export type HouseChannelSlug = (typeof HOUSE_CHANNEL_SLUGS)[number];

const HOUSE_CHANNEL_COPY: Record<HouseChannelSlug, { name: string; topic: string }> = {
  announcements: {
    name: "Announcements",
    topic: "Steward notes for the house.",
  },
  introductions: {
    name: "Introductions",
    topic: "How one arrives.",
  },
  "ask-and-offer": {
    name: "Ask & Offer",
    topic: "Reciprocity in public.",
  },
  opportunities: {
    name: "Opportunities",
    topic: "Work worth sharing.",
  },
  events: {
    name: "Events",
    topic: "Gatherings ahead.",
  },
  travel: {
    name: "Travel",
    topic: "Overlapping routes.",
  },
  ideas: {
    name: "Ideas",
    topic: "Unfinished thoughts.",
  },
};

export type HouseChannelSpec = {
  slug: HouseChannelSlug;
  id: string;
  cid: string;
  name: string;
  topic: string;
};

export function isHouseChannelSlug(slug: string): slug is HouseChannelSlug {
  return (HOUSE_CHANNEL_SLUGS as readonly string[]).includes(slug);
}

export function houseChannelCatalog(): HouseChannelSpec[] {
  return HOUSE_CHANNEL_SLUGS.map((slug) => {
    const id = houseChannelId(slug);
    const copy = HOUSE_CHANNEL_COPY[slug];
    return {
      slug,
      id,
      cid: streamChannelCid("messaging", id),
      name: copy.name,
      topic: copy.topic,
    };
  });
}

export function houseChannelBySlug(slug: string): HouseChannelSpec | undefined {
  return houseChannelCatalog().find((channel) => channel.slug === slug);
}

export function houseChannelById(id: string): HouseChannelSpec | undefined {
  return houseChannelCatalog().find((channel) => channel.id === id);
}
