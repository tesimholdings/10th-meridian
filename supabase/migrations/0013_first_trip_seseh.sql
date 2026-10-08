-- First real Crossing: Seseh, Bali — The Villa Week.
-- Run after 0012_attendance_and_portrait.sql (host_account_id).
-- Additive and idempotent. No registrations. Capacity 8.
-- Waitlist begins in the app once registered count reaches capacity.
-- host_account_id stays null: no member account maps to Brian.
-- price_label is display only. Do not attach a Stripe price.

alter table public.events
  add column if not exists price_label text,
  add column if not exists host_name text,
  add column if not exists long_description text,
  add column if not exists details jsonb;

comment on column public.events.price_label is
  'Shown price only. Not a Stripe Price. Trip payment is not collected here.';

comment on column public.events.host_name is
  'Display host when no member account is linked. Leave host_account_id null until a real account exists.';

insert into public.events (
  id,
  title,
  kind,
  summary,
  city,
  starts_at,
  ends_at,
  capacity,
  stripe_price_id,
  channel_slug,
  is_demo,
  host_account_id,
  price_label,
  host_name,
  long_description,
  details
) values (
  'c5e5e000-2026-426a-8b11-5e5e00000001',
  'Seseh, Bali: The Villa Week',
  'trip',
  'Seven days at an eight-bedroom sea-view estate in Seseh. Five activity days. Hosted by Brian.',
  'Seseh',
  timestamptz '2026-10-26 09:00:00+08',
  timestamptz '2026-11-02 18:00:00+08',
  8,
  null,
  'events',
  false,
  null,
  '€9,000',
  'Brian',
  'A 10th Meridian Crossing hosted by Brian. Guests arrive Monday 26 October 2026 and fly out Monday 2 November 2026. The week is subject to change.',
  jsonb_build_object(
    'place', 'Seseh, Bali',
    'price', '€9,000 per guest',
    'currency', 'EUR',
    'founders', 8,
    'activityDays', 5,
    'scheduleNote', 'Subject to change.',
    'included', jsonb_build_array(
      'Five full days of experiences',
      'Healthy meals, managed',
      'Airport and scheduled activity transfers for the group'
    ),
    'days', jsonb_build_array(
      'Day 1 Mon Oct 26 Arrival',
      'Day 2 Tue Oct 27 Box and Snakes Day',
      'Day 3 Wed Oct 28 Boat Day',
      'Day 4 Thu Oct 29 Reset Day',
      'Day 5 Fri Oct 30 Uluwatu Day',
      'Day 6 Sat Oct 31 Unlock Day',
      'Day 7 Sun Nov 1 Beach Club Day',
      'Day 8 Mon Nov 2 Last day'
    )
  )
)
on conflict (id) do nothing;
