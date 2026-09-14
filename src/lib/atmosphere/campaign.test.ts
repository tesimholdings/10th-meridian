import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { campaign, EDITORIAL_CAPTION, stillForListedExperience } from "@/lib/atmosphere/campaign";

describe("campaign still mapping", () => {
  it("names the eight editorial files Stefan attached", () => {
    assert.equal(campaign.heroLandscape, "/media/campaign/00-yacht-wake.png");
    assert.equal(campaign.homeIndex, "/media/campaign/01-yacht-deck-conversation.png");
    assert.equal(campaign.eventsDinner, "/media/campaign/02-waterfront-dinner.png");
    assert.equal(campaign.homeNetwork, "/media/campaign/03-yacht-salon-business.png");
    assert.equal(campaign.celebrations, "/media/campaign/04-celebration-terrace.png");
    assert.equal(campaign.nightlife, "/media/campaign/05-nightlife-celebration.png");
    assert.equal(campaign.heroMobile, "/media/campaign/06-mobile-water-hero.png");
    assert.equal(campaign.crossings, "/media/campaign/07-coastal-plaza.png");
  });

  it("keeps nightlife off default Open House / salon / trip listings", () => {
    assert.equal(stillForListedExperience({ kind: "open_house", title: "Open House Evening — the tenth" }), "celebrations");
    assert.equal(stillForListedExperience({ kind: "salon", title: "A table for ten — planned salon" }, 1), "eventsDinner");
    assert.equal(stillForListedExperience({ kind: "trip", title: "Winter field walk — concept" }, 2), "crossings");
    assert.equal(stillForListedExperience({ kind: "salon", title: "After-hours concert" }), "nightlife");
  });

  it("never claims editorial stills are members or completed events", () => {
    assert.match(EDITORIAL_CAPTION, /not a photograph of members/i);
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    assert.match(home, /EDITORIAL_CAPTION|campaignSrc\("homeIndex"\)/);
    assert.match(landing, /campaignSrc/);
    assert.match(lock, /campaignSrc\("heroLandscape"\)/);
    assert.equal(home.includes(campaign.nightlife), false);
    assert.equal(lock.includes(campaign.nightlife), false);
  });
});
