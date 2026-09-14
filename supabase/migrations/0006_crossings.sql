-- Crossings: travel connections, tables, City Hosts, City Notes.
-- City-level presence only. Never live location. DEMO seed is synthetic.

do $$ begin
  create type journey_status as enum ('active', 'paused', 'expired', 'deleted');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type journey_visibility as enum (
    'all_members',
    'meridian_matches',
    'selected_channels',
    'administrators'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type crossing_request_status as enum (
    'proposed',
    'accepted',
    'declined',
    'reschedule_suggested',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type table_join_mode as enum ('request', 'invitation');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type table_status as enum ('suggested', 'open', 'closed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type table_guest_status as enum ('invited', 'requested', 'confirmed', 'declined');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type city_note_kind as enum (
    'restaurant', 'hotel', 'bar', 'gallery', 'club', 'workspace', 'cultural', 'practical'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.travel_match_weights (
  id text primary key default 'default',
  meridian numeric(5,4) not null default 0.4000,
  overlap numeric(5,4) not null default 0.2500,
  intent numeric(5,4) not null default 0.1500,
  complementary numeric(5,4) not null default 0.1000,
  availability numeric(5,4) not null default 0.1000,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.accounts (id),
  constraint travel_match_weights_sum_chk check (
    meridian + overlap + intent + complementary + availability > 0
  )
);

insert into public.travel_match_weights (id) values ('default') on conflict (id) do nothing;

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  destination_city text not null,
  destination_country text not null,
  arrival_date date not null,
  departure_date date not null,
  timezone text not null,
  flexible_dates boolean not null default false,
  availability text[] not null default '{}',
  intents text[] not null default '{}',
  private_note text,
  visibility journey_visibility not null default 'all_members',
  open_to_one_to_one boolean not null default true,
  open_to_group_table boolean not null default false,
  needs_local_recommendation boolean not null default false,
  willing_city_host boolean not null default false,
  selected_channel_ids uuid[] not null default '{}',
  status journey_status not null default 'active',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journeys_dates_chk check (departure_date >= arrival_date),
  constraint journeys_city_level_chk check (
    private_note is null
    or (
      private_note !~* '(flight|flt)\s*[A-Z]{1,3}\s?\d{1,4}'
      and private_note !~* '(room|rm|suite)\s*#?\s*\d{1,5}'
    )
  )
);

create index if not exists journeys_profile_idx on public.journeys (profile_id);
create index if not exists journeys_city_idx on public.journeys (lower(destination_city), status);
create index if not exists journeys_dates_idx on public.journeys (arrival_date, departure_date);

create table if not exists public.crossing_requests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles (id) on delete cascade,
  to_profile_id uuid not null references public.profiles (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  counterpart_journey_id uuid references public.journeys (id) on delete set null,
  format text not null,
  proposed_dates date[] not null default '{}',
  suggested_dates date[] not null default '{}',
  note text,
  status crossing_request_status not null default 'proposed',
  conversation_id uuid,
  conversation_mode text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crossing_not_self check (from_profile_id <> to_profile_id)
);

create table if not exists public.group_tables (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  country text not null,
  neighborhood text not null,
  venue_private text,
  date_time timestamptz not null,
  timezone text not null,
  meal_type text not null,
  theme text,
  max_guests int not null check (max_guests >= 3),
  join_mode table_join_mode not null default 'request',
  status table_status not null default 'open',
  opened_by_profile_id uuid not null references public.profiles (id),
  channel_id uuid references public.channels (id),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_table_guests (
  table_id uuid not null references public.group_tables (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status table_guest_status not null default 'requested',
  created_at timestamptz not null default now(),
  primary key (table_id, profile_id)
);

create table if not exists public.city_hosts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  city text not null,
  country text not null,
  timezone text not null,
  available_from date,
  available_to date,
  recurring boolean not null default true,
  meeting_types text[] not null default '{}',
  expertise text[] not null default '{}',
  welcome_direct_requests boolean not null default true,
  max_requests_per_week int not null default 2 check (max_requests_per_week between 1 and 14),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (profile_id, city, country)
);

create table if not exists public.city_notes (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.profiles (id) on delete cascade,
  city text not null,
  country text not null,
  kind city_note_kind not null,
  title text not null,
  body text not null,
  neighborhood text,
  moderation text not null default 'visible' check (moderation in ('visible', 'hidden')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.city_note_saves (
  note_id uuid not null references public.city_notes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, profile_id)
);

create table if not exists public.travel_notification_prefs (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  overlap_digest boolean not null default true,
  goal_relevance boolean not null default true,
  table_suggestions boolean not null default true,
  request_updates boolean not null default true,
  digest text not null default 'weekly' check (digest in ('off', 'daily', 'weekly'))
);

create table if not exists public.travel_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('overlap', 'goal', 'table', 'request')),
  title text not null,
  body text not null,
  dedupe_key text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (profile_id, dedupe_key)
);

create table if not exists public.travel_match_scores (
  viewer_journey_id uuid not null references public.journeys (id) on delete cascade,
  target_profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  weighted numeric(6,5) not null,
  meridian numeric(6,5) not null,
  overlap numeric(6,5) not null,
  intent numeric(6,5) not null,
  complementary numeric(6,5) not null,
  availability numeric(6,5) not null,
  why text not null,
  explanations jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  primary key (viewer_journey_id, target_profile_id)
);

create table if not exists public.travel_match_feedback (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  signal text not null check (signal in ('relevant', 'not_relevant', 'hidden')),
  created_at timestamptz not null default now()
);

-- Expire travel visibility after the departure civil day in the journey timezone.
create or replace function public.expire_due_journeys()
returns int
language plpgsql
as $$
declare
  n int;
begin
  update public.journeys j
     set status = 'expired',
         updated_at = now()
   where j.status = 'active'
     and (j.departure_date::timestamp at time zone j.timezone + interval '1 day') <= now();
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.journeys_overlap(
  a_arrival date,
  a_depart date,
  a_tz text,
  a_flex boolean,
  b_arrival date,
  b_depart date,
  b_tz text,
  b_flex boolean
) returns boolean
language sql
immutable
as $$
  select
    (a_arrival - case when a_flex then 3 else 0 end)
      < (b_depart + 1 + case when b_flex then 3 else 0 end)
    and
    (b_arrival - case when b_flex then 3 else 0 end)
      < (a_depart + 1 + case when a_flex then 3 else 0 end);
$$;

create or replace function public.member_standing_ok(p_account uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.accounts a
    left join public.memberships m on m.account_id = a.id
    where a.id = p_account
      and a.role in ('member', 'moderator', 'administrator')
      and coalesce(m.status, 'active') not in ('expired', 'suspended', 'canceled', 'cancelled')
  );
$$;

-- RLS
alter table public.travel_match_weights enable row level security;
alter table public.journeys enable row level security;
alter table public.crossing_requests enable row level security;
alter table public.group_tables enable row level security;
alter table public.group_table_guests enable row level security;
alter table public.city_hosts enable row level security;
alter table public.city_notes enable row level security;
alter table public.city_note_saves enable row level security;
alter table public.travel_notification_prefs enable row level security;
alter table public.travel_notifications enable row level security;
alter table public.travel_match_scores enable row level security;
alter table public.travel_match_feedback enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where account_id = public.current_account_id() limit 1;
$$;

create or replace function public.not_blocked(a uuid, b uuid)
returns boolean
language sql
stable
as $$
  select not exists (
    select 1 from public.blocks bl
    join public.profiles pa on pa.account_id = bl.blocker_id
    join public.profiles pb on pb.account_id = bl.blocked_id
    where (pa.id = a and pb.id = b) or (pa.id = b and pb.id = a)
  );
$$;

-- Journeys: owner always; others if active, not expired, visibility, not blocked, standing ok.
create policy journeys_select on public.journeys
  for select using (
    profile_id = public.current_profile_id()
    or public.is_staff()
    or (
      public.is_member()
      and status = 'active'
      and (departure_date::timestamp at time zone timezone + interval '1 day') > now()
      and public.not_blocked(public.current_profile_id(), profile_id)
      and (
        visibility = 'all_members'
        or (visibility = 'administrators' and public.is_staff())
        or (
          visibility = 'meridian_matches'
          and exists (
            select 1 from public.match_scores ms
            where ms.viewer_id = public.current_profile_id()
              and ms.target_id = journeys.profile_id
          )
        )
        or (
          visibility = 'selected_channels'
          and exists (
            select 1 from public.channels c
            where c.id = any (journeys.selected_channel_ids)
              and public.is_member()
          )
        )
      )
    )
  );

create policy journeys_write_owner on public.journeys
  for insert with check (profile_id = public.current_profile_id() and public.is_member());

create policy journeys_update_owner on public.journeys
  for update using (profile_id = public.current_profile_id() or public.is_staff())
  with check (profile_id = public.current_profile_id() or public.is_staff());

-- Crossing requests: parties + staff. Conversation only after accept (enforced in app + check).
create policy crossing_requests_select on public.crossing_requests
  for select using (
    from_profile_id = public.current_profile_id()
    or to_profile_id = public.current_profile_id()
    or public.is_staff()
  );

create policy crossing_requests_insert on public.crossing_requests
  for insert with check (
    from_profile_id = public.current_profile_id()
    and public.is_member()
    and public.not_blocked(from_profile_id, to_profile_id)
  );

create policy crossing_requests_update on public.crossing_requests
  for update using (
    from_profile_id = public.current_profile_id()
    or to_profile_id = public.current_profile_id()
    or public.is_staff()
  );

-- Tables: members may read neighborhood, not venue, unless confirmed.
create policy group_tables_select on public.group_tables
  for select using (public.is_member() or public.is_staff());

create policy group_tables_write on public.group_tables
  for all using (
    opened_by_profile_id = public.current_profile_id() or public.is_staff()
  )
  with check (
    opened_by_profile_id = public.current_profile_id() or public.is_staff()
  );

create policy group_table_guests_select on public.group_table_guests
  for select using (
    public.is_member()
    and (
      profile_id = public.current_profile_id()
      or public.is_staff()
      or exists (
        select 1 from public.group_tables t
        where t.id = table_id
          and t.opened_by_profile_id = public.current_profile_id()
      )
    )
  );

create policy group_table_guests_write on public.group_table_guests
  for all using (
    profile_id = public.current_profile_id() or public.is_staff()
    or exists (
      select 1 from public.group_tables t
      where t.id = table_id and t.opened_by_profile_id = public.current_profile_id()
    )
  )
  with check (
    profile_id = public.current_profile_id() or public.is_staff()
    or exists (
      select 1 from public.group_tables t
      where t.id = table_id and t.opened_by_profile_id = public.current_profile_id()
    )
  );

-- Hide exact venue from non-confirmed guests via a view.
create or replace view public.group_tables_public
with (security_invoker = true) as
select
  t.id,
  t.city,
  t.country,
  t.neighborhood,
  case
    when public.is_staff()
      or t.opened_by_profile_id = public.current_profile_id()
      or exists (
        select 1 from public.group_table_guests g
        where g.table_id = t.id
          and g.profile_id = public.current_profile_id()
          and g.status = 'confirmed'
      )
    then t.venue_private
    else null
  end as venue_private,
  t.date_time,
  t.timezone,
  t.meal_type,
  t.theme,
  t.max_guests,
  t.join_mode,
  t.status,
  t.opened_by_profile_id,
  t.channel_id,
  t.is_demo,
  t.created_at
from public.group_tables t;

create policy city_hosts_select on public.city_hosts
  for select using (public.is_member() or public.is_staff());

create policy city_hosts_write on public.city_hosts
  for all using (profile_id = public.current_profile_id() or public.is_staff())
  with check (profile_id = public.current_profile_id() or public.is_staff());

create policy city_notes_select on public.city_notes
  for select using (
    public.is_member()
    and moderation = 'visible'
  );

create policy city_notes_write on public.city_notes
  for insert with check (author_profile_id = public.current_profile_id() and public.is_member());

create policy city_notes_staff on public.city_notes
  for update using (public.is_staff())
  with check (public.is_staff());

create policy city_note_saves_owner on public.city_note_saves
  for all using (profile_id = public.current_profile_id() or public.is_staff())
  with check (profile_id = public.current_profile_id() or public.is_staff());

create policy travel_prefs_owner on public.travel_notification_prefs
  for all using (profile_id = public.current_profile_id() or public.is_staff())
  with check (profile_id = public.current_profile_id() or public.is_staff());

create policy travel_notifications_owner on public.travel_notifications
  for select using (profile_id = public.current_profile_id() or public.is_staff());

create policy travel_match_scores_viewer on public.travel_match_scores
  for select using (
    viewer_journey_id in (select id from public.journeys where profile_id = public.current_profile_id())
    or public.is_staff()
  );

create policy travel_match_feedback_viewer on public.travel_match_feedback
  for all using (viewer_id = public.current_profile_id() or public.is_staff())
  with check (viewer_id = public.current_profile_id() or public.is_staff());

create policy travel_weights_read on public.travel_match_weights
  for select using (public.is_staff() or public.is_member());

create policy travel_weights_write on public.travel_match_weights
  for update using (public.current_role() = 'administrator');

-- Deny Open House / anon: no policies for anon. City Notes are never public.

-- Synthetic DEMO seed (safe for preview projects).
insert into public.accounts (id, email, full_name, role, is_demo)
values
  ('00000000-0000-4000-8000-000000000001', 'demo.voss@preview.10thmeridian.test', 'A. Voss', 'member', true),
  ('00000000-0000-4000-8000-000000000009', 'demo.moreau@preview.10thmeridian.test', 'C. Moreau', 'member', true),
  ('00000000-0000-4000-8000-000000000012', 'demo.adler@preview.10thmeridian.test', 'P. Adler', 'member', true)
on conflict (email) do nothing;

insert into public.profiles (id, account_id, display_name, city, country, timezone, headline, is_demo)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'A. Voss', 'Chicago', 'United States', 'America/Chicago', 'DEMO operator', true),
  ('10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000009', 'C. Moreau', 'Paris', 'France', 'Europe/Paris', 'DEMO cultural lead', true),
  ('10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000012', 'P. Adler', 'New York', 'United States', 'America/New_York', 'DEMO advisor', true)
on conflict (account_id) do nothing;

insert into public.journeys (
  id, profile_id, destination_city, destination_country, arrival_date, departure_date,
  timezone, flexible_dates, availability, intents, private_note, visibility,
  open_to_one_to_one, open_to_group_table, needs_local_recommendation, is_demo
) values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Paris', 'France', '2026-10-12', '2026-10-18',
  'Europe/Paris', false, array['coffee','walk','dinner'], array['professional','cultural'],
  'DEMO private note — looking for a quiet table.',
  'all_members', true, true, true, true
) on conflict (id) do nothing;

insert into public.city_hosts (
  id, profile_id, city, country, timezone, recurring, meeting_types, expertise,
  welcome_direct_requests, max_requests_per_week, is_demo
) values (
  '30000000-0000-4000-8000-000000000009',
  '10000000-0000-4000-8000-000000000009',
  'Paris', 'France', 'Europe/Paris', true,
  array['coffee','walk','dinner'], array['salons','archives'],
  true, 2, true
) on conflict (profile_id, city, country) do nothing;

insert into public.city_notes (
  id, author_profile_id, city, country, kind, title, body, neighborhood, is_demo
) values (
  '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000009',
  'Paris', 'France', 'restaurant',
  'A courtyard that still serves lunch to people who read',
  'DEMO recommendation. Neighborhood only. Never a live location.',
  'Saint-Germain', true
) on conflict (id) do nothing;
