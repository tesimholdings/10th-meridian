import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { complementaryScore, scorePair, weigh } from "@/lib/matching/score";
import { computeMatchIndex } from "@/lib/matching/service";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";

describe("Meridian Index structured scoring", () => {
  it("scores complementary ask/offer higher than unrelated pairs", () => {
    const operator = demoProfiles.find((p) => p.id === "demo-01")!;
    const investor = demoProfiles.find((p) => p.id === "demo-02")!;
    const distant = demoProfiles.find((p) => p.id === "demo-11")!;
    const close = complementaryScore(operator, investor).score;
    const far = complementaryScore(operator, distant).score;
    assert.ok(close >= far);
  });

  it("weights sum to a 0-1 score and respect complementary emphasis", () => {
    const a = demoProfiles[0];
    const b = demoProfiles[1];
    const raw = scorePair(a, b);
    const score = weigh(raw, DEFAULT_WEIGHTS);
    assert.ok(score >= 0 && score <= 1);
    const highComp = weigh({ ...raw, complementary: 1 }, DEFAULT_WEIGHTS);
    const lowComp = weigh({ ...raw, complementary: 0 }, DEFAULT_WEIGHTS);
    assert.ok(highComp > lowComp);
  });

  it("returns at most ten Meridian 10 and never invents profiles", async () => {
    const viewer = demoProfiles[0];
    const index = await computeMatchIndex({
      viewer,
      members: demoProfiles,
      useSemantic: false,
    });
    assert.ok(index.meridian10.length <= 10);
    assert.ok(index.meridian100.length <= demoProfiles.length - 1);
    for (const row of index.meridian100) {
      assert.ok(demoProfiles.some((p) => p.id === row.target.id));
      assert.notEqual(row.target.id, viewer.id);
    }
  });

  it("does not repeatedly recommend declined or hidden people", async () => {
    const viewer = demoProfiles[0];
    const hiddenId = demoProfiles[1].id;
    const index = await computeMatchIndex({
      viewer,
      members: demoProfiles,
      useSemantic: false,
      feedback: [
        { viewerId: viewer.id, targetId: hiddenId, signal: "declined" },
      ],
    });
    assert.equal(
      index.meridian100.find((m) => m.target.id === hiddenId),
      undefined,
    );
  });

  it("marks human-curated promotions distinctly", async () => {
    const viewer = demoProfiles[0];
    const index = await computeMatchIndex({
      viewer,
      members: demoProfiles,
      useSemantic: false,
      curation: [
        {
          viewerId: viewer.id,
          targetId: "demo-12",
          action: "promote",
          reason: "Steward override for review.",
        },
      ],
    });
    const curated = index.meridian100.find((m) => m.target.id === "demo-12");
    assert.ok(curated);
    assert.equal(curated?.source, "human_curated");
  });
});
