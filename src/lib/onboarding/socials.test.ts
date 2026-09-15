import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEMO_SOCIAL_DISCLOSURE,
  EMPTY_OAUTH,
  PRIMARY_SOCIALS,
  SOCIAL_CATALOG,
  SOCIAL_PROVIDERS,
  connectModeFor,
  connectionFromLegacy,
  disconnectSocial,
  legacyFromSocials,
  normalizeSocialInput,
  upsertSocial,
} from "@/lib/onboarding/socials";

describe("social connects", () => {
  it("lists primary four plus optional rooms", () => {
    assert.deepEqual([...SOCIAL_PROVIDERS], [
      "linkedin",
      "instagram",
      "facebook",
      "x",
      "website",
      "whatsapp",
      "telegram",
      "youtube",
    ]);
    assert.deepEqual(
      PRIMARY_SOCIALS.map((row) => row.id),
      ["linkedin", "instagram", "facebook", "x"],
    );
    assert.equal(SOCIAL_CATALOG.length, 8);
  });

  it("normalizes handles and URLs without inventing OAuth", () => {
    const linkedin = normalizeSocialInput("linkedin", "linkedin.com/in/yourname");
    assert.equal(linkedin.ok, true);
    if (linkedin.ok) assert.match(linkedin.url ?? "", /linkedin\.com\/in\/yourname/i);

    const instagram = normalizeSocialInput("instagram", "yourname");
    assert.equal(instagram.ok, true);
    if (instagram.ok) {
      assert.equal(instagram.handle, "@yourname");
      assert.equal(instagram.url, "https://instagram.com/yourname");
    }

    const x = normalizeSocialInput("x", "@yourname");
    assert.equal(x.ok, true);
    if (x.ok) assert.equal(x.url, "https://x.com/yourname");

    const empty = normalizeSocialInput("website", "   ");
    assert.equal(empty.ok, false);
  });

  it("stays DEMO unless an OAuth flag is true", () => {
    assert.equal(connectModeFor("linkedin", EMPTY_OAUTH), "demo");
    assert.equal(connectModeFor("website", EMPTY_OAUTH), "demo");
    assert.equal(
      connectModeFor("linkedin", { ...EMPTY_OAUTH, linkedin: true }),
      "oauth",
    );
    assert.match(DEMO_SOCIAL_DISCLOSURE, /not live OAuth/);
  });

  it("round-trips legacy website / LinkedIn into the social store", () => {
    const rows = connectionFromLegacy({
      website: "https://example.test/studio",
      linkedin: "https://www.linkedin.com/in/demo-voss",
    });
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.provider, "linkedin");
    assert.equal(rows[0]?.connected, true);
    assert.equal(rows[0]?.mode, "demo");
    const legacy = legacyFromSocials(rows);
    assert.ok(legacy.linkedin);
    assert.ok(legacy.website);
    const dropped = disconnectSocial(upsertSocial(rows, { ...rows[0]!, connected: true }), "linkedin");
    assert.equal(dropped.some((row) => row.provider === "linkedin"), false);
  });
});
