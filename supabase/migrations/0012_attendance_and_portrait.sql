-- Attendance waitlist promotion and signup portraits.
-- Additive. Stefan: run this before live promote / portrait writes.
-- The preview house already keeps the same state in memory.

alter table public.event_registrations
  add column if not exists waitlist_position int,
  add column if not exists promoted_at timestamptz,
  add column if not exists promoted_by uuid references public.accounts (id);

comment on column public.event_registrations.status is
  'registered or waitlist. Promote sets status to registered, stamps promoted_at / promoted_by, and clears waitlist_position. A host or steward may promote even when the listing is at capacity.';

comment on column public.event_registrations.waitlist_position is
  '1-based order among waitlisted registrations for the event. Null once the member is registered.';

alter table public.events
  add column if not exists host_account_id uuid references public.accounts (id);

comment on column public.events.host_account_id is
  'Member who hosts the listing. They, plus stewards and administrators, may promote from the waitlist.';

alter table public.profiles
  add column if not exists portrait_url text;

comment on column public.profiles.portrait_url is
  'Square portrait from signup. Store a public portfolio URL, never a password or a raw camera roll dump. Labeled sample previews stay on /media/demo/.';
