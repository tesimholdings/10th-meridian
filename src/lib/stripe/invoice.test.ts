import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEntryInvoice, invoiceStubMessage } from "@/lib/stripe/invoice";

describe("Stripe entry invoice helper", () => {
  it("stubs without keys and never invents a hosted invoice URL", async () => {
    const result = await createEntryInvoice({
      email: "admitted@preview.10thmeridian.test",
      accountId: "preview-approved_unpaid",
    });
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.stub, true);
        assert.match(invoiceStubMessage(result.reason), /stubbed|email|charged/i);
      }
    }
  });
});
