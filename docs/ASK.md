# Ask the Meridian

**Who can help**  
**Say what you need. We’ll show who can help.**

Hybrid Meridian Index ranking for a stated need — structured facets, complementarity (their offers vs the ask), existing Index compatibility, geography, availability, and a lexical supplement. Not a “find similar people” prompt.

Member UI never calls the result list “matches.” It is the **Index**: Who can help, with **Why you should meet**.

## Defaults (ask weights)

| Pillar | Weight |
| --- | --- |
| Complementarity (their offers / strengths vs the stated need) | 45% |
| Existing Meridian Index compatibility | 20% |
| Industry | 12% |
| Geography | 10% |
| Availability | 8% |
| Lexical / embedding supplement | 5% |

Stewards can edit these on **Steward desk → Matching**.

## Click-path (Stefan)

1. `/` → Reviewer tools → **Preview as member**
2. Bottom nav **Members**, or Home → **Ask the Meridian**
3. Write a need (placeholder is counsel, not a solicitation) or tap an intent chip
4. Optional **Refine filters** (location, industry, availability, offer/need tags)
5. **Ask** → ranked **Who can help** cards with **Why you should meet**, algorithmic vs human-curated
6. **Open profile** (deep-link `/member/members/{id}?from=ask`) · **Message** (DM `/member/channels?dm={id}`, Stream stub without keys) · **Request introduction** · **Remove from Index**
7. Relevant / not relevant feeds the behavioral layer
8. Reviewer tools → **Force Open House** as guest: SYNTHETIC DEMO people only; no real member exposure

## Do not

- Invent membership prices
- Solicit in house prompts or placeholder copy
- Call Who can help “matches” in member UI
- Deploy this branch to production
