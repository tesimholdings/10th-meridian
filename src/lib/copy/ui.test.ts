import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { memberNav } from "@/lib/config/site";
import { COMMUNITY_STANDARD, SOLICITING_BAN } from "@/lib/copy/community";
import {
  FORBIDDEN_UI_LABEL,
  MEMBER_NAV_LABELS,
  MERIDIAN_10,
  MERIDIAN_100,
  MERIDIAN_INDEX,
  NAV_CIRCLE,
  REFERRAL_REWARDS,
  YOUR_CIRCLE,
} from "@/lib/copy/ui";

const uiFiles = [
  "src/lib/config/site.ts",
  "src/components/member/bottom-nav.tsx",
  "src/components/open-house/landing.tsx",
  "src/app/member/home/page.tsx",
  "src/app/member/circle/page.tsx",
  "src/app/member/index/page.tsx",
  "src/app/member/settings/page.tsx",
  "src/app/member/crossings/page.tsx",
  "src/components/forms/apply-wizard.tsx",
  "src/app/legal/community/page.tsx",
  "src/app/member/rewards/page.tsx",
];

describe("product naming and community copy", () => {
  it("uses Home · My Circle · Messages · Crossings · Profile and never Matches", () => {
    assert.deepEqual([...memberNav.map((i) => i.label)], [...MEMBER_NAV_LABELS]);
    assert.ok(!MEMBER_NAV_LABELS.includes(FORBIDDEN_UI_LABEL as (typeof MEMBER_NAV_LABELS)[number]));
    for (const href of memberNav.map((i) => i.label)) {
      assert.notEqual(href, "Matches");
    }
    assert.equal(NAV_CIRCLE, "My Circle");
    assert.equal(MERIDIAN_INDEX, "My Circle");
    assert.equal(memberNav[1]?.href, "/member/circle");
    assert.equal(MERIDIAN_10, "The Meridian 10");
    assert.equal(MERIDIAN_100, "The Meridian 100");
    assert.equal(YOUR_CIRCLE, "Your Circle");
    assert.equal(REFERRAL_REWARDS, "Referral Rewards");
  });

  it("keeps Matches out of member-facing UI strings", () => {
    for (const file of uiFiles) {
      const text = readFileSync(file, "utf8");
      assert.equal(text.includes(`"${FORBIDDEN_UI_LABEL}"`), false, `${file} contains "Matches"`);
      assert.equal(text.includes(`>${FORBIDDEN_UI_LABEL}<`), false, `${file} renders Matches`);
      assert.equal(text.includes("label: \"Matches\""), false);
    }
  });

  it("states the no-soliciting rule", () => {
    assert.match(SOLICITING_BAN, /Absolutely no soliciting/);
    assert.match(SOLICITING_BAN, /Ban with no refund/);
    assert.match(COMMUNITY_STANDARD, /Referrals are welcome/);
    assert.match(COMMUNITY_STANDARD, /Mention yourself only if asked/);
    const community = readFileSync("src/app/legal/community/page.tsx", "utf8");
    const apply = readFileSync("src/components/forms/apply-wizard.tsx", "utf8");
    const onboarding = readFileSync("src/components/profile/onboarding-wizard.tsx", "utf8");
    const rewards = readFileSync("src/lib/rewards/copy.ts", "utf8");
    assert.ok(community.includes(SOLICITING_BAN) || community.includes("Absolutely no soliciting"));
    assert.ok(apply.includes("Absolutely no soliciting"));
    assert.ok(onboarding.includes("Absolutely no soliciting"));
    assert.ok(rewards.includes("Referrals are welcome") || rewards.includes("SOLICITING_REFERRALS"));
    assert.ok(rewards.includes("SOLICITING_BAN"));
  });
});
