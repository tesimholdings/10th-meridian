import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { isPostgresProfileId, loadHybridMatchIndex } from "@/lib/matching/postgres";

describe("hybrid Meridian matching", () => {
  it("falls back to TypeScript for DEMO ids and keeps circle sizes", async () => {
    const viewer = demoProfiles[0];
    assert.equal(isPostgresProfileId(viewer.id), false);
    const index = await loadHybridMatchIndex({
      viewer,
      members: demoProfiles,
      useSemantic: false,
    });
    assert.equal(index.source, "typescript");
    assert.equal(index.persisted, false);
    assert.ok(index.meridian10.length <= 10);
    assert.ok(index.meridian100.length <= 100);
    assert.ok(index.meridian10.every((row) => row.target.id !== viewer.id));
  });
});
