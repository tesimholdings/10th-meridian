-- Approved Lifetime membership: $10,000 one-time.
-- Monthly products are not public yet. Keep founding/standard columns as aliases.

do $$ begin
  alter type membership_product add value 'lifetime';
exception
  when duplicate_object then null;
end $$;

alter table public.site_config
  add column if not exists lifetime_price_label text not null default '$10,000',
  add column if not exists stripe_lifetime_price_id text;

update public.site_config
set
  founding_price_label = '$10,000',
  standard_price_label = '$10,000',
  lifetime_price_label = coalesce(nullif(lifetime_price_label, ''), '$10,000')
where id = 'default';
