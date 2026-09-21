-- Profile builder for fresh members.
-- Additive only. Existing rows are marked settled so current members are not
-- prompted again. New profile inserts leave the timestamps null until the
-- member completes or skips the introduction.

alter table public.profiles
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists x_url text,
  add column if not exists social_links jsonb not null default '[]'::jsonb,
  add column if not exists intents text[] not null default '{}',
  add column if not exists intent_note text,
  add column if not exists about_now text,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_skipped_at timestamptz;

comment on column public.profiles.intents is
  'Stable tags for why the member is here (travel, mentor, learn, grow_business, meet_friends, and others). Meridian Index can match on these ids.';

comment on column public.profiles.intent_note is
  'Free-text reason for being here. Stored beside intents so matching can use a sentence without collapsing the profile into one unstructured blob.';

comment on column public.profiles.social_links is
  'Extra social links as [{"label","url"}]. LinkedIn, Instagram, Facebook, and X have their own columns.';

comment on column public.profiles.onboarding_completed_at is
  'Set when the member finishes the profile builder. Null means a fresh account has not finished.';

comment on column public.profiles.onboarding_skipped_at is
  'Set when the member chooses Skip for now. They are not prompted again.';

-- Profiles that already exist are not fresh signups.
update public.profiles
set onboarding_completed_at = coalesce(onboarding_completed_at, created_at, now())
where onboarding_completed_at is null
  and onboarding_skipped_at is null;
