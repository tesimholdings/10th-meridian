# TEST_REPORT — Ask the Meridian

Date: 2026-09-14  
Branch: `cursor/members-ask-match-257a`  
Base: `cursor/ui-polish-wave3-907d`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | Pass — 56 tests (Index scoring, Ask parse→score, exclusions, Open House isolation, empty query, preview store, Crossings) |
| `npm run lint` | Pass |
| `npm run build` | Pass |

Ask coverage: parse of a Series A fintech NYC need; complementarity ranks helpers above unrelated members; empty query invents no one; hidden / paused / blocked / not-relevant / suspended exclusions; Open House never exposes non-demo profiles; human-curated label; store feedback.

## Product

- Feature: **Ask the Meridian** · subtitle **Who can help**
- Line: **Say what you need. We’ll show who can help.**
- Surfaces: `/member/members`, `/member/ask`, Home card, Menu
- Results are **Who can help** on the **Index** — member UI never says “matches”
- **Why you should meet**; algorithmic vs human-curated labeled
- Deep-link `/member/members/{id}?from=ask` · Message DM `/member/channels?dm={id}` · Remove from Index
- House prompts do not solicit; placeholder is counsel, not a raise
- Weights default 45 / 20 / 12 / 10 / 8 / 5 — stewards can edit
- No membership prices invented. Lifetime is not part of this change.

## Privacy

Open House: SYNTHETIC DEMO only. Directory and Ask both filter non-demo rows for guests. RLS on `help_asks` / scores / feedback is members-only.

## Runtime limitations

- Preview store is in-process and resets on server restart
- Stream compose is DEMO unless keys exist; not E2EE
- Semantic layer is a lexical stub unless an embedding provider is configured
- No production deploy

## Still Stefan’s

Approved Founding / Standard amounts, hero film, live keys, counsel-approved legal copy.
