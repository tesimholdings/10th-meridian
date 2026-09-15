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
      { kind: "local" },
      { kind: "local" },
      { kind: "fellow_traveler" },
      { kind: "city_host" },
      { kind: "meridian" },
    ]);
    assert.equal(summary.total, 5);
    assert.equal(summary.local, 2);
    assert.equal(summary.fellow_traveler, 1);
    assert.equal(summary.city_host, 1);
    assert.equal(summary.meridian, 1);
    assert.equal(PRESENCE_KIND_LABELS.local, "Local");
    assert.equal(presenceLine("fellow_traveler", "Chicago"), "Also traveling here");
    assert.equal(presenceLine("local", "Paris"), "Lives in Paris");
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

  it("keeps Home free of decorative Crossing stills", () => {
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    assert.equal(home.includes("HiggsfieldSlot"), false);
    assert.equal(home.includes("journeyStillSrc"), false);
    assert.equal(home.includes("occasionCredit"), false);
    assert.match(home, /Open this trip/);
    assert.match(home, /grid-cols-2/);
    assert.match(home, /md:grid-cols-4/);
  });
});
