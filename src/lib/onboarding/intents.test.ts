import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INTENT_OTHER_ID,
  JOIN_INTENTS,
  intentLabels,
  intentsAreComplete,
  normalizeIntents,
  toggleIntent,
} from "@/lib/onboarding/intents";

describe("join intents", () => {
  it("seeds the house reasons plus Other", () => {
    assert.deepEqual(
      JOIN_INTENTS.map((row) => row.id),
      [
        "travel-crossings",
        "mentor",
        "learn",
        "grow-business",
        "meet-friends",
        "cofounders",
        "capital",
        "host-table",
        "discover-cities",
        "other",
      ],
    );
    assert.equal(JOIN_INTENTS.find((row) => row.id === "capital")?.label, "Raise or deploy capital");
    assert.equal(INTENT_OTHER_ID, "other");
  });

  it("requires at least one intent and a line when Other is chosen", () => {
    assert.equal(intentsAreComplete([]), false);
    assert.equal(intentsAreComplete(["mentor"]), true);
    assert.equal(intentsAreComplete(["other"]), false);
    assert.equal(intentsAreComplete(["other"], "I want a table in cities I already love"), true);
  });

  it("toggles and drops unknown ids", () => {
    assert.deepEqual(toggleIntent([], "mentor"), ["mentor"]);
    assert.deepEqual(toggleIntent(["mentor"], "mentor"), []);
    assert.deepEqual(normalizeIntents(["mentor", "not-real", "mentor"]).intents, ["mentor"]);
    assert.deepEqual(intentLabels(["capital", "other"], "patient capital conversation"), [
      "Raise or deploy capital",
      "Other — patient capital conversation",
    ]);
  });
});
