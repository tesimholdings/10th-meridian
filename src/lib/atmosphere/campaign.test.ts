import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { campaign, EDITORIAL_CAPTION, stillForListedExperience } from "@/lib/atmosphere/campaign";
import { campaignPackOnDisk, campaignSrc } from "@/lib/atmosphere/resolve-campaign";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

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
    assert.match(landing, /campaignSrc\("heroLandscape"\)/);
    assert.equal(home.includes(campaign.nightlife), false);
    assert.equal(lock.includes(campaign.heroLandscape), false);
    assert.equal(lock.includes(campaign.heroMobile), false);
    assert.equal(lock.includes("campaignSrc"), false);
    assert.equal(lock.includes("HeroStage"), false);
    assert.match(lock, /LockField/);
  });

  it("keeps campaign 00/06 off the guest lock", () => {
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    const field = readFileSync("src/components/lock/lock-field.tsx", "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    for (const src of [lock, field]) {
      assert.equal(src.includes("00-yacht-wake"), false);
      assert.equal(src.includes("06-mobile-water-hero"), false);
      assert.equal(src.includes("/media/"), false);
      assert.equal(src.includes("<img"), false);
    }
    assert.match(css, /\.lock-field/);
    assert.match(css, /\.lock-grain/);
    assert.match(css, /#000|#000000/);
    assert.match(css, /#c4a264|#C4A264|196, 162, 100/);
  });

  it("ships the eight editorial PNGs on disk", () => {
    assert.equal(campaignPackOnDisk(), true);
    for (const [slot, src] of Object.entries(campaign)) {
      const path = `public${src}`;
      assert.equal(existsSync(path), true, path);
      const buf = readFileSync(path);
      assert.equal(buf.subarray(0, 4).equals(PNG), true, `${path} must be a PNG`);
      assert.equal(campaignSrc(slot as keyof typeof campaign), src);
    }
  });
});
