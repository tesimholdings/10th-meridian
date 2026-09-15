import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mutualConnections, mutualHref } from "@/lib/network/mutual";
import type { ChannelRecord, EventRecord, ProfileRecord } from "@/lib/data/types";
import type { CircleEdge } from "@/lib/network/types";

const viewer = {
  id: "demo-01",
  displayName: "A. Voss",
  initials: "AV",
  attendingEventIds: ["evt-demo-1"],
} as unknown as ProfileRecord;
const adler = {
  id: "demo-12",
  displayName: "P. Adler",
  initials: "PA",
  attendingEventIds: ["evt-demo-1"],
} as unknown as ProfileRecord;
const ellison = {
  id: "demo-03",
  displayName: "S. Ellison",
  initials: "SE",
  attendingEventIds: [],
} as unknown as ProfileRecord;

const circle: CircleEdge[] = [
  { ownerId: "demo-01", memberId: "demo-12", addedAt: "2026-09-08T12:00:00.000Z" },
  { ownerId: "demo-01", memberId: "demo-03", addedAt: "2026-09-09T09:00:00.000Z" },
  { ownerId: "demo-12", memberId: "demo-03", addedAt: "2026-09-08T13:00:00.000Z" },
  { ownerId: "demo-12", memberId: "demo-01", addedAt: "2026-09-08T12:05:00.000Z" },
];

const introductions: ChannelRecord = {
  id: "ch-introductions",
  slug: "introductions",
  name: "Introductions",
  kind: "public",
  topic: "How one arrives",
  unread: 0,
  isDemo: true,
};
const chapter: ChannelRecord = {
  id: "ch-chapter-chicago",
  slug: "chapter-chicago",
  name: "Chapter · Chicago",
  kind: "chapter",
  topic: "Chicago",
  unread: 0,
  isDemo: true,
};
const dm: ChannelRecord = {
  id: "dm-demo-01-demo-12",
  slug: "dm-p-adler",
  name: "P. Adler",
  kind: "dm",
  topic: "Private",
  unread: 0,
  isDemo: true,
};
const event: EventRecord = {
  id: "evt-demo-1",
  title: "Open House Evening — the tenth",
  kind: "open_house",
  summary: "DEMO",
  city: "Chicago",
  startsAt: "2026-10-10T17:00:00-05:00",
  endsAt: "2026-10-10T22:00:00-05:00",
  capacity: 40,
  registered: 0,
  waitlist: 0,
  isDemo: true,
  paymentRequired: false,
  listingState: "planned",
};

describe("in common", () => {
  it("types people, channels, and events and never 404s a channel as a member", () => {
    const mutual = mutualConnections({
      viewerId: "demo-01",
      targetId: "demo-12",
      profiles: [viewer, adler, ellison],
      circle,
      channels: [introductions, chapter, dm],
      channelMembers: {
        "ch-introductions": ["demo-01", "demo-12"],
        "ch-chapter-chicago": ["demo-01", "demo-12"],
        "dm-demo-01-demo-12": ["demo-01", "demo-12"],
      },
      events: [event],
    });
    const people = mutual.filter((m) => m.kind === "circle");
    const channels = mutual.filter((m) => m.kind === "channel");
    const events = mutual.filter((m) => m.kind === "event");
    assert.equal(people.map((p) => p.displayName).join(), "S. Ellison");
    assert.equal(people.some((p) => p.refId === "demo-12" || p.refId === "demo-01"), false);
    assert.equal(channels.some((c) => c.kind === "channel" && c.refId.startsWith("dm-")), false);
    assert.equal(
      channels.every((c) => mutualHref(c).startsWith("/member/messages?")),
      true,
    );
    assert.equal(
      channels.every((c) => !mutualHref(c).includes("/member/members/")),
      true,
    );
    assert.equal(events[0]?.kind, "event");
    assert.equal(mutualHref(events[0]!), "/member/events/evt-demo-1");
    assert.match(people[0]?.label ?? "", /S\. Ellison/);
  });
});
