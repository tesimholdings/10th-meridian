-- 10th Meridian foundation schema
-- Auth identities live in auth.users; this schema holds product records.

create extension if not exists pgcrypto;

do $$ begin
  create type app_role as enum (
    'guest',
    'applicant',
    'approved_unpaid',
    'member',
    'moderator',
    'administrator'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type application_status as enum (
    'started',
    'submitted',
    'under_review',
    'referred',
    'waitlisted',
    'approved_payment_pending',
    'active_member',
    'declined',
    'expired',
    'suspended'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type membership_product as enum (
    'founding',
    'standard',
    'organization'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type availability_level as enum ('open', 'selective', 'limited', 'paused');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type profile_visibility as enum ('members', 'matches_only', 'hidden');
exception when duplicate_object then null;
end $$;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text not null unique,
  full_name text not null,
  role app_role not null default 'guest',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.site_config (
  id text primary key default 'default',
  timezone text not null default 'America/Chicago',
  open_house_day int not null default 10 check (open_house_day between 1 and 28),
  referral_hour int not null default 9 check (referral_hour between 0 and 23),
  general_hour int not null default 10 check (general_hour between 0 and 23),
  close_hour int not null default 22 check (close_hour between 0 and 23),
  admissions_cap int not null default 10 check (admissions_cap between 1 and 10),
  founding_price_label text not null default '[INSERT APPROVED FOUNDING PRICE]',
  standard_price_label text not null default '[INSERT APPROVED STANDARD PRICE]',
  stripe_founding_price_id text,
  stripe_standard_price_id text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.accounts (id)
);

insert into public.site_config (id) values ('default') on conflict (id) do nothing;

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null check (month between 1 and 12),
  cap int not null default 10,
  accepted_count int not null default 0,
  notes text,
  unique (year, month)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  token_hash text not null unique,
  created_by uuid references public.accounts (id),
  label text,
  max_uses int not null default 5,
  use_count int not null default 0,
  expires_at timestamptz,
  revoked_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals (id) on delete cascade,
  account_id uuid references public.accounts (id),
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts (id),
  status application_status not null default 'started',
  full_name text not null,
  email text not null,
  phone text,
  city text,
  country text,
  timezone text,
  role_title text,
  company text,
  bio text,
  website text,
  linkedin text,
  industries text[] not null default '{}',
  interests text[] not null default '{}',
  goals text[] not null default '{}',
  strengths text[] not null default '{}',
  offers text[] not null default '{}',
  needs text[] not null default '{}',
  valued_people text[] not null default '{}',
  valued_opportunities text[] not null default '{}',
  preferred_connection_types text[] not null default '{}',
  referral_id uuid references public.referrals (id),
  discovery_source text,
  terms_agreed boolean not null default false,
  progress jsonb not null default '{}'::jsonb,
  cohort_id uuid references public.cohorts (id),
  reviewer_id uuid references public.accounts (id),
  reviewer_notes text,
  override_cap boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source text not null default 'lock_screen',
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  product membership_product not null,
  status text not null default 'incomplete',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  is_founding_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  display_name text not null,
  headline text,
  role_title text,
  company text,
  city text,
  country text,
  timezone text,
  bio text,
  website text,
  linkedin text,
  industries text[] not null default '{}',
  interests text[] not null default '{}',
  values_list text[] not null default '{}',
  goals text[] not null default '{}',
  ambitions text[] not null default '{}',
  projects text[] not null default '{}',
  strengths text[] not null default '{}',
  offers text[] not null default '{}',
  needs text[] not null default '{}',
  valued_people text[] not null default '{}',
  valued_opportunities text[] not null default '{}',
  preferred_connection_types text[] not null default '{}',
  geography text[] not null default '{}',
  travel text[] not null default '{}',
  causes text[] not null default '{}',
  communication_style text,
  availability availability_level not null default 'selective',
  visibility profile_visibility not null default 'members',
  completion numeric(5,2) not null default 0,
  embedding jsonb,
  embedding_updated_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null,
  summary text,
  city text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int,
  stripe_price_id text,
  channel_slug text,
  is_demo boolean not null default false,
  created_by uuid references public.accounts (id),
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  status text not null default 'registered',
  stripe_checkout_id text,
  created_at timestamptz not null default now(),
  unique (event_id, account_id)
);

create table if not exists public.introductions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.accounts (id),
  target_id uuid not null references public.accounts (id),
  status text not null default 'requested',
  note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.accounts (id),
  blocked_id uuid not null references public.accounts (id),
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.accounts (id),
  subject_type text not null,
  subject_id text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.accounts (id),
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind text not null,
  topic text,
  stream_channel_id text,
  is_demo boolean not null default false,
  created_by uuid references public.accounts (id),
  created_at timestamptz not null default now()
);

create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_email_idx on public.applications (email);
create index if not exists profiles_account_idx on public.profiles (account_id);
create index if not exists memberships_customer_idx on public.memberships (stripe_customer_id);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
