import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SessionUser } from "@/lib/access/session";
import { greetingName, isSyntheticSession, sessionSubjectId } from "@/lib/member/identity";

function user(partial: Partial<SessionUser> & Pick<SessionUser, "id" | "name" | "isDemo">): SessionUser {
  return {
    email: "member@tenmeridian.com",
    role: "member",
    ...partial,
  };
}

describe("member identity", () => {
  it("does not treat a real session as the synthetic A. Voss preview", () => {
    const member = user({
      id: "8d1c0b2a-4e5f-4a1b-9c3d-111111111111",
      name: "Avery Chen",
      isDemo: false,
    });
    assert.equal(isSyntheticSession(member), false);
    assert.equal(greetingName(member, "A. Voss"), "Avery");
    assert.equal(sessionSubjectId(member, "demo-01"), member.id);
  });

  it("keeps the sample preview on A. Voss", () => {
    const preview = user({
      id: "preview-member",
      name: "A. Voss",
      email: "member@preview.10thmeridian.test",
      isDemo: true,
    });
    assert.equal(isSyntheticSession(preview), true);
    assert.equal(greetingName(preview, "A. Voss"), "A.");
    assert.equal(sessionSubjectId(preview, "demo-01"), "demo-01");
  });
});
