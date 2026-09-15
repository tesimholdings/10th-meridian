import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  campaign,
  campaignFilms,
  EDITORIAL_CAPTION,
  globalCampaign,
  stillForListedExperience,
} from "@/lib/atmosphere/campaign";
import {
  campaignFilmsOnDisk,
  campaignPackOnDisk,
  campaignSrc,
  filmSrc,
  globalPackOnDisk,
} from "@/lib/atmosphere/resolve-campaign";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const JPG = Buffer.from([0xff, 0xd8, 0xff]);
const MP4_FTYP = "ftyp";

describe("campaign still mapping", () => {
  it("names the aspirational editorial stills", () => {
    assert.equal(campaign.heroLandscape, "/media/campaign/00-yacht-wake.png");
    assert.equal(campaign.homeIndex, "/media/campaign/01-yacht-deck.png");
    assert.equal(campaign.eventsDinner, "/media/campaign/02-waterfront-dinner.png");
    assert.equal(campaign.homeNetwork, "/media/campaign/03-salon.png");
    assert.equal(campaign.celebrations, "/media/campaign/04-celebration.png");
    assert.equal(campaign.nightlife, "/media/campaign/06-nightlife-club.png");
    assert.equal(campaign.heroMobile, "/media/campaign/00-yacht-wake.png");
    assert.equal(campaign.crossings, "/media/campaign/05-coastal-plaza.png");
  });

  it("keeps nightlife off default Open House / salon / trip listings", () => {
    assert.equal(stillForListedExperience({ kind: "open_house", title: "Open House Evening — the tenth" }), "celebrations");
    assert.equal(stillForListedExperience({ kind: "salon", title: "A table for ten — planned salon" }, 1), "homeNetwork");
    assert.equal(stillForListedExperience({ kind: "trip", title: "Winter field walk — concept" }, 2), "crossings");
    assert.equal(stillForListedExperience({ kind: "salon", title: "After-hours concert" }), "nightlife");
  });

  it("never claims editorial stills are members or completed events", () => {
    assert.match(EDITORIAL_CAPTION, /not a photograph of members/i);
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    const hero = readFileSync("src/components/open-house/hero-media.tsx", "utf8");
    assert.match(home, /EDITORIAL_CAPTION|campaignSrc\("homeIndex"\)/);
    assert.match(landing, /campaignSrc/);
    assert.match(landing, /filmSrc\("heroLandscape"\)/);
    assert.match(landing, /HeroMedia/);
    assert.equal(lock.includes("campaignSrc"), false);
    assert.equal(lock.includes("/media/campaign"), false);
    assert.equal(lock.includes("yacht"), false);
    assert.equal(lock.includes(".mp4"), false);
    assert.equal(lock.includes("HeroMedia"), false);
    assert.equal(lock.includes("filmSrc"), false);
    assert.match(lock, /lock-gold/);
    assert.equal(home.includes(campaign.nightlife), false);
    assert.equal(lock.includes(campaign.nightlife), false);
    assert.match(hero, /muted/);
    assert.match(hero, /loop/);
    assert.match(hero, /playsInline/);
    assert.match(hero, /prefers-reduced-motion/);
    assert.match(hero, /IntersectionObserver/);
    assert.match(hero, /Pause/);
  });

  it("ships the editorial stills on disk", () => {
    assert.equal(campaignPackOnDisk(), true);
    for (const [slot, src] of Object.entries(campaign)) {
      const path = `public${src}`;
      assert.equal(existsSync(path), true, path);
      const buf = readFileSync(path);
      const png = buf.subarray(0, 4).equals(PNG);
      const jpg = buf.subarray(0, 3).equals(JPG);
      assert.equal(png || jpg, true, `${path} must be a PNG or JPEG`);
      assert.equal(campaignSrc(slot as keyof typeof campaign), src);
    }
  });

  it("ships muted campaign films and the global luxury pack", () => {
    assert.equal(campaignFilmsOnDisk(), true);
    assert.equal(globalPackOnDisk(), true);
    assert.equal(filmSrc("heroLandscape"), campaignFilms.heroLandscape);
    assert.equal(filmSrc("eventsDinner"), campaignFilms.eventsDinner);
    for (const src of Object.values(campaignFilms)) {
      const path = `public${src}`;
      assert.equal(existsSync(path), true, path);
      const buf = readFileSync(path);
      assert.equal(buf.subarray(4, 8).toString("ascii"), MP4_FTYP, `${path} must be an MP4`);
    }
    for (const src of Object.values(globalCampaign)) {
      const path = `public${src}`;
      assert.equal(existsSync(path), true, path);
      const buf = readFileSync(path);
      assert.equal(buf.subarray(0, 3).equals(JPG), true, `${path} must be a JPEG`);
    }
  });
});
