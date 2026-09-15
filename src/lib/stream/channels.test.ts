import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  directMessageChannelId,
  houseChannelId,
  streamChannelCid,
} from "@/lib/stream/channels";
import { issueStreamToken } from "@/lib/stream/token";

describe("Stream channel and token helpers", () => {
  it("builds stable DM ids regardless of argument order", () => {
    assert.equal(directMessageChannelId("b", "a"), directMessageChannelId("a", "b"));
    assert.equal(houseChannelId("introductions"), "channel-introductions");
    assert.equal(streamChannelCid("messaging", "dm-a-b"), "messaging:dm-a-b");
  });

  it("issues a stub token without STREAM_API_SECRET", () => {
    const token = issueStreamToken("preview-member");
    assert.equal(token.ok, true);
    if (!process.env.STREAM_API_SECRET?.trim()) {
      assert.equal(token.stub, true);
      assert.equal(token.token, null);
    }
  });
});
