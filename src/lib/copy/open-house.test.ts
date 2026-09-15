import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  CLOSING_HEADLINE,
  EXPERIENCES_DISCLOSURE,
  EXPLORE_THE_HOUSE,
  FOOTER_PRIVATE,
  HOUSE_BLOCKS,
  JOIN_WAITLIST,
  MEMBERSHIP_CAP,
  MEMBERSHIP_HEADLINE,
  MEMBERSHIP_NO_MONTHLY,
  MEMBERSHIP_SOLICITING,
  OPEN_HOUSE_EVENING,
  OPEN_HOUSE_EYEBROW,
  OPEN_HOUSE_HEADLINE,
  OPEN_HOUSE_LEDE,
  OPEN_HOUSE_MOMENT,
  EXPERIENCE_MOMENT,
  OPEN_HOUSE_PROOF,
  PUBLIC_NAV,
  experienceStateLabel,
  experiences,
} from "@/lib/copy/open-house";

const landing = "src/components/open-house/landing.tsx";
const header = "src/components/open-house/public-header.tsx";
const footer = "src/components/open-house/public-footer.tsx";

describe("Open House customer copy", () => {
  it("keeps the approved membership facts", () => {
    assert.equal(OPEN_HOUSE_HEADLINE, "The people you should know next.");
    assert.equal(OPEN_HOUSE_LEDE, "A private house for the next conversation that matters.");
    assert.equal(OPEN_HOUSE_EYEBROW, "10TH MERIDIAN · PRIVATE NETWORK");
    assert.equal(OPEN_HOUSE_PROOF, "Ten new members a month · One lifetime membership");
    assert.equal(MEMBERSHIP_HEADLINE, "$10,000. Once.");
    assert.match(MEMBERSHIP_NO_MONTHLY, /Monthly billing is not offered/);
    assert.match(MEMBERSHIP_CAP, /No more than ten new members/);
    assert.match(MEMBERSHIP_SOLICITING, /Absolutely no soliciting/);
    assert.match(MEMBERSHIP_SOLICITING, /without refund/);
    assert.equal(CLOSING_HEADLINE, "Make the next crossing count.");
    assert.equal(EXPERIENCES_DISCLOSURE, "Editorial imagery. Event details subject to confirmation.");
    assert.equal(OPEN_HOUSE_MOMENT, "Open House moment");
    assert.equal(EXPERIENCE_MOMENT, "Experience");
    assert.equal(OPEN_HOUSE_EVENING, "Open House evening");
    assert.equal(EXPLORE_THE_HOUSE, "Explore the house");
    assert.equal(JOIN_WAITLIST, "Join waitlist");
  });

  it("seeds three honest experience listings without invented dates", () => {
    assert.equal(experiences.length, 3);
    assert.equal(experiences[0]?.title, "Open House Evening");
    assert.equal(experiences[0]?.place, "Chicago");
    assert.equal(experienceStateLabel(experiences[0]!.state), "Planned");
    assert.equal(experiences[1]?.title, "A table for ten");
    assert.equal(experiences[1]?.place, "Undisclosed");
    assert.equal(experienceStateLabel(experiences[1]!.state), "Planned");
    assert.equal(experiences[2]?.title, "Winter field walk");
    assert.equal(experienceStateLabel(experiences[2]!.state), "Concept");
    const blob = JSON.stringify(experiences);
    assert.equal(/\d{4}-\d{2}-\d{2}/.test(blob), false);
  });

  it("keeps the three House blocks", () => {
    assert.deepEqual(
      HOUSE_BLOCKS.map((b) => b.title),
      ["People first", "When paths cross", "A closed table"],
    );
  });

  it("ships official brand marks and never a black raster on the light lockup", () => {
    for (const path of [
      "public/brand/tenth-meridian-mark.svg",
      "public/brand/tenth-meridian-logo-full-lockup.svg",
      "public/brand/tenth-meridian-logo-light.svg",
      "public/brand/tenth-meridian-logo-full-lockup.png",
      "public/brand/tenth-meridian-logo-full-lockup.webp",
      "public/brand/tenth-meridian-logo-full-lockup-knockout.png",
      "public/brand/tenth-meridian-logo-full-lockup-knockout.webp",
    ]) {
      assert.equal(existsSync(path), true, path);
    }
    const light = readFileSync("public/brand/tenth-meridian-logo-light.svg", "utf8");
    assert.equal(light.includes('fill="#000000"'), false);
    assert.equal(light.includes('fill="#000"'), false);
    assert.match(light, /10th Meridian/);
    const formal = readFileSync("public/brand/tenth-meridian-logo-full-lockup.svg", "utf8");
    assert.match(formal, /TENTH MERIDIAN/);
    const knockout = readFileSync("public/brand/tenth-meridian-logo-full-lockup-knockout.png");
    assert.equal(knockout[25], 6, "knockout lockup must be RGBA, not a black plate");
    const logo = readFileSync("src/components/brand/logo.tsx", "utf8");
    assert.match(logo, /FORMAL_LOCKUP_KNOCKOUT/);
    assert.equal(logo.includes("MeridianMark"), false, "chrome lockup must not use the approximate globe mark");
    assert.equal(logo.includes(">10th Meridian<"), false);
    const lock = readFileSync("src/components/lock/lock-screen.tsx", "utf8");
    assert.match(lock, /FormalLockup/);
    assert.match(lock, /knockout/);
    const memberHeader = readFileSync("src/components/member/member-header.tsx", "utf8");
    assert.match(memberHeader, /Wordmark/);
    const wordmarkImpl = logo.split("export function Wordmark")[1] ?? "";
    assert.match(wordmarkImpl, /FormalLockup/);
    assert.match(wordmarkImpl, /knockout/);
  });
});

describe("Open House customer surfaces", () => {
  it("renders the required anatomy and working CTA routes", () => {
    const page = readFileSync(landing, "utf8");
    const nav = readFileSync(header, "utf8");
    const foot = readFileSync(footer, "utf8");
    for (const needle of [
      "OPEN_HOUSE_EYEBROW",
      "OPEN_HOUSE_HEADLINE",
      "OPEN_HOUSE_LEDE",
      "OPEN_HOUSE_PROOF",
      "EXPLORE_THE_HOUSE",
      "MEMBERSHIP_HEADLINE",
      "CLOSING_HEADLINE",
      "EXPERIENCES_DISCLOSURE",
      "OPEN_HOUSE_MOMENT",
      "EXPERIENCE_MOMENT",
      "OPEN_HOUSE_EVENING",
      'href="/apply"',
      'href="/remind"',
      'href="#the-house"',
    ]) {
      assert.equal(page.includes(needle), true, `landing missing ${needle}`);
    }
    assert.match(nav, /PUBLIC_NAV/);
    assert.deepEqual(
      PUBLIC_NAV.map((i) => i.label),
      ["The House", "Experiences", "Membership", "Sign in"],
    );
    assert.match(nav, /Escape/);
    assert.match(nav, /trigger\?\.focus/);
    assert.match(nav, /href="\/apply"/);
    assert.match(nav, /FormalLockup/);
    assert.match(nav, /knockout/);
    assert.equal(nav.includes("Wordmark"), false);
    assert.match(page, /HeroAtmosphere/);
    assert.match(page, /hero-luxury/);
    assert.match(page, /filmSrc\("heroLandscape"\)/);
    assert.match(page, /oh-wrap/);
    assert.equal(page.includes("max-w-6xl"), false);
    assert.match(nav, /oh-wrap/);
    assert.match(foot, /oh-wrap/);
    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /\.oh-wrap/);
    assert.match(css, /90rem/);
    assert.match(css, /@media \(min-width: 768px\)/);
    assert.match(css, /@media \(min-width: 1280px\)/);
    assert.equal(nav.includes("userAgent"), false);
    assert.equal(page.includes("userAgent"), false);
    assert.match(foot, /FormalLockup/);
    assert.match(foot, /knockout/);
    assert.equal(foot.includes("Wordmark"), false);
    for (const href of ["/legal/privacy", "/legal/terms", "/legal/community", "/sign-in"]) {
      assert.equal(foot.includes(href), true, `footer missing ${href}`);
    }
    assert.match(foot, /FOOTER_PRIVATE/);
    assert.equal(FOOTER_PRIVATE, "Private by design.");
  });

  it("keeps reviewer, remaining-counter, and stack notes off the landing", () => {
    const page = readFileSync(landing, "utf8");
    for (const banned of [
      "DEMO remaining",
      "remaining this cohort",
      "Reviewer tools",
      "VERCEL_ENV",
      "Walk the house",
      "placeholder-implementation",
      "Higgsfield slot",
    ]) {
      assert.equal(page.includes(banned), false, `landing contains ${banned}`);
    }
  });

  it("gates sign-in stack notes and preview tools on production", () => {
    const signIn = readFileSync("src/app/sign-in/page.tsx", "utf8");
    const tools = readFileSync("src/components/preview/preview-tools.tsx", "utf8");
    const env = readFileSync("src/lib/env.ts", "utf8");
    assert.match(signIn, /env\.previewTools/);
    assert.equal(signIn.includes("Supabase Auth"), false);
    assert.match(tools, /env\.previewTools/);
    assert.match(tools, /Force closed/);
    assert.match(tools, /Guest \/ lock/);
    assert.match(env, /VERCEL_ENV === "production"/);
    assert.match(env, /get isProduction/);
  });
});
