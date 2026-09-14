import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { computeMatchIndex } from "@/lib/matching/service";
import {
  addMemberToCircle,
  getPreviewStore,
  hideFromIndex,
  removeMemberFromCircle,
  resetPreviewStore,
} from "@/lib/preview/store";
import { isInCircle } from "@/lib/network/circle";

describe("Your Circle and Index removals", () => {
  beforeEach(() => {
    resetPreviewStore();
  });

  it("adds and removes a member from Your Circle", () => {
    const store = getPreviewStore();
    const added = addMemberToCircle(store.viewerId, "demo-05");
    assert.equal(added.added, true);
    assert.equal(isInCircle(store.viewerId, "demo-05", added.edges), true);
    const removed = removeMemberFromCircle(store.viewerId, "demo-05");
    assert.equal(removed.removed, true);
    assert.equal(isInCircle(store.viewerId, "demo-05", removed.edges), false);
  });

  it("does not treat a Circle add as an Index suggestion", () => {
    const store = getPreviewStore();
    addMemberToCircle(store.viewerId, "demo-05");
    const edge = getPreviewStore().circle.find(
      (e) => e.ownerId === store.viewerId && e.memberId === "demo-05",
    );
    assert.ok(edge);
    assert.ok(!getPreviewStore().curation.some((c) => c.targetId === "demo-05" && c.action === "promote"));
  });

  it("removes a person from Index recommendations while leave/block still apply", async () => {
    const store = getPreviewStore();
    const hidden = hideFromIndex(store.viewerId, "demo-05");
    assert.equal(hidden.removed, true);
    const index = await computeMatchIndex({
      viewer: store.profiles[0],
      members: store.profiles,
      feedback: getPreviewStore().feedback,
      indexRemovedIds: getPreviewStore()
        .indexRemovals.filter((r) => r.viewerId === store.viewerId)
        .map((r) => r.targetId),
      useSemantic: false,
    });
    assert.equal(
      index.meridian100.find((m) => m.target.id === "demo-05"),
      undefined,
    );
  });
});
