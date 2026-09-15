import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FIELD_GUIDES, fieldGuide } from "@/lib/onboarding/fields";
import { APPLY_WELCOME, EXPERIENCE_CHAPTERS, EXPERIENCE_PROMISE, MEMBER_WELCOME } from "@/lib/onboarding/copy";
import { LIFETIME_PRICE_LABEL, SOLICITING_BAN } from "@/lib/copy/community";
import { identityReady, emptyDraft } from "@/lib/onboarding/draft";

describe("experiential field guides and chapters", () => {
  it("shows a concrete example on every core field", () => {
    assert.match(fieldGuide("city").placeholder, /Austin|Paris/);
    assert.match(fieldGuide("roleTitle").placeholder, /Founder/);
    assert.match(fieldGuide("bio").placeholder, /durable systems|substance/i);
    assert.match(fieldGuide("offers").helper, /office hours|introductions/i);
    assert.match(fieldGuide("needs").placeholder, /Lisbon|peer/i);
    assert.ok(Object.keys(FIELD_GUIDES).length >= 16);
  });

  it("keeps the six-chapter promise and membership facts", () => {
    assert.deepEqual(
      EXPERIENCE_CHAPTERS.map((chapter) => chapter.id),
      ["welcome", "intents", "identity", "socials", "exchange", "review"],
    );
    assert.equal(EXPERIENCE_PROMISE, "The people you should know next.");
    assert.match(APPLY_WELCOME.facts, new RegExp(LIFETIME_PRICE_LABEL.replace("$", "\\$")));
    assert.match(APPLY_WELCOME.facts, /ten new members/i);
    assert.match(APPLY_WELCOME.facts, /Monthly billing is not offered/);
    assert.match(MEMBER_WELCOME.lede, /DEMO/);
  });

  it("requires name, city, country, and role before leaving identity", () => {
    const draft = emptyDraft({ fullName: "Alex Rivera", email: "alex@studio.com", city: "Austin" });
    assert.equal(identityReady(draft, "apply"), false);
    assert.equal(
      identityReady({ ...draft, country: "United States", roleTitle: "Founder, Operator" }, "apply"),
      true,
    );
    assert.match(SOLICITING_BAN, /Absolutely no soliciting/);
  });
});
