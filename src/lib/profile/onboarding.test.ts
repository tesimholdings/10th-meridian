import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { scorePair } from "@/lib/matching/score";
import {
  FRESH_PREVIEW_ACCOUNT_ID,
  emptyOnboardingDraft,
  nextOnboardingStatus,
  normalizeOnboardingDraft,
  normalizeSocialInput,
  pathAfterMemberEnter,
  profileFromOnboarding,
  projectOnboarding,
  shouldOfferOnboardingAfterPayment,
  shouldPromptOnboarding,
} from "@/lib/profile/onboarding";

describe("profile onboarding", () => {
  it("prompts a fresh member once, and not a settled or demo session", () => {
    assert.equal(
      shouldPromptOnboarding({
        role: "member",
        accountId: "acc-1",
        cookie: { accountId: "acc-1", status: "pending" },
        db: "unknown",
        isDemo: true,
      }),
      true,
    );
    assert.equal(
      shouldPromptOnboarding({
        role: "member",
        accountId: "acc-1",
        cookie: { accountId: "acc-1", status: "skipped" },
        db: "pending",
        isDemo: false,
      }),
      false,
    );
    assert.equal(
      shouldPromptOnboarding({
        role: "member",
        accountId: "acc-1",
        cookie: { accountId: "acc-1", status: "completed" },
        db: "pending",
        isDemo: false,
      }),
      false,
    );
    assert.equal(
      shouldPromptOnboarding({
        role: "member",
        accountId: "acc-1",
        cookie: null,
        db: "pending",
        isDemo: false,
      }),
      true,
    );
    assert.equal(
      shouldPromptOnboarding({
        role: "member",
        accountId: "preview-member",
        cookie: null,
        db: "unknown",
        isDemo: true,
      }),
      false,
    );
    assert.equal(
      shouldPromptOnboarding({
        role: "administrator",
        accountId: "acc-1",
        cookie: null,
        db: "pending",
        isDemo: false,
      }),
      false,
    );
    assert.equal(
      shouldPromptOnboarding({
        role: "approved_unpaid",
        accountId: "acc-1",
        cookie: { accountId: "acc-1", status: "pending" },
        db: "pending",
        isDemo: false,
      }),
      false,
    );
  });

  it("sends a paid new member to the builder and leaves a finished one on billing", () => {
    assert.equal(
      shouldOfferOnboardingAfterPayment({
        accountId: "acc-1",
        cookie: null,
        db: "pending",
      }),
      true,
    );
    assert.equal(
      shouldOfferOnboardingAfterPayment({
        accountId: "acc-1",
        cookie: { accountId: "acc-1", status: "completed" },
        db: "pending",
      }),
      false,
    );
    assert.equal(pathAfterMemberEnter("member", true), "/onboarding");
    assert.equal(pathAfterMemberEnter("member", false), "/member/home");
    assert.equal(pathAfterMemberEnter("approved_unpaid", true), "/member/billing");
    assert.equal(pathAfterMemberEnter("administrator", true), "/member/home");
  });

  it("keeps skip and complete from being reopened by a partial save", () => {
    assert.equal(nextOnboardingStatus("pending", "save"), "pending");
    assert.equal(nextOnboardingStatus("pending", "skip"), "skipped");
    assert.equal(nextOnboardingStatus("pending", "complete"), "completed");
    assert.equal(nextOnboardingStatus("completed", "save"), "completed");
    assert.equal(nextOnboardingStatus("skipped", "save"), "skipped");
    assert.equal(nextOnboardingStatus(null, "skip"), "skipped");
  });

  it("accepts a profile link or a handle and rejects other schemes", () => {
    const instagram = normalizeSocialInput("instagram", "@quiet.room");
    assert.equal(instagram.ok, true);
    if (instagram.ok) assert.equal(instagram.url, "https://www.instagram.com/quiet.room");
    const linked = normalizeSocialInput(
      "linkedin",
      "https://www.linkedin.com/in/demo-voss",
    );
    assert.equal(linked.ok, true);
    if (linked.ok) assert.match(linked.url, /^https:\/\/www\.linkedin\.com\/in\/demo-voss/);
    assert.equal(normalizeSocialInput("x", "javascript:alert(1)").ok, false);
    assert.equal(normalizeSocialInput("other", "not a url").ok, false);
    assert.deepEqual(normalizeSocialInput("facebook", ""), { ok: true, url: "" });
  });

  it("stores intents and the sentence as matching fields", () => {
    const normalized = normalizeOnboardingDraft({
      ...emptyOnboardingDraft(),
      linkedin: "https://www.linkedin.com/in/demo-voss",
      knownFor: "I build quiet companies and host dinners in Lisbon.",
      aboutNow: "Opening a second studio.",
      basedIn: "Mexico City",
      bio: "Operator, founder, and the person who remembers the wine.",
      interests: "architecture, long walks",
      intents: ["travel", "mentor", "not-a-real-intent"],
      intentNote: "I want a few people I can travel with.",
      others: [{ label: "Threads", url: "https://www.threads.net/@example" }],
    });
    assert.deepEqual(normalized.errors, []);
    assert.deepEqual(normalized.draft.intents, ["travel", "mentor"]);
    const projected = projectOnboarding(null, normalized.draft);
    assert.deepEqual(projected.intents, ["travel", "mentor"]);
    assert.equal(projected.intentNote, "I want a few people I can travel with.");
    assert.ok(projected.goals?.includes("Travel more"));
    assert.ok(projected.goals?.includes("Mentor"));
    assert.ok(projected.goals?.includes("I want a few people I can travel with."));
    assert.deepEqual(projected.interests, ["architecture", "long walks"]);
    assert.equal(projected.city, "Mexico City");
    assert.equal(projected.socialLinks?.[0]?.label, "Threads");

    const left = demoProfiles[0];
    const right = demoProfiles[1];
    assert.ok(left && right);
    const before = scorePair(left, right).goals;
    const after = scorePair(
      { ...left, intents: ["travel"], intentNote: "Lisbon host" },
      { ...right, intents: ["travel"], intentNote: "Lisbon host" },
    ).goals;
    assert.ok(after >= before);

    const presented = profileFromOnboarding({
      viewer: left,
      accountId: FRESH_PREVIEW_ACCOUNT_ID,
      name: "New Member",
      draft: normalized.draft,
    });
    assert.equal(presented.displayName, "New Member");
    assert.equal(presented.headline, normalized.draft.knownFor);
    assert.notEqual(presented.id, left.id);
  });

  it("keeps skip on every step and does not force the existing member preview", () => {
    const builder = readFileSync("src/components/profile/profile-builder.tsx", "utf8");
    const layout = readFileSync("src/app/member/layout.tsx", "utf8");
    const tools = readFileSync("src/components/preview/preview-tools.tsx", "utf8");
    const profile = readFileSync("src/app/member/profile/page.tsx", "utf8");
    const model = readFileSync("src/lib/profile/onboarding.ts", "utf8");
    assert.match(builder, /Skip for now/);
    assert.match(builder, /Your portrait/);
    assert.match(builder, /Use sample portrait/);
    assert.match(builder, /Choose a photo/);
    assert.match(builder, /Connect your socials/);
    assert.match(model, /LinkedIn/);
    assert.match(model, /Travel more/);
    assert.match(builder, /What should people know you for/);
    assert.match(layout, /shouldPromptOnboarding/);
    assert.match(tools, /Enter as new member/);
    assert.match(profile, /Finish your profile/);
  });
});
