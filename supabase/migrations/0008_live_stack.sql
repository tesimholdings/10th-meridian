-- Live-stack wiring (review only). Lifetime checkout refs + Meridian 10/100 views.
-- Apply after 0007. Safe on an empty preview project.
--
-- Algorithm (also documented in docs/MATCHING.md):
--   complementary  0.30  offer/strength meets the other's need (reciprocal)
--   goals          0.25  shared or adjacent ambitions / projects
--   interests      0.15  values, causes, held-in-common currents
--   industry       0.10  useful adjacency, not a same-industry ghetto
--   geography      0.05  city / travel overlap + timezone nearness (TS)
--   preferences    0.05  connection-type overlap + availability
--   novelty        0.10  diversity hook — penalize globally popular targets
-- Circle sizes: Meridian 10 (immediate), Meridian 100 (wider field).
-- Protected traits (race, religion, health, orientation, …) are never columns
-- and must never become ranking factors.

comment on table public.matching_weights is
  'Configurable Meridian Index weights. Defaults 30/25/15/10/5/5/10. Stewards may retune; sum must stay > 0.';

comment on column public.matching_weights.complementary is
  'Reciprocal value: one member''s offers/strengths meet the other''s needs.';
comment on column public.matching_weights.goals is
  'Structured compatibility on goals, ambitions, and projects.';
comment on column public.matching_weights.interests is
  'Interests, values, and causes — adjacency, not identity.';
comment on column public.matching_weights.industry is
  'Industry overlap. Diversity rerank later prevents a monoculture top-10.';
comment on column public.matching_weights.geography is
  'City / travel overlap. City-level only — never live location.';
comment on column public.matching_weights.preferences is
  'Preferred connection types and availability.';
comment on column public.matching_weights.novelty is
  'Diversity hook: keep the same ten people from topping every list.';

alter table public.site_config
  add column if not exists stripe_price_id text;

comment on column public.site_config.stripe_price_id is
  'Alias for the approved $10,000 lifetime one-time Price. Env: STRIPE_PRICE_ID. Monthly is not a product.';

-- Audit rows for Checkout / webhook stubs. Stripe IDs only — never card data.
create table if not exists public.membership_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  type text,
  session_id text,
  account_id text,
  product text not null default 'lifetime',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.membership_events enable row level security;

create or replace view public.meridian_100 as
select
  ranked.viewer_id,
  ranked.target_id,
  ranked.complementary,
  ranked.goals,
  ranked.interests,
  ranked.industry,
  ranked.geography,
  ranked.preferences,
  ranked.novelty,
  ranked.weighted,
  ranked.explanations,
  ranked.source,
  ranked.calculated_at,
  ranked.circle_rank
from (
  select
    ms.*,
    row_number() over (
      partition by ms.viewer_id
      order by ms.weighted desc, ms.calculated_at desc
    ) as circle_rank
  from public.match_scores ms
) ranked
where ranked.circle_rank <= 100;

create or replace view public.meridian_10 as
select *
from public.meridian_100
where circle_rank <= 10;

comment on view public.meridian_10 is
  'Immediate circle of ten. Ranked by weighted score after curation / suppress.';
comment on view public.meridian_100 is
  'Wider field of up to 100. Same ranking as Meridian 10; the UI slides 10 → 100.';

-- DEMO seed weights (idempotent). Preview still uses TypeScript scoring when
-- Supabase env is absent. These rows exist so a live project boots with the
-- same published defaults.
insert into public.matching_weights (
  id, complementary, goals, interests, industry, geography, preferences, novelty
) values (
  'default', 0.3000, 0.2500, 0.1500, 0.1000, 0.0500, 0.0500, 0.1000
) on conflict (id) do update set
  complementary = excluded.complementary,
  goals = excluded.goals,
  interests = excluded.interests,
  industry = excluded.industry,
  geography = excluded.geography,
  preferences = excluded.preferences,
  novelty = excluded.novelty
where public.matching_weights.updated_by is null;
