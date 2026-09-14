# Supabase

Apply migrations in order against a new project:

1. `0001_init.sql` — accounts, applications, referrals, memberships, profiles, events, audit
2. `0002_matching.sql` — weights, scores, feedback, curation, scoring functions, 10-cap helper
3. `0003_rls.sql` — deny-by-default policies
4. `0004_storage.sql` — private buckets (may require dashboard if `storage.buckets` is restricted)
5. `0005_seed.sql` — SYNTHETIC DEMO channels + test referral hash

The Next.js app does not require a live project to boot. See `src/lib/supabase/stub.ts`.
