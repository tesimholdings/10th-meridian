import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { demoCityHosts, demoJourneys } from "@/lib/data/crossings-demo";
import { computeMatchIndex } from "@/lib/matching/service";
import { scoreTravelMatches, suggestTables } from "@/lib/crossings/matching";
import { DEFAULT_TRAVEL_WEIGHTS } from "@/lib/crossings/types";
import type { JourneyRecord } from "@/lib/crossings/types";

const viewer = demoProfiles.find((p) => p.id === "demo-01")!;
const paris = demoJourneys.find((j) => j.id === "jny-demo-01")!;

describe("Crossings travel matching", () => {
  it("finds locals, fellow travelers, City Hosts, and Meridian overlap in the destination", async () => {
    const meridian = await computeMatchIndex({
      viewer,
      members: demoProfiles,
      useSemantic: false,
    });
    const ranked = scoreTravelMatches({
      viewer,
      viewerJourney: paris,
      members: demoProfiles,
      journeys: demoJourneys,
      hosts: demoCityHosts,
      meridian,
    });
    assert.ok(ranked.length >= 3);
    const kinds = new Set(ranked.map((r) => r.kind));
    assert.ok(kinds.has("city_host") || ranked.some((r) => r.target.id === "demo-09"));
    assert.ok(ranked.some((r) => r.kind === "fellow_traveler"));
    assert.ok(ranked.every((r) => r.why.length > 0));
    assert.ok(ranked.every((r) => r.explanations.length > 0));
  });

  it("excludes blocked, hidden, paused, suspended, and expired members", async () => {
    const hidden = { ...demoProfiles[1], visibility: "hidden" as const };
    const paused = { ...demoProfiles[2], availability: "paused" as const };
    const meridian = await computeMatchIndex({
      viewer,
      members: demoProfiles,
      useSemantic: false,
    });
    const ranked = scoreTravelMatches({
      viewer,
      viewerJourney: paris,
      members: [hidden, paused, ...demoProfiles.filter((p) => p.id !== hidden.id && p.id !== paused.id)],
      journeys: demoJourneys,
      hosts: demoCityHosts,
      meridian,
      blocks: [{ a: viewer.id, b: "demo-08" }],
      standings: { "demo-05": "suspended", "demo-02": "expired" },
    });
    const ids = ranked.map((r) => r.target.id);
    assert.equal(ids.includes(hidden.id), false);
    assert.equal(ids.includes(paused.id), false);
    assert.equal(ids.includes("demo-08"), false);
    assert.equal(ids.includes("demo-05"), false);
    assert.equal(ids.includes("demo-02"), false);
  });

  it("does not rank by wealth, popularity, or message volume", async () => {
    const wealthy = {
      ...demoProfiles[3],
      id: "demo-wealth",
      city: "Paris",
      country: "France",
      headline: "irrelevant wealth marker",
      goals: [] as string[],
      offers: [] as string[],
      needs: [] as string[],
      interests: ["unrelated"],
    };
    const quiet = demoProfiles.find((p) => p.id === "demo-09")!;
    const meridian = await computeMatchIndex({
      viewer,
      members: [...demoProfiles, wealthy],
      useSemantic: false,
    });
    const ranked = scoreTravelMatches({
      viewer,
      viewerJourney: paris,
      members: [...demoProfiles, wealthy],
      journeys: demoJourneys,
      hosts: demoCityHosts,
      meridian,
    });
    const host = ranked.find((r) => r.target.id === quiet.id);
    assert.ok(host);
    assert.equal(host?.kind, "city_host");
    for (const row of ranked) {
      assert.equal("wealth" in row, false);
      assert.equal("popularity" in row, false);
      assert.equal("followers" in row, false);
      assert.equal("messageVolume" in row, false);
      assert.equal(/wealth|popular|follower|message volume/i.test(row.why), false);
    }
  });

  it("travel weights are configurable and change ranking emphasis", () => {
    const lowMeridian = scoreTravelMatches({
      viewer,
      viewerJourney: paris,
      members: demoProfiles,
      journeys: demoJourneys,
      hosts: demoCityHosts,
      travelWeights: { ...DEFAULT_TRAVEL_WEIGHTS, meridian: 0.05, overlap: 0.7 },
    });
    const highMeridian = scoreTravelMatches({
      viewer,
      viewerJourney: paris,
      members: demoProfiles,
      journeys: demoJourneys,
      hosts: demoCityHosts,
      travelWeights: { ...DEFAULT_TRAVEL_WEIGHTS, meridian: 0.8, overlap: 0.05 },
    });
    const sample = lowMeridian.find((r) => r.target.id === "demo-02");
    const sampleHigh = highMeridian.find((r) => r.target.id === "demo-02");
    if (sample && sampleHigh) {
      assert.notEqual(sample.weighted, sampleHigh.weighted);
    } else {
      assert.notEqual(lowMeridian.map((r) => r.weighted).join(","), highMeridian.map((r) => r.weighted).join(","));
    }
  });

  it("paused and expired journeys do not participate as fellow travelers", () => {
    const ranked = scoreTravelMatches({
      viewer,
      viewerJourney: paris,
      members: demoProfiles,
      journeys: demoJourneys,
      hosts: [],
    });
    assert.equal(
      ranked.some((r) => r.targetJourneyId === "jny-demo-paused"),
      false,
    );
    assert.equal(
      ranked.some((r) => r.targetJourneyId === "jny-demo-expired"),
      false,
    );
  });

  it("suggests Open a Table when three or more compatible paths overlap", () => {
    const suggestions = suggestTables({
      journeys: demoJourneys.filter((j) => j.status === "active") as JourneyRecord[],
      members: demoProfiles,
      viewerId: viewer.id,
    });
    const london = suggestions.find((s) => s.city === "London");
    const parisTable = suggestions.find((s) => s.city === "Paris");
    assert.ok(london && london.count >= 3);
    assert.ok(parisTable && parisTable.count >= 3);
  });
});
