import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composeDraftId, draftFor, parseDraftStore, upsertDraft } from "@/lib/messaging/drafts";

describe("conversation drafts", () => {
  it("scopes a DM, a channel, and a thread as independent keys", () => {
    const dm = composeDraftId("dm-demo-01-demo-12");
    const channel = composeDraftId("ch-introductions");
    const thread = composeDraftId("ch-introductions", "msg-2");
    assert.equal(dm, "dm-demo-01-demo-12::root");
    assert.equal(channel, "ch-introductions::root");
    assert.equal(thread, "ch-introductions::msg-2");
    assert.notEqual(dm, channel);
    assert.notEqual(channel, thread);
  });

  it("restores only the selected conversation's text", () => {
    let store = {};
    store = upsertDraft(store, composeDraftId("dm-a"), "Unsent audit draft.");
    store = upsertDraft(store, composeDraftId("ch-introductions"), "Channel note");
    assert.equal(draftFor(store, "dm-a"), "Unsent audit draft.");
    assert.equal(draftFor(store, "ch-introductions"), "Channel note");
    assert.equal(draftFor(store, "dm-b"), "");
    store = upsertDraft(store, composeDraftId("dm-a"), "");
    assert.equal(draftFor(store, "dm-a"), "");
    assert.equal(draftFor(store, "ch-introductions"), "Channel note");
  });

  it("ignores malformed storage instead of leaking another draft", () => {
    assert.deepEqual(parseDraftStore("not-json"), {});
    assert.deepEqual(parseDraftStore("[]"), {});
    assert.deepEqual(parseDraftStore('{"dm-a::root":"kept","bad":1}'), { "dm-a::root": "kept" });
  });
});
