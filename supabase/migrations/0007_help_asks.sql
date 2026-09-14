-- Ask the Meridian: help asks, ask→match scores, ask feedback.
-- Members only. Open House / anon have no policies.

create table if not exists public.ask_match_weights (
  id text primary key default 'default',
  complementary numeric(5,4) not null default 0.4500,
  meridian numeric(5,4) not null default 0.2000,
  industry numeric(5,4) not null default 0.1200,
  geography numeric(5,4) not null default 0.1000,
  availability numeric(5,4) not null default 0.0800,
  semantic numeric(5,4) not null default 0.0500,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.accounts (id),
  constraint ask_match_weights_sum_chk check (
    complementary + meridian + industry + geography + availability + semantic > 0
  )
);

insert into public.ask_match_weights (id) values ('default') on conflict (id) do nothing;

do $$ begin
  create type ask_intent as enum (
    'capital', 'hiring', 'advice', 'collaboration', 'intro', 'ops', 'creative', 'other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.help_asks (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  query_text text not null default '',
  intents ask_intent[] not null default '{}',
  parsed_facets jsonb not null default '{}'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists help_asks_viewer_idx on public.help_asks (viewer_id, created_at desc);

create table if not exists public.help_ask_scores (
  ask_id uuid not null references public.help_asks (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  complementary numeric(6,5) not null,
  meridian numeric(6,5) not null,
  industry numeric(6,5) not null,
  geography numeric(6,5) not null,
  availability numeric(6,5) not null,
  semantic numeric(6,5) not null,
  weighted numeric(6,5) not null,
  explanations jsonb not null default '[]'::jsonb,
  source text not null default 'algorithmic',
  calculated_at timestamptz not null default now(),
  primary key (ask_id, target_id)
);

create table if not exists public.help_ask_feedback (
  id uuid primary key default gen_random_uuid(),
  ask_id uuid not null references public.help_asks (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  signal text not null check (signal in ('relevant', 'not_relevant', 'hidden', 'saved')),
  created_at timestamptz not null default now()
);

create index if not exists help_ask_feedback_viewer_idx
  on public.help_ask_feedback (viewer_id, target_id);

alter table public.ask_match_weights enable row level security;
alter table public.help_asks enable row level security;
alter table public.help_ask_scores enable row level security;
alter table public.help_ask_feedback enable row level security;

create policy ask_weights_read on public.ask_match_weights
  for select using (public.is_staff() or public.is_member());

create policy ask_weights_write on public.ask_match_weights
  for update using (public.current_role() = 'administrator');

create policy help_asks_owner on public.help_asks
  for all using (
    viewer_id = public.current_profile_id() or public.is_staff()
  )
  with check (
    viewer_id = public.current_profile_id() or public.is_staff()
  );

create policy help_ask_scores_viewer on public.help_ask_scores
  for select using (
    ask_id in (select id from public.help_asks where viewer_id = public.current_profile_id())
    or public.is_staff()
  );

create policy help_ask_feedback_viewer on public.help_ask_feedback
  for all using (
    viewer_id = public.current_profile_id() or public.is_staff()
  )
  with check (
    viewer_id = public.current_profile_id() or public.is_staff()
  );

-- Recalculate cached ask scores for one ask. Call after a new ask.
create or replace function public.recalculate_help_ask(p_ask uuid)
returns int
language plpgsql
as $$
declare
  w public.ask_match_weights;
  iw public.matching_weights;
  ask_row public.help_asks;
  viewer public.profiles;
  target public.profiles;
  s record;
  inserted int := 0;
  weighted numeric;
  meridian numeric;
  complementary numeric;
begin
  select * into w from public.ask_match_weights where id = 'default';
  select * into iw from public.matching_weights where id = 'default';
  select * into ask_row from public.help_asks where id = p_ask;
  if ask_row.id is null then
    return 0;
  end if;
  select * into viewer from public.profiles where id = ask_row.viewer_id;
  if viewer.id is null then
    return 0;
  end if;
  if length(trim(ask_row.query_text)) = 0 and coalesce(cardinality(ask_row.intents), 0) = 0 then
    delete from public.help_ask_scores where ask_id = p_ask;
    return 0;
  end if;

  delete from public.help_ask_scores where ask_id = p_ask;

  for target in
    select * from public.profiles
    where id <> viewer.id
      and availability <> 'paused'
      and visibility <> 'hidden'
      and not exists (
        select 1 from public.blocks bl
        where (bl.blocker_id = viewer.account_id and bl.blocked_id = target.account_id)
           or (bl.blocker_id = target.account_id and bl.blocked_id = viewer.account_id)
      )
      and not exists (
        select 1 from public.match_feedback f
        where f.viewer_id = viewer.id
          and f.target_id = target.id
          and f.signal in ('declined', 'hidden', 'not_relevant')
      )
      and not exists (
        select 1 from public.help_ask_feedback hf
        where hf.ask_id = p_ask
          and hf.target_id = target.id
          and hf.signal in ('hidden', 'not_relevant')
      )
  loop
    select * into s from public.score_profile_pair(viewer, target);
    complementary := greatest(
      coalesce(public.array_jaccard(target.offers || target.strengths, viewer.needs), 0),
      coalesce(public.array_jaccard(
        target.offers || target.strengths,
        coalesce(
          (select array_agg(x) from jsonb_array_elements_text(ask_row.parsed_facets -> 'needs') as x),
          '{}'::text[]
        )
      ), 0)
    );
    meridian := least(1, greatest(0,
      s.complementary * iw.complementary
      + s.goals * iw.goals
      + s.interests * iw.interests
      + s.industry * iw.industry
      + s.geography * iw.geography
      + s.preferences * iw.preferences
      + 0.5 * iw.novelty
    ));
    weighted := least(1, greatest(0,
      complementary * w.complementary
      + meridian * w.meridian
      + s.industry * w.industry
      + s.geography * w.geography
      + s.preferences * w.availability
    ));

    if exists (
      select 1 from public.match_curation c
      where c.viewer_id = viewer.id and c.target_id = target.id and c.action = 'suppress'
    ) then
      continue;
    end if;

    if exists (
      select 1 from public.match_curation c
      where c.viewer_id = viewer.id and c.target_id = target.id and c.action = 'promote'
    ) then
      weighted := least(1, weighted + 0.20);
    end if;

    insert into public.help_ask_scores (
      ask_id, target_id, complementary, meridian, industry, geography,
      availability, semantic, weighted, explanations, source
    ) values (
      p_ask, target.id, complementary, meridian, s.industry, s.geography,
      s.preferences, 0, weighted,
      jsonb_build_array(
        jsonb_build_object('pillar', 'They can help', 'text', 'Structured complementarity applied.'),
        jsonb_build_object('pillar', 'Why you should meet', 'text', 'Meridian Index compatibility included.')
      ),
      case when exists (
        select 1 from public.match_curation c
        where c.viewer_id = viewer.id and c.target_id = target.id
      ) then 'human_curated' else 'algorithmic' end
    );
    inserted := inserted + 1;
  end loop;

  return inserted;
end;
$$;

-- SYNTHETIC DEMO seed. Safe for preview projects. Never real members.
insert into public.help_asks (
  id, viewer_id, query_text, intents, parsed_facets, filters, is_demo
)
select
  '50000000-0000-4000-8000-000000000001',
  p.id,
  'I need counsel from someone who has opened a room in a new city',
  array['advice', 'ops']::ask_intent[],
  '{"needs":["counsel","room","city"],"intents":["advice","ops"]}'::jsonb,
  '{}'::jsonb,
  true
from public.profiles p
where p.id = '10000000-0000-4000-8000-000000000001'
on conflict (id) do nothing;
