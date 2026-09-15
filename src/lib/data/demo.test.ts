import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { FOUNDING_MEMBER } from "@/lib/copy/ui";

const named = [
  { id: "member-stefan-fulks", name: "Stefan Fulks", founding: true },
  { id: "member-ricky-del-valle", name: "Ricky Del Valle", founding: true },
  { id: "member-spencer-gilmore", name: "Spencer Gilmore", founding: false },
  { id: "member-julio-lopez", name: "Julio Lopez", founding: false },
  { id: "member-austin-thorpe", name: "Austin Thorpe", founding: false },
] as const;

describe("editorial demo members", () => {
  it("seeds the five named members and badges founding members", () => {
    for (const row of named) {
      const profile = demoProfiles.find((p) => p.id === row.id);
      assert.ok(profile, row.name);
      assert.equal(profile?.displayName, row.name);
      assert.equal(Boolean(profile?.foundingMember), row.founding);
    }
    assert.equal(FOUNDING_MEMBER, "Founding member");
    assert.ok(demoProfiles.length >= 100, "field density for Meridian 10–100");
  });
});
