import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const originals = [
  "public/media/scene-water.svg",
  "public/media/scene-yacht.svg",
  "public/media/scene-concert.svg",
  "public/media/hero-poster.svg",
  "public/media/demo/gallery-1.svg",
  "public/media/demo/gallery-2.svg",
  "public/media/demo/gallery-3.svg",
  "public/media/demo/gallery-4.svg",
];

const motionClasses = [
  "wave-shimmer",
  "concert-pulse",
  "chrome-float",
  "scene-band-art",
  "scene-band-shine",
  "light-sweep",
  "stagger-in",
  "pressable",
  "tab-slide",
  "sheet-motion",
  "reward-unlock",
  "reward-ring",
  "reward-sheet",
  "cursor-aura",
  "circle-person",
];

const stockHosts = ["unsplash.com", "pexels.com", "pixabay.com", "shutterstock.com"];

describe("original House atmosphere", () => {
  it("ships original water / yacht / concert stills", () => {
    for (const path of originals) {
      assert.equal(existsSync(path), true, path);
      const svg = readFileSync(path, "utf8");
      assert.match(svg, /<svg/);
      for (const host of stockHosts) {
        assert.equal(svg.includes(host), false, `${path} must not reference ${host}`);
      }
    }
  });

  it("honors prefers-reduced-motion for new motion classes", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    const reduced = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    for (const cls of motionClasses) {
      assert.match(reduced, new RegExp(cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("wires editorial campaign slots on Open House, Home, events, and Crossings", () => {
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    assert.match(landing, /campaignSrc|HiggsfieldSlot/);
    assert.match(landing, /stillForListedExperience/);
    const events = readFileSync("src/app/member/events/page.tsx", "utf8");
    assert.match(events, /HiggsfieldSlot/);
    assert.match(events, /stillForListedExperience/);
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    assert.match(home, /campaignSrc\("homeIndex"\)/);
    assert.match(home, /campaignSrc\("homeNetwork"\)/);
    const crossings = readFileSync("src/app/member/crossings/page.tsx", "utf8");
    assert.match(crossings, /campaignSrc\("crossings"\)/);
    const circle = readFileSync("src/app/member/circle/page.tsx", "utf8");
    assert.equal(circle.includes('scene="yacht"'), false);
    assert.match(circle, /campaignSrc\("homeIndex"\)/);
    const indexRedirect = readFileSync("src/app/member/index/page.tsx", "utf8");
    assert.match(indexRedirect, /\/member\/circle/);
  });
});
