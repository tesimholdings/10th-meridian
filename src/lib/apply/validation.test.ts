import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applySummary,
  isOptionalApplyStep,
  validateApplication,
  validatePresence,
} from "@/lib/apply/validation";

describe("application validation", () => {
  it("blocks empty identity at the presence step", () => {
    assert.equal(validatePresence({}), "Name is required.");
    assert.equal(
      validatePresence({ fullName: "Ada", email: "ada@example.com" }),
      "City and country are required.",
    );
    assert.equal(
      validatePresence({
        fullName: "Ada",
        email: "ada@example.com",
        city: "Chicago",
        country: "United States",
      }),
      null,
    );
  });

  it("re-validates identity and terms at submit", () => {
    const identity = {
      fullName: "Ada",
      email: "ada@example.com",
      city: "Chicago",
      country: "United States",
    };
    assert.equal(validateApplication(identity), "Agree to the house standards to submit.");
    assert.equal(validateApplication({ ...identity, terms: "yes" }), null);
    assert.equal(validateApplication({ terms: "yes" }), "Name is required.");
  });

  it("treats work, signal, and exchange as optional chapters", () => {
    assert.equal(isOptionalApplyStep(0), false);
    assert.equal(isOptionalApplyStep(1), true);
    assert.equal(isOptionalApplyStep(2), true);
    assert.equal(isOptionalApplyStep(3), true);
    assert.equal(isOptionalApplyStep(4), false);
    const summary = applySummary({ fullName: "Ada", city: "" });
    assert.equal(summary[0]?.value, "Ada");
    assert.equal(summary[2]?.value, "Not given");
  });
});
