-- Pre-made MARKS study notes browsed in the Notes page (Study Notes tab).
-- Shared read-only reference content (subject -> chapter -> topic -> note),
-- populated out-of-band by the ingestion script and never written via the app.

create table if not exists public.study_notes (
  id bigserial primary key,
  subject text not null,
  chapter text not null,
  topic text not null,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

-- Indexes backing the subject -> chapter -> topic drill-down in useStudyNotes.
create index if not exists study_notes_subject_idx on public.study_notes(subject);
create index if not exists study_notes_chapter_idx on public.study_notes(subject, chapter);
create index if not exists study_notes_topic_idx   on public.study_notes(subject, chapter, topic);

-- RLS: any signed-in user may read the shared notes; no one writes through the API.
alter table public.study_notes enable row level security;

drop policy if exists study_notes_read_all on public.study_notes;
create policy study_notes_read_all on public.study_notes
  for select to authenticated
  using (true);
