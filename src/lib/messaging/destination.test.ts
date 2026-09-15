import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findDirectMessage,
  messageHref,
  resolveMessageDestination,
} from "@/lib/messaging/destination";
import type { ChannelRecord, ProfileRecord } from "@/lib/data/types";

const viewer = { id: "demo-01", displayName: "A. Voss", city: "Chicago" } as ProfileRecord;
const adler = { id: "demo-12", displayName: "P. Adler", city: "New York" } as ProfileRecord;
const moreau = { id: "demo-09", displayName: "C. Moreau", city: "Paris" } as ProfileRecord;

const introductions: ChannelRecord = {
  id: "ch-introductions",
  slug: "introductions",
  name: "Introductions",
  kind: "public",
  topic: "How one arrives",
  unread: 2,
  isDemo: true,
};
const dmAdler: ChannelRecord = {
  id: "dm-demo-01-demo-12",
  slug: "dm-p-adler",
  name: "Message · P. Adler",
  kind: "dm",
  topic: "Private",
  unread: 0,
  isDemo: true,
};

const channels = [introductions, dmAdler];
const channelMembers = {
  "ch-introductions": ["demo-01", "demo-12", "demo-09"],
  "dm-demo-01-demo-12": ["demo-01", "demo-12"],
};
const profiles = [viewer, adler, moreau];

describe("DM destination", () => {
  it("opens P. Adler's DM and never falls back to Introductions", () => {
    const resolved = resolveMessageDestination({
      request: { profileId: "demo-12" },
      viewerId: "demo-01",
      channels,
      channelMembers,
      profiles,
    });
    assert.equal(resolved.status, "ok");
    assert.equal(resolved.channel?.id, "dm-demo-01-demo-12");
    assert.equal(resolved.headerName, "P. Adler");
    assert.equal(resolved.canCompose, true);
    assert.notEqual(resolved.channel?.slug, "introductions");
  });

  it("disables compose and names the member when the DM cannot load", () => {
    const resolved = resolveMessageDestination({
      request: { profileId: "demo-12" },
      viewerId: "demo-01",
      channels: [introductions],
      channelMembers: { "ch-introductions": ["demo-01", "demo-12"] },
      profiles,
    });
    assert.equal(resolved.status, "unavailable");
    assert.equal(resolved.canCompose, false);
    assert.equal(resolved.headerName, "P. Adler");
    assert.match(resolved.message ?? "", /P\. Adler/);
    assert.doesNotMatch(resolved.message ?? "", /^$/);
  });

  it("does not treat a missing destination as Introductions", () => {
    const resolved = resolveMessageDestination({
      request: {},
      viewerId: "demo-01",
      channels,
      channelMembers,
      profiles,
    });
    assert.equal(resolved.status, "inbox");
    assert.equal(resolved.canCompose, false);
    assert.notEqual(resolved.channel?.id, "ch-introductions");
  });

  it("builds a stable href that survives refresh", () => {
    assert.equal(messageHref({ profileId: "demo-12", channelId: "dm-demo-01-demo-12" }), "/member/messages?to=demo-12&channel=dm-demo-01-demo-12");
    assert.equal(
      findDirectMessage({
        fromId: "demo-01",
        toId: "demo-12",
        channels,
        channelMembers,
      })?.id,
      "dm-demo-01-demo-12",
    );
  });
});
