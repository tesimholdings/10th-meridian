import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { demoChannelMembers, demoChannels } from "@/lib/data/demo";
import { houseChannelCatalog } from "@/lib/stream/house";
import {
  excerpt,
  hrefForStreamChannel,
  pushRecipientIds,
  readWebhookMessage,
  resolveStreamAuthor,
  streamTargetForChannel,
  verifyStreamWebhookSignature,
  webPushSubject,
} from "@/lib/stream/push-plan";
import {
  dropWebPush,
  fcmTokenFromEndpoint,
  mergeWebPush,
} from "@/lib/stream/push-shared";
import { linkedPushUserIds, sessionPushUserIds, streamSeedRoster } from "@/lib/stream/roster";
import { seedHouseChannels } from "@/lib/stream/seed";
import { relayDemoMessage } from "@/lib/stream/relay";

describe("Stream house channels and push", () => {
  it("catalogs the SETUP house channels with stable ids", () => {
    const channels = houseChannelCatalog();
    assert.deepEqual(
      channels.map((channel) => channel.slug),
      [
        "announcements",
        "introductions",
        "ask-and-offer",
        "opportunities",
        "events",
        "travel",
        "ideas",
      ],
    );
    const announcements = channels[0];
    assert.equal(announcements.id, "channel-announcements");
    assert.equal(announcements.cid, "messaging:channel-announcements");
    assert.equal(hrefForStreamChannel("channel-ask-and-offer"), "/member/messages?channel=ch-ask");
  });

  it("upserts demo and founding members, including P. Adler, and skips field filler", () => {
    const roster = streamSeedRoster();
    const adler = roster.find((member) => member.name === "P. Adler");
    assert.ok(adler);
    assert.equal(adler.id, "demo-12");
    assert.ok(roster.some((member) => member.id === "member-stefan-fulks"));
    assert.ok(roster.some((member) => member.id === "member-ricky-del-valle"));
    assert.equal(
      roster.some((member) => member.id.startsWith("demo-field-")),
      false,
    );
    assert.deepEqual(sessionPushUserIds("preview-member").sort(), ["demo-01", "preview-member"]);
    assert.ok(linkedPushUserIds("demo-01").includes("preview-member"));
  });

  it("plans recipients without notifying the sender", () => {
    const introductions = demoChannels.find((channel) => channel.slug === "introductions");
    assert.ok(introductions);
    const recipients = pushRecipientIds({
      slug: introductions.slug,
      kind: introductions.kind,
      memberIds: demoChannelMembers[introductions.id] ?? [],
      rosterIds: streamSeedRoster().map((member) => member.id),
      excludeIds: linkedPushUserIds("demo-01"),
    });
    assert.deepEqual(recipients.sort(), ["demo-09", "demo-12"]);

    const announced = pushRecipientIds({
      slug: "announcements",
      kind: "broadcast",
      memberIds: [],
      rosterIds: streamSeedRoster().map((member) => member.id),
      excludeIds: linkedPushUserIds("preview-member"),
    });
    assert.equal(announced.includes("demo-12"), true);
    assert.equal(announced.includes("demo-01"), false);
    assert.equal(announced.includes("preview-member"), false);

    const dm = streamTargetForChannel({
      slug: "dm-adler",
      kind: "dm",
      memberIds: ["demo-12", "demo-01"],
    });
    assert.equal(dm?.id, "dm-demo-01-demo-12");
    assert.equal(
      resolveStreamAuthor({
        authorId: "preview-member",
        authorName: "P. Adler",
        profiles: [{ id: "demo-12", displayName: "P. Adler" }],
      }),
      "demo-12",
    );
    assert.equal(excerpt("  hello   house  "), "hello house");
  });

  it("verifies Stream webhook signatures and skips relayed messages", () => {
    const body = JSON.stringify({ type: "message.new", message: { text: "Hello", tm_web_push: "sent" } });
    const secret = "test-secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    assert.equal(verifyStreamWebhookSignature(body, signature, secret), true);
    assert.equal(verifyStreamWebhookSignature(body, "deadbeef", secret), false);
    assert.equal(verifyStreamWebhookSignature(body, signature, ""), false);
    const parsed = readWebhookMessage(JSON.parse(body));
    assert.equal(parsed?.skip, "relayed");
    assert.equal(readWebhookMessage({ type: "user.updated" })?.skip, "not-message");
    assert.equal(webPushSubject("team@tenmeridian.com"), "mailto:team@tenmeridian.com");
  });

  it("keeps one subscription per endpoint and ignores non-FCM urls", () => {
    const first = { endpoint: "https://push.example/a", p256dh: "p", auth: "a" };
    const replaced = { endpoint: "https://push.example/a", p256dh: "p2", auth: "a2" };
    const second = { endpoint: "https://push.example/b", p256dh: "p", auth: "a" };
    const merged = mergeWebPush([first], replaced);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.p256dh, "p2");
    assert.equal(dropWebPush(mergeWebPush(merged, second), first.endpoint).length, 1);
    assert.equal(
      fcmTokenFromEndpoint("https://fcm.googleapis.com/fcm/send/abcdefghijklmnopqrstu"),
      "abcdefghijklmnopqrstu",
    );
    assert.equal(fcmTokenFromEndpoint("https://web.push.apple.com/Qabc"), null);
  });

  it("does not call Stream when keys are absent", async () => {
    const seeded = await seedHouseChannels();
    if (!process.env.NEXT_PUBLIC_STREAM_API_KEY?.trim() || !process.env.STREAM_API_SECRET?.trim()) {
      assert.equal(seeded.stub, true);
      assert.equal(seeded.ok, true);
      assert.equal(seeded.channels.length, 7);
      assert.equal(seeded.memberIds.includes("demo-12"), true);
    }
    await relayDemoMessage({
      demoChannelId: "ch-announcements",
      body: "Hello",
      authorId: "preview-member",
      authorName: "A. Voss",
    });
  });
});
