# Meridian matching (10 / 100)

Hybrid scoring lives in TypeScript (`src/lib/matching/`) and Postgres (`supabase/migrations/0002_matching.sql`, `0008_live_stack.sql`). Preview uses the TypeScript path when Supabase env is missing. Live projects call `recalculate_matches_for` and read `meridian_10` / `meridian_100`.

This is a ranking, not a verdict. Intelligence finds the signal. People decide what happens next. Never call the surface “Matches.”

## Circle sizes

| Circle | Size | Meaning |
| --- | ---: | --- |
| **Meridian 10** | 10 | Immediate recommended set |
| **Meridian 100** | 100 | Wider field; the member UI slides 10 → 100 |

Both are slices of the same ranked list. No invented profiles. Paused, hidden, blocked, declined, and steward-suppressed people are excluded.

## Structured compatibility

Shared or adjacent **goals / ambitions / projects**, **interests / values / causes**, **industry**, **geography / travel**, and **preferred connection types**. Scoring is Jaccard / soft token overlap — not identity, not protected traits.

## Complementarity (reciprocal value)

One member’s **offers + strengths** meeting the other’s **needs**, and the reverse. A pair that can help each other ranks above a pair that merely shares a label.

## Diversity hooks

1. **Novelty weight (0.10)** — penalize targets that already sit on many other top-10 lists (`popularityPenalty`).
2. **Rerank** — after the weighted sort, `rerankForDiversity` slightly down-ranks repeated industries and cities so the ten are not a monoculture.

## Configurable weights

Defaults (must stay positive; the app normalizes to 1):

| Pillar | Weight |
| --- | ---: |
| Complementary | 0.30 |
| Goals | 0.25 |
| Interests | 0.15 |
| Industry | 0.10 |
| Geography | 0.05 |
| Preferences | 0.05 |
| Novelty | 0.10 |

Stewards can retune `matching_weights` (`id = 'default'`) or `POST /api/matching/weights`. Preview store keeps an in-process copy.

## Human overlay

- Member feedback: relevant / not relevant / declined / hidden / accepted / introduced
- Steward curation: promote (+0.20) or suppress (drop)
- Ask the Meridian explanations stay city-honest and filler-free

## Protected traits

Never stored as ranking columns. Never used as features: race, ethnicity, religion, health, disability, sexual orientation, gender identity, pregnancy, age, national origin as a ranking factor.

## Demo vs live

- **Demo (no Supabase env):** `computeMatchIndex` over SYNTHETIC DEMO profiles in `src/lib/data/demo.ts`.
- **Live:** `loadHybridMatchIndex` tries Postgres first, then falls back to TypeScript on any error.

Optional embeddings (`EMBEDDING_PROVIDER=openai`) may boost goals/interests. Unset = lexical stub. Do not market the stub as “AI.”
