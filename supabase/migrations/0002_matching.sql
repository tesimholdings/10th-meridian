-- Meridian Index: structured scoring + complementarity + diversity hooks.
-- Embeddings are optional jsonb vectors; pgvector can replace this later.

create table if not exists public.matching_weights (
  id text primary key default 'default',
  complementary numeric(5,4) not null default 0.3000,
  goals numeric(5,4) not null default 0.2500,
  interests numeric(5,4) not null default 0.1500,
  industry numeric(5,4) not null default 0.1000,
  geography numeric(5,4) not null default 0.0500,
  preferences numeric(5,4) not null default 0.0500,
  novelty numeric(5,4) not null default 0.1000,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.accounts (id),
  constraint matching_weights_sum_chk check (
    complementary + goals + interests + industry + geography + preferences + novelty > 0
  )
);

insert into public.matching_weights (id) values ('default') on conflict (id) do nothing;

create table if not exists public.match_scores (
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  complementary numeric(6,5) not null,
  goals numeric(6,5) not null,
  interests numeric(6,5) not null,
  industry numeric(6,5) not null,
  geography numeric(6,5) not null,
  preferences numeric(6,5) not null,
  novelty numeric(6,5) not null,
  weighted numeric(6,5) not null,
  explanations jsonb not null default '[]'::jsonb,
  source text not null default 'algorithmic',
  calculated_at timestamptz not null default now(),
  primary key (viewer_id, target_id)
);

create table if not exists public.match_feedback (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  signal text not null check (signal in (
    'relevant', 'not_relevant', 'declined', 'hidden', 'accepted', 'introduced'
  )),
  created_at timestamptz not null default now()
);

create table if not exists public.match_curation (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('promote', 'suppress')),
  reason text not null,
  curator_id uuid references public.accounts (id),
  created_at timestamptz not null default now(),
  unique (viewer_id, target_id)
);

create or replace function public.array_jaccard(a text[], b text[])
returns numeric
language sql
immutable
as $$
  select case
    when coalesce(cardinality(a),0) = 0 and coalesce(cardinality(b),0) = 0 then 0
    else (
      select coalesce(count(*)::numeric, 0) / nullif(
        (select count(*) from (
          select lower(trim(x)) from unnest(coalesce(a, '{}')) as x
          union
          select lower(trim(y)) from unnest(coalesce(b, '{}')) as y
        ) u),
        0
      )
      from (
        select lower(trim(x)) as v from unnest(coalesce(a, '{}')) as x
        intersect
        select lower(trim(y)) from unnest(coalesce(b, '{}')) as y
      ) i
    )
  end;
$$;

create or replace function public.complementary_pair(
  offers_a text[],
  strengths_a text[],
  needs_b text[],
  offers_b text[],
  strengths_b text[],
  needs_a text[]
) returns numeric
language sql
immutable
as $$
  select least(1::numeric,
    coalesce(public.array_jaccard(offers_a || strengths_a, needs_b), 0) * 0.6
    + coalesce(public.array_jaccard(offers_b || strengths_b, needs_a), 0) * 0.6
  );
$$;

create or replace function public.score_profile_pair(a public.profiles, b public.profiles)
returns table (
  complementary numeric,
  goals numeric,
  interests numeric,
  industry numeric,
  geography numeric,
  preferences numeric
)
language sql
stable
as $$
  select
    public.complementary_pair(a.offers, a.strengths, b.needs, b.offers, b.strengths, a.needs),
    public.array_jaccard(a.goals || a.ambitions || a.projects, b.goals || b.ambitions || b.projects),
    public.array_jaccard(a.interests || a.values_list || a.causes, b.interests || b.values_list || b.causes),
    public.array_jaccard(a.industries, b.industries),
    greatest(
      public.array_jaccard(a.geography || array[a.city, a.country], b.geography || array[b.city, b.country]),
      public.array_jaccard(a.travel, b.travel)
    ),
    public.array_jaccard(a.preferred_connection_types, b.preferred_connection_types);
$$;

-- Recalculate cached rankings for one viewer. Call after meaningful profile edits.
create or replace function public.recalculate_matches_for(p_viewer uuid)
returns int
language plpgsql
as $$
declare
  w public.matching_weights;
  inserted int := 0;
  viewer public.profiles;
  target public.profiles;
  s record;
  weighted numeric;
  novelty numeric;
begin
  select * into w from public.matching_weights where id = 'default';
  select * into viewer from public.profiles where id = p_viewer;
  if viewer.id is null then
    return 0;
  end if;

  delete from public.match_scores where viewer_id = p_viewer;

  for target in
    select * from public.profiles
    where id <> p_viewer
      and availability <> 'paused'
      and visibility <> 'hidden'
      and not exists (
        select 1 from public.blocks bl
        where (bl.blocker_id = viewer.account_id and bl.blocked_id = target.account_id)
           or (bl.blocker_id = target.account_id and bl.blocked_id = viewer.account_id)
      )
      and not exists (
        select 1 from public.match_feedback f
        where f.viewer_id = p_viewer
          and f.target_id = target.id
          and f.signal in ('declined', 'hidden', 'not_relevant')
      )
  loop
    select * into s from public.score_profile_pair(viewer, target);
    novelty := 0.5;
    weighted := least(1, greatest(0,
      s.complementary * w.complementary
      + s.goals * w.goals
      + s.interests * w.interests
      + s.industry * w.industry
      + s.geography * w.geography
      + s.preferences * w.preferences
      + novelty * w.novelty
    ));

    if exists (
      select 1 from public.match_curation c
      where c.viewer_id = p_viewer and c.target_id = target.id and c.action = 'suppress'
    ) then
      continue;
    end if;

    if exists (
      select 1 from public.match_curation c
      where c.viewer_id = p_viewer and c.target_id = target.id and c.action = 'promote'
    ) then
      weighted := least(1, weighted + 0.20);
    end if;

    insert into public.match_scores (
      viewer_id, target_id, complementary, goals, interests, industry,
      geography, preferences, novelty, weighted, explanations, source
    ) values (
      p_viewer, target.id, s.complementary, s.goals, s.interests, s.industry,
      s.geography, s.preferences, novelty, weighted,
      jsonb_build_array(
        jsonb_build_object('pillar', 'Reciprocal value', 'text', 'Structured complementarity applied.'),
        jsonb_build_object('pillar', 'Goals', 'text', 'Goal adjacency scored in Postgres.')
      ),
      case when exists (
        select 1 from public.match_curation c
        where c.viewer_id = p_viewer and c.target_id = target.id
      ) then 'human_curated' else 'algorithmic' end
    );
    inserted := inserted + 1;
  end loop;

  return inserted;
end;
$$;

create or replace function public.can_approve_application(p_application uuid, p_override boolean)
returns boolean
language plpgsql
as $$
declare
  cap int;
  accepted int;
  c public.cohorts;
  app public.applications;
begin
  select * into app from public.applications where id = p_application;
  if app.id is null then
    return false;
  end if;
  if app.cohort_id is null then
    return false;
  end if;
  select * into c from public.cohorts where id = app.cohort_id;
  cap := c.cap;
  accepted := c.accepted_count;
  if accepted >= cap and not coalesce(p_override, false) then
    return false;
  end if;
  return true;
end;
$$;

create or replace function public.touch_profile_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
before update on public.profiles
for each row execute function public.touch_profile_updated();
