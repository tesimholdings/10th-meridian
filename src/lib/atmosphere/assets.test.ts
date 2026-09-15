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

const officialLockup = [
  "public/brand/tenth-meridian-logo-full-lockup.png",
  "public/brand/tenth-meridian-logo-full-lockup.webp",
  "public/brand/tenth-meridian-logo-full-lockup-transparent.png",
  "public/brand/tenth-meridian-logo-full-lockup-transparent.webp",
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
];

const stockHosts = ["unsplash.com", "pexels.com", "pixabay.com", "shutterstock.com"];

describe("original House atmosphere", () => {
  it("ships the official lockup on black plus a transparent treatment", () => {
    for (const path of officialLockup) {
      assert.equal(existsSync(path), true, path);
    }
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    assert.match(lock, /OfficialLockup/);
    assert.equal(lock.includes("TENTH MERIDIAN"), false);
    const wordmark = readFileSync("src/components/brand/logo.tsx", "utf8");
    assert.match(wordmark, /10th Meridian/);
    assert.equal(wordmark.includes("TENTH MERIDIAN"), false);
  });

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
    assert.equal(css.includes("mix-blend-mode: screen"), false);
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

  it("uses a full-width desktop member frame instead of a phone column", () => {
    const shell = readFileSync("src/components/member/member-shell.tsx", "utf8");
    assert.equal(shell.includes("max-w-3xl"), false);
    assert.equal(shell.includes("max-w-6xl"), false);
    assert.match(shell, /member-frame/);
    assert.match(shell, /member-main/);
    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /\.member-frame/);
    assert.match(css, /@media \(min-width: 768px\)/);
    assert.match(css, /\.member-desk-grid/);
    assert.match(css, /\.member-messages/);
    const rail = readFileSync("src/components/member/desktop-rail.tsx", "utf8");
    assert.match(rail, /md:flex/);
    const nav = readFileSync("src/components/member/bottom-nav.tsx", "utf8");
    assert.match(nav, /md:hidden/);
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    assert.match(lock, /max-w-\[90rem\]/);
    assert.match(lock, /OfficialLockup/);
  });

  it("gives member house-light paper depth instead of flat white", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const house = css.split(".house-light {")[1] ?? "";
    assert.match(house, /#faf8f2/);
    assert.match(house, /radial-gradient/);
    assert.match(css, /rgba\(8, 124, 184/);
    assert.match(css, /rgba\(48, 200, 210/);
    assert.match(css, /\.surface\s*\{/);
    assert.match(css, /\.section-band\s*\{/);
    assert.match(css, /#fffdf8/);
    assert.match(css, /\.house-light \.panel[\s\S]*box-shadow/);
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    assert.match(home, /section-band/);
    assert.match(home, /surface/);
    const circle = readFileSync("src/app/member/circle/page.tsx", "utf8");
    assert.match(circle, /section-band/);
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
