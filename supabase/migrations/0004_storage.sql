-- Storage buckets (stubs). Create from the Supabase dashboard or CLI as well.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('channel-attachments', 'channel-attachments', false, 15728640, array[
    'image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'
  ]::text[]),
  ('event-media', 'event-media', false, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']::text[])
on conflict (id) do nothing;

-- Members may upload their own avatar object prefixed by account id.
create policy avatars_owner_read on storage.objects
  for select using (
    bucket_id = 'avatars'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.accounts a
        where a.user_id = auth.uid()
          and a.role in ('member', 'moderator', 'administrator')
      )
    )
  );

create policy avatars_owner_write on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy attachments_member_read on storage.objects
  for select using (
    bucket_id = 'channel-attachments'
    and exists (
      select 1 from public.accounts a
      where a.user_id = auth.uid()
        and a.role in ('member', 'moderator', 'administrator')
    )
  );

create policy attachments_member_write on storage.objects
  for insert with check (
    bucket_id = 'channel-attachments'
    and exists (
      select 1 from public.accounts a
      where a.user_id = auth.uid()
        and a.role in ('member', 'moderator', 'administrator')
    )
  );
