-- Synthetic DEMO seed. Safe to load in preview projects.
-- Never treat these rows as real members.

insert into public.channels (slug, name, kind, topic, is_demo)
values
  ('announcements', 'Announcements', 'broadcast', 'Steward notes. DEMO.', true),
  ('introductions', 'Introductions', 'public', 'How one arrives. DEMO.', true),
  ('ask-and-offer', 'Ask & Offer', 'public', 'Reciprocity. DEMO.', true),
  ('opportunities', 'Opportunities', 'public', 'Work worth sharing. DEMO.', true),
  ('events', 'Events', 'public', 'Gatherings ahead. DEMO.', true),
  ('travel', 'Travel', 'public', 'Overlapping routes. DEMO.', true),
  ('ideas', 'Ideas', 'public', 'Unfinished thoughts. DEMO.', true),
  ('chapter-chicago', 'Chapter · Chicago', 'chapter', 'Admin-created geo chapter. DEMO.', true)
on conflict (slug) do nothing;

insert into public.referrals (code, token_hash, label, max_uses, use_count, is_demo)
values
  (
    'TENTH-EARLY',
    encode(digest('demo-token-tenth-early', 'sha256'), 'hex'),
    'TEST-ONLY Open House early access',
    50,
    3,
    true
  )
on conflict (code) do nothing;
