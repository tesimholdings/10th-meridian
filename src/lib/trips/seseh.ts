import type { EventRecord } from "@/lib/data/types";

/**
 * The first real 10th Meridian Crossing.
 * Facts are from Brian's Inner Circle brochure (Seseh, October 2026).
 * No attendees are seeded. host_account_id stays null — no member account maps to Brian.
 */

export const SESEH_EVENT_ID = "evt-seseh-bali-2026";
export const SESEH_SUPABASE_ID = "c5e5e000-2026-426a-8b11-5e5e00000001";
export const SESEH_PATH = "/experiences/seseh-bali";

export const SESEH_MEDIA = {
  hero: "/media/trips/seseh/hero.webp",
  card: "/media/trips/seseh/card.webp",
  villa: "/media/trips/seseh/villa.webp",
  charter: "/media/trips/seseh/charter.webp",
  cliff: "/media/trips/seseh/cliff.webp",
  beachClub: "/media/trips/seseh/beach-club.webp",
} as const;

export const SESEH_PLACE_CAPTION =
  "The sea-view estate in Seseh. Not a photograph of members or a completed week.";

export interface TripDay {
  label: string;
  date: string;
  title: string;
  note?: string;
  items: string[];
  optional?: string;
}

export interface TripSection {
  kicker: string;
  title: string;
  body: string;
}

export interface TripStill {
  src: string;
  alt: string;
  caption: string;
}

export const SESEH_TRIP = {
  eventId: SESEH_EVENT_ID,
  supabaseId: SESEH_SUPABASE_ID,
  path: SESEH_PATH,
  title: "Seseh, Bali: The Villa Week",
  kicker: "A 10th Meridian Crossing",
  hostName: "Brian",
  hostLine: "Hosted by Brian",
  place: "Seseh, Bali",
  city: "Seseh",
  country: "Indonesia",
  whenLabel: "October 26 – November 2, 2026",
  priceLabel: "€9,000",
  priceLine: "€9,000 per guest",
  capacity: 8,
  startsAt: "2026-10-26T09:00:00+08:00",
  endsAt: "2026-11-02T18:00:00+08:00",
  summary:
    "Seven days at an eight-bedroom sea-view estate in Seseh. Five activity days. Hosted by Brian.",
  lede:
    "Brian hosts the week — The Inner Circle, held as a Crossing of 10th Meridian. Guests fly in Monday, October 26 and fly out Monday, November 2. The estate is home for the week: a room of your own, the pool, the ocean, the fire pits, and fast Wi-Fi. The days have a plan, and the plan can still move.",
  scheduleNote: "Subject to change.",
  spotsLine: "Eight founders. The waitlist starts once those spots are filled.",
  inclusions: [
    "Five full days of experiences",
    "Healthy meals, managed",
    "Airport transfers and transfers for the scheduled activities, for the group",
    "A private room in the eight-bedroom sea-view estate",
    "The pool, the ocean view, the fire pits, and fast Wi-Fi",
  ],
  hero: SESEH_MEDIA.hero,
  card: SESEH_MEDIA.card,
  gallery: [
    {
      src: SESEH_MEDIA.villa,
      alt: "Sea-view villa and pool in Seseh, Bali",
      caption: "The estate",
    },
    {
      src: SESEH_MEDIA.charter,
      alt: "Private boat on open water off Bali",
      caption: "The water",
    },
    {
      src: SESEH_MEDIA.cliff,
      alt: "Cliff and coast above the Bali surf",
      caption: "Uluwatu",
    },
    {
      src: SESEH_MEDIA.beachClub,
      alt: "Beach club pool looking out to the ocean",
      caption: "Luna Beach Club",
    },
  ] satisfies TripStill[],
  days: [
    {
      label: "Day 1",
      date: "Mon Oct 26",
      title: "Arrival",
      note: "Guests fly in.",
      items: [
        "9:00 AM Breakfast",
        "11:00 AM Training / spa",
        "1:00 PM Lunch",
        "2:00 PM Explore Seseh",
        "6:00 PM Dinner",
      ],
    },
    {
      label: "Day 2",
      date: "Tue Oct 27",
      title: "Box and Snakes Day",
      items: [
        "9:00 AM Breakfast",
        "10:00 AM Boxing",
        "11:30 AM Lunch",
        "12:30 PM Training / spa",
        "2:00 PM Lunch",
        "6:00 PM Dinner",
        "9:00 PM Snake hunting",
      ],
    },
    {
      label: "Day 3",
      date: "Wed Oct 28",
      title: "Boat Day",
      items: [
        "7:00 AM Early breakfast",
        "8:00 AM Transport to the boat, through the evening",
        "5:00 PM Dinner",
        "7:00 PM onward Open night",
      ],
      optional: "Bella",
    },
    {
      label: "Day 4",
      date: "Thu Oct 29",
      title: "Reset Day",
      items: [
        "9:00 AM Coffee",
        "10:00 AM Boxing",
        "11:30 AM Lunch",
        "1:00 PM Training / spa",
        "3:00 PM Padel",
        "5:00 PM Early dinner",
        "7:00 PM onward Open night",
      ],
      optional: "Jade",
    },
    {
      label: "Day 5",
      date: "Fri Oct 30",
      title: "Uluwatu Day",
      items: [
        "9:00 AM Gun range",
        "11:00 AM Dreamland Beach",
        "2:00 PM Lunch / clean up at Bambu Fitness",
        "5:00 PM Mana sunset",
        "8:30 PM Dinner",
        "10:00 PM Late",
      ],
      optional: "Tabu, Giselle, Desa, Zumana",
    },
    {
      label: "Day 6",
      date: "Sat Oct 31",
      title: "Unlock Day",
      items: [
        "10:00 AM Breakfast",
        "12:00 PM Boxing",
        "1:30 PM Training / spa",
        "3:30 PM Late lunch",
        "5:00 PM Padel",
        "6:00 PM onward Open night",
      ],
      optional: "Giselle",
    },
    {
      label: "Day 7",
      date: "Sun Nov 1",
      title: "Beach Club Day",
      items: [
        "9:00 AM Breakfast",
        "10:00 AM Training / spa",
        "12:00 PM onward Luna Beach Club",
      ],
      optional: "Savaya",
    },
    {
      label: "Day 8",
      date: "Mon Nov 2",
      title: "Last day",
      note: "Guests fly out.",
      items: ["Open schedule"],
    },
  ] satisfies TripDay[],
  sections: [
    {
      kicker: "The Reset",
      title: "Early training, then the villa.",
      body: "Most mornings start early. Coffee or a light breakfast, then a training session, then the spa — sauna and cold plunge. After that the estate is yours: calls, the pool, a quiet hour. The week is built so the early work leaves the rest of the day open.",
    },
    {
      kicker: "The Ring",
      title: "Combat, the range, and a night in the field.",
      body: "The week trains composure under pressure. At the range, the work is to slow down and hit the mark. Private sessions with an experienced kickboxing coach cover conditioning, footwork, and staying clear while you are being tested. At seven in the evening the group goes out with local guides, through rice fields and mangroves, looking for the snakes of the region. The guides find and handle them. The night is filmed, and it is meant to be intense. Every session is led by certified professionals.",
    },
    {
      kicker: "The Water",
      title: "A private charter, and a day with nothing to produce.",
      body: "One day is a private charter off the Bali coast. Reefs, open water, and time that is not a shoot. Be on the boat. The footage will be there afterward.",
    },
    {
      kicker: "Uluwatu",
      title: "Surf, beaches, and Mana at sunset.",
      body: "A day on the Bukit: the beaches, surf with locals, and the evening at Mana at Uluwatu Surf Villas — ocean, a table, and a room for meeting people beyond the group.",
    },
    {
      kicker: "Extra",
      title: "Luna, padel, and whatever the week still holds.",
      body: "Luna Beach Club for the group: pool, music, sunset, and dinner. Padel, coached and played in doubles. If the week still has room: jet skis, dirt bikes, waterfalls, volcano hikes, and massage at the villa or a spa.",
    },
    {
      kicker: "The Kitchen",
      title: "Clean food, looked after.",
      body: "Breakfast, a long lunch, dinner at the estate or nearby. The meals are healthy, and they are managed. The aim is to leave in better shape than you arrived.",
    },
    {
      kicker: "What you take home",
      title: "The room, the positioning, the footage.",
      body: "A social-aura masterweek: how the room is set, and how a moment is left alone long enough to be real. Personal-brand positioning while you are there — which frames to keep, and a feed that still feels like you. And a shared B-roll library of the group's footage, including Brian's, for you to use.",
    },
  ] satisfies TripSection[],
} as const;

export const houseEvents: EventRecord[] = [
  {
    id: SESEH_TRIP.eventId,
    title: SESEH_TRIP.title,
    kind: "trip",
    summary: SESEH_TRIP.summary,
    longDescription: SESEH_TRIP.lede,
    city: SESEH_TRIP.city,
    startsAt: SESEH_TRIP.startsAt,
    endsAt: SESEH_TRIP.endsAt,
    capacity: SESEH_TRIP.capacity,
    registered: 0,
    waitlist: 0,
    channelSlug: "events",
    isDemo: false,
    paymentRequired: false,
    listingState: "planned",
  },
];

export function tripForEvent(eventId: string) {
  return eventId === SESEH_TRIP.eventId ? SESEH_TRIP : null;
}
