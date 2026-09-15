import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pathForRole } from "@/lib/lock/session";

describe("lock session helpers", () => {
  it("sends stewards to admin and members home", () => {
    assert.equal(pathForRole("administrator"), "/admin");
    assert.equal(pathForRole("moderator"), "/admin");
    assert.equal(pathForRole("member"), "/member/home");
    assert.equal(pathForRole("approved_unpaid"), "/member/billing");
  });
});
