-- Per-user notes created in the Notes page (My Notes tab). Rich-text content
-- plus file attachments stored as JSON metadata ({name, url, type}); the files
-- themselves live in Cloudinary, so only their URLs are persisted here.

create table if not exists public.notes (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  subject text not null,
  chapter text,
  topic text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notes_user_subject_idx on public.notes(user_id, subject);
create index if not exists notes_user_chapter_idx on public.notes(user_id, chapter);
create index if not exists notes_user_topic_idx   on public.notes(user_id, topic);

-- RLS: a user may only read/write their own notes.
alter table public.notes enable row level security;

drop policy if exists notes_owner_select on public.notes;
create policy notes_owner_select on public.notes
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notes_owner_insert on public.notes;
create policy notes_owner_insert on public.notes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists notes_owner_update on public.notes;
create policy notes_owner_update on public.notes
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notes_owner_delete on public.notes;
create policy notes_owner_delete on public.notes
  for delete to authenticated
  using (user_id = auth.uid());
