import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sendApplyReceived, sendInvite, sendOpenHouseReminder } from "@/lib/resend/send";
import { emailTemplates } from "@/lib/resend/templates";

describe("Resend transactional helpers", () => {
  it("stubs apply, reminder, and invite when RESEND_API_KEY is absent", async () => {
    const apply = await sendApplyReceived("delivered@resend.dev", "app-demo-1");
    const remind = await sendOpenHouseReminder(
      "delivered@resend.dev",
      "the next tenth",
      "remind-demo-1",
    );
    const invite = await sendInvite("delivered@resend.dev", "invite-demo-1");
    if (!process.env.RESEND_API_KEY?.trim()) {
      assert.equal(apply.stub, true);
      assert.equal(remind.stub, true);
      assert.equal(invite.stub, true);
      assert.equal(apply.ok, true);
    }
  });

  it("keeps invite and apply copy honest about $10,000 lifetime", () => {
    const invite = emailTemplates.invite();
    const apply = emailTemplates.applicationReceived();
    assert.match(invite.html, /\$10,000/);
    assert.match(invite.html, /not a solicitation/i);
    assert.match(apply.html, /No more than ten/);
  });
});
