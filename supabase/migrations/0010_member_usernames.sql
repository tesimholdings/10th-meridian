-- Username sign-in for real members.
-- Apply in the Supabase SQL editor after 0009_stripe_membership.sql.
-- Does not insert passwords. Auth users are created with the service role.

alter table public.accounts
  add column if not exists username text;

alter table public.profiles
  add column if not exists username text;

alter table public.profiles
  add column if not exists role public.app_role;

comment on column public.accounts.username is
  'Sign-in handle. Case-insensitive. Resolved to auth.users email.';

comment on column public.profiles.username is
  'Same handle as accounts.username. Explicit member identity.';

comment on column public.profiles.role is
  'Explicit house role. administrator is steward. Prefer this over demo aliases.';

create unique index if not exists accounts_username_lower_idx
  on public.accounts (lower(username))
  where username is not null;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.accounts
  drop constraint if exists accounts_username_format;

alter table public.accounts
  add constraint accounts_username_format
  check (username is null or username ~ '^[a-z0-9][a-z0-9._-]{1,62}$');

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9][a-z0-9._-]{1,62}$');

-- Members can update their own account and profile. They must not promote
-- themselves to steward or claim another person's username.
create or replace function public.protect_account_sign_in()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role'
     or current_user in ('service_role', 'supabase_admin', 'postgres')
     or public.is_staff() then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.role := old.role;
    new.username := old.username;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_account_sign_in on public.accounts;
create trigger protect_account_sign_in
  before update on public.accounts
  for each row
  execute function public.protect_account_sign_in();

create or replace function public.protect_profile_sign_in()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role'
     or current_user in ('service_role', 'supabase_admin', 'postgres')
     or public.is_staff() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.role := coalesce(
      (select role from public.accounts where id = new.account_id),
      'member'::public.app_role
    );
    new.username := null;
    return new;
  end if;
  new.role := old.role;
  new.username := old.username;
  return new;
end;
$$;

drop trigger if exists protect_profile_sign_in on public.profiles;
create trigger protect_profile_sign_in
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_sign_in();

-- Account and profile rows for the four real sign-in handles.
-- Auth users and passwords are created out of band. This does not set a password.
do $$
declare
  seed record;
  account_id uuid;
begin
  for seed in
    select *
    from (
      values
        (null::uuid, 'stefanfulks@tenmeridian.com', 'Stefan Fulks', 'administrator'::public.app_role, 'stefanfulks'),
        (null::uuid, 'rickydelvalle@tenmeridian.com', 'Ricky Del Valle', 'member'::public.app_role, 'rickydelvalle'),
        ('1f8b496d-38f4-4346-9cc2-080d335a3fbf'::uuid, 'tenthmeridian@tenmeridian.com', 'Tenth Meridian', 'administrator'::public.app_role, 'tenthmeridian'),
        ('9b67ed84-74ff-433a-8cab-d992f3992986'::uuid, 'patrickromero@tenmeridian.com', 'Patrick Romero', 'member'::public.app_role, 'patrickromero')
    ) as directory (user_id, email, full_name, role, username)
  loop
    select a.id
      into account_id
    from public.accounts a
    where lower(a.email) = lower(seed.email)
       or (seed.user_id is not null and a.user_id = seed.user_id)
       or lower(a.username) = seed.username
    limit 1;

    if account_id is null then
      insert into public.accounts (user_id, email, full_name, role, username, is_demo)
      values (seed.user_id, seed.email, seed.full_name, seed.role, seed.username, false)
      returning id into account_id;
    else
      update public.accounts
      set
        user_id = coalesce(seed.user_id, user_id),
        email = seed.email,
        full_name = seed.full_name,
        role = seed.role,
        username = seed.username,
        is_demo = false
      where id = account_id;
    end if;

    insert into public.profiles (
      account_id, display_name, username, role, is_demo, visibility
    )
    values (
      account_id, seed.full_name, seed.username, seed.role, false, 'members'
    )
    on conflict (account_id) do update
    set
      display_name = excluded.display_name,
      username = excluded.username,
      role = excluded.role,
      is_demo = false;
  end loop;
end $$;
