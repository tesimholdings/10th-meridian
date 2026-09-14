import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { presentProfile } from "@/lib/network/privacy";

describe("profile privacy", () => {
  it("hides optional fields the subject has turned off", () => {
    const moreau = demoProfiles.find((p) => p.id === "demo-09");
    assert.ok(moreau);
    assert.equal(moreau.privacy.needs, false);
    const shown = presentProfile(moreau, { viewerId: "demo-01" });
    assert.equal(shown.website, undefined);
    assert.equal(shown.linkedin, undefined);
    assert.deepEqual(shown.needs, []);
    assert.ok(shown.offers.length > 0);
    assert.ok(shown.gallery.length > 0);
  });

  it("lets the owner see their own optional fields", () => {
    const moreau = demoProfiles.find((p) => p.id === "demo-09");
    assert.ok(moreau);
    const self = presentProfile(moreau, { viewerId: "demo-09" });
    assert.deepEqual(self.needs, moreau.needs);
  });

  it("keeps city-level identity visible even when optional fields are hidden", () => {
    const moreau = demoProfiles.find((p) => p.id === "demo-09");
    assert.ok(moreau);
    const shown = presentProfile(moreau, { viewerId: "demo-01", isOpenHouseGuest: true });
    assert.equal(shown.city, "Paris");
    assert.equal(shown.roleTitle, "Cultural leader");
    assert.equal(shown.company, "Maison North");
  });
});
