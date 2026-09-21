# Member UX rebuild — plan, acceptance, four-screen review

Review branch only. Do not merge. Do not promote to Production.

The attached `UX-AUDIT-2026-09-21.md` was not in the workspace (`uploads/` or the checkout) when this branch started. This document does not replace that file. It keeps the six observed defects the task required to stay explicit, separates them from design recommendations, and marks flows that were not re-tested here.

Pricing is unchanged: Founding Ten $5,000, then $10,000 entry + $195/month. No lifetime rewrite.

## Observed defects (P1)

These were named as observed, not as taste.

1. **Demo identity mismatch.** A signed-in member is presented as synthetic “A. Voss” with a “Demo preview” banner. Home and profile read `viewerProfile()` (seed `demo-01`) instead of the session name. Crossings and rewards then attribute that seed member’s Paris trip and points to whoever logged in.
2. **Circle count vs rendered recommendations (10 vs 100).** The dial defaults to 10, but For you mounts up to 100 rows (`rows.slice(0, 100)`) and only tries to hide the rest with `.is-out`. The number and the list disagree.
3. **Crossings Paris count (100 vs 3).** The page prints `matches.length` as “overlapping members in Paris”. `matchesForJourney` keeps anyone in the Meridian 100 even when they have no trip there, so the count can read ~100. The overlap notice counts people with an active journey in that city (“3 members will be in Paris while you are.”).
4. **Referral links leave the canonical domain.** `memberReferralLink` resolves `VERCEL_URL` to `*.vercel.app` when no public app URL wins. Member referral links must stay on `https://tenmeridian.com`.
5. **Help / contact dead end.** Help → “Contact a steward” links to Settings. Settings → Help links back. There is no note a person can send.
6. **Implementation language on member surfaces.** Member UI shows Stream, Higgsfield attributes, stub, Price IDs, “SYNTHETIC DEMO”, “ops fulfills”, and similar provider/ops prose.

## Design recommendations (not extra P1s)

- Member field: ivory paper, marine navy type, champagne used as a hairline and a small kicker. Not a second logo.
- Lock, rail, and wordmark stay the existing black / ivory / champagne-gold lockup (`FormalLockup`, official emblem).
- Five destinations stay: Home · My Circle · Messages · Crossings · Profile.
- Journey stays discovery → conversation → meeting.
- Compact disclosure when people or trips are samples. Do not present samples as real members.
- Editorial stills keep a provenance caption. They are not photographs of members or completed events.

## Untested here

Not claimed as fixed or broken by this pass:

- Live Supabase password login against production accounts
- Stripe Checkout charging a real card
- Stream delivery of a live DM
- Resend delivery of a steward email (this branch records the note in the house; it does not invent a mailbox)
- Open House visitor-local hours, apply, and admin desks
- Push notification registration

## Implementation order

1. **Tokens and shell.** Ivory field, marine type, restrained champagne. Black-gold lockup stays in the rail and header.
2. **Identity.** Session name on Home and Profile. “Demo preview” only for a synthetic session. Real sessions get “Sample network” when the directory is still the sample house.
3. **Home.** Greeting, next crossing, next experience, a short For you list. A real session does not inherit A. Voss’s trip or points.
4. **People (My Circle).** Same nav label. Dial count equals rendered rows.
5. **Profile.** The signed-in name, not the seed profile, when the account is not that seed.
6. **Crossings.** City count is people actually in the city (travelers, locals, hosts). Meridian-only names are not “in Paris”.
7. **Referral origin.** `*.vercel.app` referral links canonicalize to `https://tenmeridian.com`. Localhost and an explicit non-Vercel origin stay put. Auth callbacks still use `resolvePublicOrigin`.
8. **Help and member copy.** A steward note on Help. Settings points at that note. Provider, stub, and ops sentences leave member surfaces. Admin and reviewer tools may stay technical.

## Acceptance criteria

| ID | Pass when |
| --- | --- |
| P1-1 | A non-demo session name is the Home greeting and the Profile title. The banner does not say “Demo preview” for that session. Seed trips and reward balances are not shown as theirs. A synthetic session may still say “Demo preview” and show A. Voss. |
| P1-2 | For you at 10 renders 10 people. Moving the dial to N renders N, and N is at most the available rows (cap 100). Hidden rows are not in the list. |
| P1-3 | Crossings does not print the Meridian 100 length as the number of people in the destination. Traveler copy matches people with overlapping trips. Locals and hosts are separate sentences. |
| P1-4 | `memberReferralLink` on a `*.vercel.app` host returns `https://tenmeridian.com/referral/{code}`. `https://tenmeridian.com` and localhost are unchanged. |
| P1-5 | Help contains a steward note form (`#contact`) with a confirmation. Settings links there. The two pages do not point at each other as the only contact path. |
| P1-6 | Member pages and member components do not show Stream, Higgsfield, stub, Price IDs, “SYNTHETIC DEMO”, or “ops” fulfillment prose. Sample disclosure stays short and does not claim the people are real. |
| D-1 | Member field reads as ivory / marine / champagne. Rail and wordmark remain the existing black-gold lockup. |
| D-2 | Nav is still Home · My Circle · Messages · Crossings · Profile. |
| D-3 | Founding Ten $5,000 and Standard $10,000 + $195/month remain the billing copy. |
| D-4 | Tests in `package.json` pass. No production deploy. |

## Four-screen design review

Shared tokens (member field only):

| Token | Value | Use |
| --- | --- | --- |
| Ivory | `#F7F4EE` | Page ground |
| Ivory card | `#FFFCF6` at ~78% | Cards, dial, profile plate |
| Marine | `#092B45` | Titles, body |
| Marine soft | `#1A4663` | Support copy |
| Champagne | `#C4A264` | Kickers, focus, 1px card edge |
| Black | `#000000` | Header and desktop rail (existing lockup) |

Type: Cormorant Garamond for names and screen titles. Outfit for nav, chips, and forms. Radius on cards ~1.5rem. Motion already in the shell (press 150ms, tabs 220ms); no new animation.

### Home

1. Kicker “This evening”, then the session’s first name in serif.
2. One compact disclosure line under the header (demo vs sample).
3. Four chips: Messages, Next city, Tonight/Next, Rewards (rewards only when the session is the sample member).
4. One crossing card: city, human dates, “Open this trip”. Empty state is “Add a trip”, not someone else’s city.
5. One experience card.
6. “Useful connections” — three people, one-line reason, message / circle actions.
7. No campaign still on Home (existing rule).

### People (My Circle)

1. Ask the Meridian stays at the top.
2. Tabs: For you · Your Circle · All members.
3. Dial: large numeral = rows on the page. Ends stay “10 — immediate” and “100 — wider field”.
4. Person row: round initials, name, city, one-line reason, message. Samples are not labeled as real members.

### Profile

1. Centered ivory plate: initials, session name, one-line headline, city.
2. “Finish your profile” / “Edit your introduction”.
3. About and Gallery. Gallery adds do not mention storage stubs.
4. Empty real profile is empty. It does not borrow A. Voss’s bio.

### Crossings

1. Serif title, one support line, “Add a trip”.
2. Editorial still for the upcoming city, captioned as a placeholder (screen-reader provenance). No provider name.
3. Trip card, then the city count from presence (travelers / locals / hosts).
4. Requests, then Notes / Hosts / Tables.
5. Five-item nav unchanged.

## Route checklist

Checked locally on the review branch with a synthetic session (Demo preview / A. Voss) and a non-demo session (Sample network / Avery Chen). Not a production login.

| Route | Result |
| --- | --- |
| `/member/home` | Pass. Synthetic greeting is A. and the next city is Paris. Non-demo greeting is Avery, next city is Add a trip, banner is Sample network, not Demo preview. |
| `/member/circle` | Pass. Dial reads 10 and the list mounts 10 people, not 100. |
| `/member/profile` | Pass. Synthetic profile is A. Voss. Non-demo profile is Avery Chen, with an empty about state and no borrowed reward balance. |
| `/member/crossings` | Pass. Synthetic Paris copy is “3 members will be in Paris while you are.” Locals and hosts are separate sentences. The page does not say “100 overlapping members.” A non-demo session with no trip sees “No trip yet.” |
| `/member/help` | Pass. Steward note form is on the page. POST `/api/help` returned ok. |
| `/member/settings` | Pass. Contact links to `/member/help#contact`. Founding Ten $5,000 and $10,000 + $195/month remain. |
| `/member/billing` | Pass. “Checkout is not open yet. Nothing is charged.” Pricing labels remain. No stub or Price ID sentence. |
| `/member/messages`, live DMs | Unresolved. Compose no longer names Stream. Live delivery was not exercised. |
| Open House, apply, admin, Stripe charge, Supabase password login | Untested in this pass. |

Screenshots: `docs/ux-review/` (desktop and mobile).

## Out of scope

Messages live transport, payment logic, policies, matching weights, Open House marketing rewrite, and a new logo.
