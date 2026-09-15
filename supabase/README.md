# Supabase

Apply migrations in order against a new project:

1. `0001_init.sql` — accounts, applications, referrals, memberships, profiles, events, audit
2. `0002_matching.sql` — weights, scores, feedback, curation, scoring functions, 10-cap helper
3. `0003_rls.sql` — deny-by-default policies
4. `0004_storage.sql` — private buckets (may require dashboard if `storage.buckets` is restricted)
5. `0005_seed.sql` — SYNTHETIC DEMO channels + test referral hash
6. `0006_crossings.sql` — journeys, crossing requests, tables, City Hosts, City Notes, travel weights, RLS
7. `0007_profiles_network.sql` — circle edges, notifications, lifetime product, gallery
8. `0008_live_stack.sql` — Meridian 10/100 views, matching comments, `membership_events`, `stripe_price_id`

The Next.js app does not require a live project to boot. See `src/lib/supabase/stub.ts`.
City Notes and journeys are never readable by `anon`. Exact table venues are withheld by view/`group_tables_public` unless the viewer is a confirmed guest or steward.
