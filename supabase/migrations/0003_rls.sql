alter table public.accounts enable row level security;
alter table public.site_config enable row level security;
alter table public.cohorts enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_redemptions enable row level security;
alter table public.applications enable row level security;
alter table public.reminders enable row level security;
alter table public.memberships enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.introductions enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.audit_log enable row level security;
alter table public.channels enable row level security;
alter table public.matching_weights enable row level security;
alter table public.match_scores enable row level security;
alter table public.match_feedback enable row level security;
alter table public.match_curation enable row level security;

create or replace function public.current_account_id()
returns uuid
language sql
stable
as $$
  select id from public.accounts where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_role()
returns app_role
language sql
stable
as $$
  select coalesce(
    (select role from public.accounts where user_id = auth.uid() limit 1),
    'guest'::app_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select public.current_role() in ('moderator', 'administrator');
$$;

create or replace function public.is_member()
returns boolean
language sql
stable
as $$
  select public.current_role() in ('member', 'moderator', 'administrator');
$$;

-- Accounts
create policy accounts_self_read on public.accounts
  for select using (user_id = auth.uid() or public.is_staff());

create policy accounts_self_update on public.accounts
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Profiles: members may read non-hidden member profiles. Never public.
create policy profiles_member_read on public.profiles
  for select using (
    public.is_member()
    and visibility <> 'hidden'
  );

create policy profiles_self_write on public.profiles
  for all using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

create policy profiles_staff on public.profiles
  for all using (public.is_staff())
  with check (public.is_staff());

-- Applications: owner + staff
create policy applications_owner on public.applications
  for all using (
    email = (select email from public.accounts where user_id = auth.uid())
    or public.is_staff()
  )
  with check (
    email = (select email from public.accounts where user_id = auth.uid())
    or public.is_staff()
  );

-- Memberships: owner + staff
create policy memberships_owner on public.memberships
  for select using (
    account_id = public.current_account_id() or public.is_staff()
  );

-- Referrals: creators and staff; hashes only
create policy referrals_staff on public.referrals
  for all using (public.is_staff())
  with check (public.is_staff());

create policy referrals_creator_read on public.referrals
  for select using (created_by = public.current_account_id());

-- Match scores: viewer only
create policy match_scores_viewer on public.match_scores
  for select using (
    viewer_id in (select id from public.profiles where account_id = public.current_account_id())
    or public.is_staff()
  );

create policy match_feedback_viewer on public.match_feedback
  for all using (
    viewer_id in (select id from public.profiles where account_id = public.current_account_id())
    or public.is_staff()
  )
  with check (
    viewer_id in (select id from public.profiles where account_id = public.current_account_id())
    or public.is_staff()
  );

create policy match_curation_staff on public.match_curation
  for all using (public.is_staff())
  with check (public.is_staff());

create policy matching_weights_read on public.matching_weights
  for select using (public.is_staff());

create policy matching_weights_write on public.matching_weights
  for update using (public.current_role() = 'administrator');

-- Events
create policy events_member_read on public.events
  for select using (public.is_member() or public.is_staff());

create policy events_staff_write on public.events
  for all using (public.is_staff())
  with check (public.is_staff());

create policy event_reg_owner on public.event_registrations
  for all using (
    account_id = public.current_account_id() or public.is_staff()
  )
  with check (
    account_id = public.current_account_id() or public.is_staff()
  );

-- Site config readable by staff only (server uses service role / env)
create policy site_config_staff on public.site_config
  for all using (public.is_staff())
  with check (public.current_role() = 'administrator');

create policy audit_staff on public.audit_log
  for select using (public.current_role() = 'administrator');

create policy channels_member_read on public.channels
  for select using (public.is_member());

create policy channels_staff_write on public.channels
  for all using (public.is_staff())
  with check (public.is_staff());

create policy introductions_parties on public.introductions
  for all using (
    requester_id = public.current_account_id()
    or target_id = public.current_account_id()
    or public.is_staff()
  )
  with check (requester_id = public.current_account_id() or public.is_staff());

create policy blocks_owner on public.blocks
  for all using (blocker_id = public.current_account_id() or public.is_staff())
  with check (blocker_id = public.current_account_id() or public.is_staff());

create policy reports_owner on public.reports
  for all using (reporter_id = public.current_account_id() or public.is_staff())
  with check (reporter_id = public.current_account_id() or public.is_staff());

create policy reminders_insert_anon on public.reminders
  for insert
  to anon, authenticated
  with check (email is not null);

create policy reminders_staff_read on public.reminders
  for select using (public.is_staff());

-- Deny-by-default: no public read of private tables for anon besides reminders insert.
