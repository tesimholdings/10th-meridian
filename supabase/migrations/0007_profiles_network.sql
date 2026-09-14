-- Profiles, Your Circle, house notifications, DMs, lifetime membership.
-- Preview continues to use the in-process store until these tables are live.

alter type membership_product add value if not exists 'lifetime';

alter table public.site_config
  add column if not exists lifetime_price_label text not null default '$10,000',
  add column if not exists stripe_lifetime_price_id text,
  add column if not exists prepared_domain text not null default 'tenmeridian.com';

alter table public.profiles
  add column if not exists website text,
  add column if not exists linkedin text,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists privacy jsonb not null default '{
    "website": true,
    "linkedin": true,
    "gallery": true,
    "offers": true,
    "needs": true,
    "strengths": true,
    "events": true
  }'::jsonb,
  add column if not exists attending_event_ids uuid[] not null default '{}';

do $$ begin
  alter type profile_visibility add value if not exists 'index_only';
exception when duplicate_object then null;
end $$;

create table if not exists public.circle_edges (
  owner_id uuid not null references public.profiles (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (owner_id, member_id),
  check (owner_id <> member_id)
);

create table if not exists public.index_removals (
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  removed_at timestamptz not null default now(),
  primary key (viewer_id, target_id)
);

create table if not exists public.house_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.house_notification_prefs (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.direct_threads (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null unique,
  a uuid not null references public.profiles (id) on delete cascade,
  b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (a <> b)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do nothing;
