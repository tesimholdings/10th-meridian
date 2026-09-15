-- Stripe membership (review only). Founding Ten + Standard entry/dues.
-- Apply after 0008. Safe on an empty preview project.
--
-- Founding Ten: first 10 members, $5,000 one-time (no discounts).
-- After that: $10,000 one-time entry + $195/month. Cancel dues → seat ends.
-- Rejoin requires a new $10,000 entry. Archived lifetime Price is never used.

alter table public.memberships
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_invoice_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists canceled_at timestamptz,
  add column if not exists source text;

comment on column public.memberships.source is
  'checkout, invoice, or subscription. Founding is one-time; standard keeps a monthly subscription.';

create unique index if not exists memberships_checkout_session_idx
  on public.memberships (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create unique index if not exists memberships_invoice_idx
  on public.memberships (stripe_invoice_id)
  where stripe_invoice_id is not null;

create unique index if not exists memberships_subscription_idx
  on public.memberships (stripe_subscription_id)
  where stripe_subscription_id is not null;

create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  account_id text,
  unlocked boolean not null default false,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

create or replace view public.founding_ten_usage as
select
  count(*)::int as taken,
  greatest(0, 10 - count(*)::int) as remaining
from public.memberships
where product = 'founding';

comment on view public.founding_ten_usage is
  'Founding Ten seats used. First 10 members ever; canceled founding seats still count.';

alter table public.site_config
  add column if not exists stripe_monthly_price_id text,
  add column if not exists monthly_dues_label text not null default '$195';

comment on column public.site_config.stripe_price_id is
  'Retired. Archived lifetime Price — do not charge. Use founding / standard / monthly IDs.';
comment on column public.site_config.stripe_founding_price_id is
  'Founding Ten $5,000 one-time. Env: STRIPE_PRICE_FOUNDING_ENTRY.';
comment on column public.site_config.stripe_standard_price_id is
  'Standard $10,000 one-time entry. Env: STRIPE_PRICE_STANDARD_ENTRY.';
comment on column public.site_config.stripe_monthly_price_id is
  'Standard $195/month. Env: STRIPE_PRICE_MONTHLY.';
comment on column public.site_config.stripe_lifetime_price_id is
  'Retired archived lifetime Price. Do not charge.';
comment on column public.site_config.lifetime_price_label is
  'Retired. Standard entry is $10,000 plus $195/month.';

alter table public.membership_events
  alter column product set default 'founding';

update public.site_config
set
  founding_price_label = '$5,000',
  standard_price_label = '$10,000',
  monthly_dues_label = '$195'
where id = 'default';
