import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { parseAsk } from "@/lib/matching/ask/parse";
import { askComplementary, visibleAskMembers } from "@/lib/matching/ask/score";
import { computeAskIndex } from "@/lib/matching/ask/service";

const viewer = demoProfiles.find((p) => p.id === "demo-01")!;
const investorNyc = demoProfiles.find((p) => p.id === "demo-13")!;
const distant = demoProfiles.find((p) => p.id === "demo-11")!;

describe("Ask the Meridian scoring", () => {
  it("scores complementarity higher for a helper than an unrelated pair", () => {
    const parsed = parseAsk({
      query: "I need an intro to Series A fintech investors in NYC",
    });
    const close = askComplementary(investorNyc, parsed).score;
    const far = askComplementary(distant, parsed).score;
    assert.ok(close > far);
  });

  it("ranks people who can help above unrelated members", async () => {
    const index = await computeAskIndex({
      viewer,
      members: demoProfiles,
      query: "I need an intro to Series A fintech investors in NYC",
      useSemantic: false,
    });
    assert.equal(index.emptyQuery, false);
    assert.ok(index.people.length > 0);
    const ids = index.people.map((m) => m.target.id);
    assert.ok(ids.includes("demo-13"));
    const helperRank = ids.indexOf("demo-13");
    const farRank = ids.indexOf("demo-11");
    if (farRank >= 0) {
      assert.ok(helperRank < farRank);
    }
    assert.ok(index.people[0].explanations.some((e) => e.pillar.length > 0));
  });

  it("returns no invented people for an empty query", async () => {
    const index = await computeAskIndex({
      viewer,
      members: demoProfiles,
      query: "   ",
      useSemantic: false,
    });
    assert.equal(index.emptyQuery, true);
    assert.deepEqual(index.people, []);
  });

  it("excludes hidden, blocked, paused, and not-relevant people", async () => {
    const paused = { ...investorNyc, id: "demo-paused", availability: "paused" as const };
    const hidden = { ...investorNyc, id: "demo-hidden", visibility: "hidden" as const };
    const index = await computeAskIndex({
      viewer,
      members: [...demoProfiles, paused, hidden],
      query: "I need an intro to Series A fintech investors in NYC",
      useSemantic: false,
      blocks: [{ a: viewer.id, b: "demo-13" }],
      indexFeedback: [{ viewerId: viewer.id, targetId: "demo-02", signal: "not_relevant" }],
      standings: { "demo-12": "suspended" },
    });
    const ids = index.people.map((m) => m.target.id);
    assert.equal(ids.includes("demo-paused"), false);
    assert.equal(ids.includes("demo-hidden"), false);
    assert.equal(ids.includes("demo-13"), false);
    assert.equal(ids.includes("demo-02"), false);
    assert.equal(ids.includes("demo-12"), false);
    assert.equal(ids.includes(viewer.id), false);
  });

  it("Open House isolation never exposes non-demo members", async () => {
    const real = {
      ...investorNyc,
      id: "real-member",
      isDemo: false,
      displayName: "A real person",
    };
    const guests = visibleAskMembers([...demoProfiles, real], false);
    assert.equal(guests.some((p) => p.id === "real-member"), false);
    assert.ok(guests.every((p) => p.isDemo));

    const index = await computeAskIndex({
      viewer,
      members: [...demoProfiles, real],
      query: "I need an intro to Series A fintech investors in NYC",
      useSemantic: false,
      isMemberAccess: false,
    });
    assert.equal(index.openHouseIsolation, true);
    assert.equal(
      index.people.find((m) => m.target.id === "real-member"),
      undefined,
    );
    assert.ok(index.people.every((m) => m.target.isDemo));
  });

  it("hides ask-level not_relevant and labels human curation", async () => {
    const index = await computeAskIndex({
      viewer,
      members: demoProfiles,
      query: "I need an intro to Series A fintech investors in NYC",
      askId: "ask-test-curation",
      useSemantic: false,
      feedback: [
        {
          askId: "ask-test-curation",
          viewerId: viewer.id,
          targetId: "demo-04",
          signal: "not_relevant",
        },
      ],
      curation: [
        {
          viewerId: viewer.id,
          targetId: "demo-13",
          action: "promote",
          reason: "Steward: this introduction craft meets the stated need.",
        },
      ],
    });
    assert.equal(
      index.people.find((m) => m.target.id === "demo-04"),
      undefined,
    );
    const curated = index.people.find((m) => m.target.id === "demo-13");
    assert.ok(curated);
    assert.equal(curated?.source, "human_curated");
    assert.ok(curated?.explanations.some((e) => e.pillar === "Human curation"));
  });
});
