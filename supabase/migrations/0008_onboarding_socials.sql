-- Experiential onboarding: why-you're-here intents + social connects.
-- Preview continues to use the in-process store until these columns are live.

alter table public.profiles
  add column if not exists intents text[] not null default '{}',
  add column if not exists intent_other text,
  add column if not exists socials jsonb not null default '[]'::jsonb;

alter table public.applications
  add column if not exists intents text[] not null default '{}',
  add column if not exists intent_other text,
  add column if not exists socials jsonb not null default '[]'::jsonb;

update public.profiles
set privacy = privacy || '{"socials": true}'::jsonb
where privacy -> 'socials' is null;
