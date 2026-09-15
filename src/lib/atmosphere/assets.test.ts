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
  "cursor-aura-trail",
  "cursor-aura-filament",
  "lock-gold-follow",
  "circle-person",
  "hero-grain",
  "hero-flecks",
  "hero-wash",
  "hero-lamp",
  "hero-shade",
  "hero-caustic",
  "hero-sheet",
  "hero-media-shift",
  "crossings-flight",
  "crossings-flight-arc",
  "crossings-flight-dest",
  "crossings-flight-city",
  "crossings-flight-craft",
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

  it("keeps a champagne-point luxury cursor and never hides the system pointer without it", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const cursor = readFileSync("src/components/atmosphere/cursor-aura.tsx", "utf8");
    assert.match(css, /\.cursor-aura\s*\{/);
    assert.match(css, /\.cursor-aura-trail/);
    assert.match(css, /\.cursor-aura-filament/);
    assert.match(css, /#c4a264|#f0d78a|#fff8e4/);
    assert.match(css, /linear-gradient\(\s*90deg/);
    const aura = css.split(".cursor-aura {")[1]?.split("html.has-luxury-cursor")[0] ?? "";
    assert.equal(aura.includes("border: 2"), false);
    assert.equal(aura.includes("0 0 0 2px"), false);
    assert.equal(aura.includes("width: 14px"), false);
    assert.equal(css.includes("cursor-aura-core"), false);
    assert.equal(cursor.includes("cursor-aura-core"), false);
    assert.match(cursor, /cursor-aura-filament/);
    assert.match(css, /html\.has-luxury-cursor/);
    assert.match(css, /html\.has-luxury-cursor[\s\S]*cursor:\s*none/);
    const beforeClass = css.split("html.has-luxury-cursor")[0] ?? "";
    assert.equal(/body\s*\{[^}]*cursor:\s*none/.test(beforeClass), false);
    assert.match(cursor, /has-luxury-cursor/);
    assert.match(cursor, /prefers-reduced-motion/);
    assert.match(cursor, /pointerType/);
    assert.match(cursor, /"mouse"/);
    assert.match(cursor, /hover: hover/);
    const reduced = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    assert.match(reduced, /cursor:\s*auto/);
    assert.match(reduced, /cursor-aura-trail/);
  });

  it("uses a 1440px Open House rail and a full-bleed lock instead of a phone column", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /\.oh-wrap/);
    assert.match(css, /90rem/);
    assert.match(css, /@media \(min-width: 768px\)/);
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    const grain = readFileSync("src/components/lock/lock-grain.tsx", "utf8");
    const unlock = readFileSync("src/components/lock/lock-unlock.tsx", "utf8");
    assert.match(lock, /max-w-\[90rem\]/);
    assert.match(lock, /LockGrain/);
    assert.match(lock, /knockout/);
    assert.match(lock, /LockUnlock/);
    assert.equal(lock.includes("max-w-3xl"), false);
    assert.equal(lock.includes("Sign in"), false);
    assert.equal(lock.includes("previewDemoAuth"), false);
    assert.equal(grain.includes("lock-gold-glow"), false);
    assert.equal(css.includes("lock-gold-glow"), false);
    assert.match(css, /\.lock-gold\s*\{[^}]*background:\s*#000/);
    assert.match(unlock, /Username or email/);
    assert.match(unlock, /Forgot password/);
    assert.match(unlock, /Have a referral code\?/);
    assert.match(unlock, /\/api\/lock\/unlock/);
    assert.match(unlock, /\/api\/auth\/forgot-password/);
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    assert.match(landing, /oh-wrap/);
    assert.equal(landing.includes("userAgent"), false);
  });

  it("keeps the Open House hero visibly alive on desktop", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const hero = readFileSync("src/components/open-house/hero-media.tsx", "utf8");
    const atmosphere = readFileSync("src/components/open-house/hero-atmosphere.tsx", "utf8");
    assert.match(css, /\.hero-wash/);
    assert.match(css, /\.hero-lamp/);
    assert.match(css, /\.hero-caustic/);
    assert.match(css, /\.hero-shade/);
    assert.match(css, /\.hero-sheet/);
    assert.match(css, /var\(--hero-mx\)/);
    assert.match(css, /var\(--hero-px\) \* 92px/);
    assert.match(css, /var\(--hero-px\) \* -148px/);
    assert.match(css, /var\(--hero-px\) \* 176px/);
    assert.match(hero, /preload="auto"/);
    assert.match(hero, /canplay/);
    assert.match(hero, /type="video\/mp4"/);
    const resolve = readFileSync("src/lib/atmosphere/resolve-campaign.ts", "utf8");
    assert.match(resolve, /Always the public CDN path/);
    assert.equal(resolve.includes("mediaOnDisk(src) ? src : undefined"), false);
    assert.match(atmosphere, /hero-wash/);
    assert.match(atmosphere, /hero-lamp/);
    assert.match(atmosphere, /pointermove/);
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

  it("uses liquid black / white / gold surfaces instead of printer-white panels", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const house = css.split(".house-light {")[1]?.split(".house-light .panel")[0] ?? "";
    assert.match(house, /linear-gradient/);
    assert.match(house, /#c4a264|#C4A264|rgba\(196, 162, 100/);
    assert.equal(/background:\s*#fff;/.test(house), false);
    assert.equal(/^\s*background:\s*var\(--paper\);/m.test(house), false);
    assert.match(css, /\.surface/);
    assert.match(css, /\.liquid-dark/);
    assert.match(css, /backdrop-filter/);
    assert.match(css, /\.member-frame/);
    assert.match(css, /90rem/);
    const reduced = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    assert.match(reduced, /backdrop-filter:\s*none/);
    const shell = readFileSync("src/components/member/member-shell.tsx", "utf8");
    assert.match(shell, /member-frame/);
    assert.equal(shell.includes("max-w-3xl"), false);
    const rail = readFileSync("src/components/member/desktop-rail.tsx", "utf8");
    assert.match(rail, /liquid-dark/);
    assert.match(rail, /FormalLockup/);
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    assert.equal(home.includes("bg-white"), false);
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    assert.match(landing, /liquid-dark/);
    assert.match(landing, /liquid-paper/);
    assert.equal(landing.includes("bg-[var(--paper)]"), false);
    assert.match(landing, /rgba\(9,43,69,0\.78\)/);
    const hero = readFileSync("src/components/open-house/hero-media.tsx", "utf8");
    assert.match(hero, /playSafe/);
    assert.equal(hero.includes("autoPlay"), false);
    const film = readFileSync("src/components/open-house/editorial-film.tsx", "utf8");
    assert.match(film, /playSafe/);
    assert.equal(film.includes("autoPlay"), false);
    const apply = readFileSync("src/components/forms/apply-wizard.tsx", "utf8");
    assert.match(apply, /validatePresence/);
    assert.match(apply, /validateApplication/);
    const rules = readFileSync("src/lib/apply/validation.ts", "utf8");
    assert.match(rules, /Name is required/);
    assert.match(rules, /Agree to the house standards/);
    const header = readFileSync("src/components/member/member-header.tsx", "utf8");
    assert.match(header, /Escape/);
    assert.match(header, /Search people and cities/);
    assert.match(header, /house-search-sheet/);
    const play = readFileSync("src/lib/atmosphere/play-safe.ts", "utf8");
    assert.match(play, /AbortError/);
  });

  it("wires editorial campaign slots on Open House, Home, events, and Crossings", () => {
    const landing = readFileSync("src/components/open-house/landing.tsx", "utf8");
    assert.match(landing, /campaignSrc|HiggsfieldSlot/);
    assert.match(landing, /stillForListedExperience/);
    assert.match(landing, /OPEN_HOUSE_MOMENT/);
    assert.match(landing, /EXPERIENCE_MOMENT/);
    assert.match(landing, /OPEN_HOUSE_EVENING/);
    const events = readFileSync("src/app/member/events/page.tsx", "utf8");
    assert.match(events, /HiggsfieldSlot/);
    assert.match(events, /stillForListedExperience/);
    const home = readFileSync("src/app/member/home/page.tsx", "utf8");
    assert.equal(home.includes("stillForListedExperience"), false);
    assert.equal(home.includes("journeyStillSrc"), false);
    assert.equal(home.includes("HiggsfieldSlot"), false);
    assert.match(home, /Open this trip/);
    assert.equal(home.includes('campaignSrc("homeIndex")'), false);
    assert.equal(home.includes('campaignSrc("homeNetwork")'), false);
    const crossings = readFileSync("src/app/member/crossings/page.tsx", "utf8");
    assert.match(crossings, /journeyStillSrc/);
    const circle = readFileSync("src/app/member/circle/page.tsx", "utf8");
    assert.equal(circle.includes('scene="yacht"'), false);
    assert.equal(circle.includes("campaignSrc"), false);
    assert.equal(circle.includes("HiggsfieldSlot"), false);
    const rail = readFileSync("src/components/member/desktop-rail.tsx", "utf8");
    const tabs = readFileSync("src/components/member/bottom-nav.tsx", "utf8");
    const flight = readFileSync("src/components/crossings/crossings-flight.tsx", "utf8");
    assert.match(rail, /CrossingsEntryLink/);
    assert.match(tabs, /CrossingsEntryLink/);
    assert.match(flight, /prefers-reduced-motion/);
    assert.match(flight, /2800/);
    const indexRedirect = readFileSync("src/app/member/index/page.tsx", "utf8");
    assert.match(indexRedirect, /\/member\/circle/);
  });
});
