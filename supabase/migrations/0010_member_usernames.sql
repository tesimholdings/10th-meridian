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
