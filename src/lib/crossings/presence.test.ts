import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  PRESENCE_KIND_LABELS,
  presenceLine,
  summarizeCityPresence,
} from "@/lib/crossings/presence";

describe("city presence", () => {
  it("counts people by role without inventing geography", () => {
    const summary = summarizeCityPresence([
      { kind: "local", inMeridian10: true, inMeridian100: true },
      { kind: "local", inMeridian10: false, inMeridian100: false },
      { kind: "fellow_traveler", inMeridian10: false, inMeridian100: true },
      { kind: "city_host", inMeridian10: false, inMeridian100: false },
      { kind: "meridian", inMeridian10: false, inMeridian100: true },
    ]);
    assert.equal(summary.total, 4);
    assert.equal(summary.local, 2);
    assert.equal(summary.fellow_traveler, 1);
    assert.equal(summary.city_host, 1);
    assert.equal(summary.meridian, 1);
    assert.equal(summary.inCity.every((row) => row.kind !== "meridian"), true);
    assert.equal(PRESENCE_KIND_LABELS.local, "Local");
    assert.equal(presenceLine("fellow_traveler", "Chicago"), "Also traveling here");
    assert.equal(presenceLine("local", "Paris"), "Lives in Paris");
    const withCircle = summarizeCityPresence(
      [
        { kind: "local", inMeridian10: true, target: { id: "a" } },
        { kind: "fellow_traveler", inMeridian10: false, target: { id: "b" } },
      ],
      ["b"],
    );
    assert.equal(withCircle.meridian, 1);
  });

  it("replaces the fake atlas with a readable city list", () => {
    const atlas = readFileSync("src/components/crossings/city-atlas.tsx", "utf8");
    assert.equal(atlas.includes("<svg"), false);
    assert.equal(atlas.includes("10°"), false);
    assert.equal(atlas.includes("MARKS"), false);
    assert.equal(atlas.includes("atlas-grid"), false);
    assert.match(atlas, /People in this city|In this city/);
    assert.match(atlas, /never precise pins/i);
    assert.match(atlas, /never live location/i);
    assert.match(atlas, /summarizeCityPresence/);
  });

  it("puts the real trip over its still, not a decorative plate", () => {
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    assert.equal(home.includes("HiggsfieldSlot"), false);
    assert.equal(home.includes('campaignSrc("homeIndex")'), false);
    assert.equal(home.includes('campaignSrc("homeNetwork")'), false);
    assert.match(home, /journeyStillSrc/);
    assert.match(home, /OccasionFrame/);
    assert.match(home, /Open this trip/);
    assert.match(home, /grid-cols-2/);
    assert.match(home, /md:grid-cols-4/);
  });
});
