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
  "cursor-aura-core",
  "lock-gold-follow",
  "circle-person",
  "hero-grain",
  "hero-flecks",
  "hero-wash",
  "hero-media-shift",
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

  it("keeps a dual-layer luxury cursor visible and never hides the system pointer without it", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const cursor = readFileSync("src/components/atmosphere/cursor-aura.tsx", "utf8");
    assert.match(css, /\.cursor-aura\s*\{/);
    assert.match(css, /#c4a264/);
    assert.match(css, /#092b45/);
    assert.match(css, /\.cursor-aura-core/);
    const aura = css.split(".cursor-aura {")[1]?.split("}")[0] ?? "";
    assert.equal(aura.includes("mix-blend-mode"), false);
    assert.match(css, /html\.has-luxury-cursor/);
    const hideBlock = css.split("@media (hover: hover) and (pointer: fine)")[1] ?? "";
    assert.match(hideBlock, /cursor:\s*none/);
    assert.match(hideBlock, /has-luxury-cursor/);
    const unscopedHide = hideBlock.split("html.has-luxury-cursor")[0] ?? "";
    assert.equal(/body\s*\{[^}]*cursor:\s*none/.test(unscopedHide), false);
    assert.match(cursor, /has-luxury-cursor/);
    assert.match(cursor, /prefers-reduced-motion/);
    const reduced = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    assert.match(reduced, /cursor:\s*auto/);
  });

  it("uses a 1440px Open House rail and a full-bleed lock instead of a phone column", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /\.oh-wrap/);
    assert.match(css, /90rem/);
    assert.match(css, /@media \(min-width: 768px\)/);
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    assert.match(lock, /max-w-\[90rem\]/);
    assert.match(lock, /LockGrain/);
    assert.equal(lock.includes("max-w-3xl"), false);
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    assert.match(landing, /oh-wrap/);
    assert.equal(landing.includes("userAgent"), false);
  });

  it("keeps the Open House hero visibly alive on desktop", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const hero = readFileSync("src/components/open-house/hero-media.tsx", "utf8");
    const atmosphere = readFileSync("src/components/open-house/hero-atmosphere.tsx", "utf8");
    assert.match(css, /\.hero-wash/);
    assert.match(css, /var\(--hero-px\) \* 32px/);
    assert.match(css, /var\(--hero-px\) \* -56px/);
    assert.match(css, /var\(--hero-px\) \* 64px/);
    assert.match(hero, /preload="auto"/);
    assert.match(hero, /canplay/);
    assert.match(atmosphere, /hero-wash/);
    const reduced = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    assert.match(reduced, /hero-grain/);
    assert.match(reduced, /opacity: 0\.28/);
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
